import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/ui/Input';
import Orbs from '../../components/ui/Orbs';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

const VerifyEmail = () => {

  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const [isResending, setIsResending] = useState(false);


  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/auth/verify-email', data);
      toast.success('Email verified successfully!');
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await axiosInstance.post('/auth/resend-verification');
      toast.success('New code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-primary relative overflow-hidden">
      <Orbs />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col gap-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center text-success mx-auto mb-6">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-4xl font-black font-syne uppercase tracking-tight">Verify <span className="text-success">Email</span></h2>
            <p className="text-white/40 mt-2 font-medium text-sm">Enter the 6-digit code sent to your email address</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input 
              label="Verification Code"
              placeholder="000000"
              {...register('code')}
              error={errors.code?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10 text-center text-3xl tracking-[0.5em] font-black"
              maxLength={6}
            />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all mt-2"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Account'}
            </motion.button>
          </form>

          <p className="text-center text-[10px] font-black text-white/20 uppercase tracking-widest">
            Didn't receive the code? 
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-accent hover:text-white transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};


export default VerifyEmail;
