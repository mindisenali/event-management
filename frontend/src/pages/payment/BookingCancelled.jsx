import { motion } from 'framer-motion';
import Orbs from '../../components/ui/Orbs';

const BookingCancelled = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-primary relative overflow-hidden">
      <Orbs />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-10"
      >
        <div className="w-24 h-24 bg-error rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,68,68,0.2)]">
          <XCircle className="text-white w-12 h-12" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-black font-syne uppercase tracking-tighter">Order <span className="text-error">Cancelled</span></h1>
          <p className="text-white/40 text-lg font-medium leading-relaxed">
            Your transaction was not completed. No funds were captured, and your seats have been released.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Link to="/events" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> All Events
            </motion.button>
          </Link>
          <Link to="/" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-2xl hover:shadow-white/10 transition-all"
            >
              Back to Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};


export default BookingCancelled;
