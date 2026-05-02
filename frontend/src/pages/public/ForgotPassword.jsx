import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/ui/Input';
import Orbs from '../../components/ui/Orbs';
import { Mail, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/auth/forgot-password', data);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
          <Link to="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
              <Mail size={28} />
            </div>
            <h2 className="text-4xl font-black font-syne uppercase tracking-tight">Forgot <span className="text-accent">Password</span></h2>
            <p className="text-white/40 mt-2 font-medium text-sm">Enter your email and we'll send you a recovery link</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input 
              label="Email Address"
              placeholder="hello@email.com"
              {...register('email')}
              error={errors.email?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
            />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all mt-2"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
