import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/ui/Input';
import Orbs from '../../components/ui/Orbs';
import { Lock } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.patch(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
            <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary mx-auto mb-6">
              <Lock size={28} />
            </div>
            <h2 className="text-4xl font-black font-syne uppercase tracking-tight">Reset <span className="text-secondary">Password</span></h2>
            <p className="text-white/40 mt-2 font-medium text-sm">Create a new secure password for your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input 
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
            />
            <Input 
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
            />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all mt-2"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
