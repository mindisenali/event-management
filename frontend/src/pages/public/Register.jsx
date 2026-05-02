import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

import Orbs from '../../components/ui/Orbs';

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const Register = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post('/auth/register', { ...data, role: 'user' });
      setUser(res.data);
      toast.success('Account created! Please check your email for the verification code.');
      navigate('/verify-email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-primary relative overflow-hidden">
      <Orbs />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-4xl font-black font-syne uppercase tracking-tight">Create <span className="text-accent">Account</span></h2>
            <p className="text-white/40 mt-2 font-medium">Start your extraordinary journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" autoComplete="off">
            <Input 
              label="Full Name"
              placeholder="John Doe"
              {...register('name')}
              error={errors.name?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
              onFocus={(e) => e.target.removeAttribute('readonly')}
              readOnly
            />
            <Input 
              label="Email Address"
              placeholder="hello@email.com"
              {...register('email')}
              error={errors.email?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
              onFocus={(e) => e.target.removeAttribute('readonly')}
              readOnly
            />
            <Input 
              label="Phone (Optional)"
              placeholder="+1 234 567 890"
              {...register('phone')}
              error={errors.phone?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
              onFocus={(e) => e.target.removeAttribute('readonly')}
              readOnly
            />
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              className="bg-white/5 border-white/10 focus:bg-white/10"
              onFocus={(e) => e.target.removeAttribute('readonly')}
              readOnly
            />


            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all mt-4"
            >
              {isSubmitting ? 'Creating...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center text-xs font-bold text-white/40 uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-accent hover:text-white transition-colors ml-1">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};


export default Register;
