import { motion } from 'framer-motion';
import Orbs from '../../components/ui/Orbs';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-primary relative overflow-hidden">
      <Orbs />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center gap-8"
      >
        <h1 className="text-[12rem] md:text-[18rem] font-black font-syne text-white/5 leading-none select-none">404</h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col gap-4">
          <h2 className="text-4xl md:text-6xl font-black font-syne uppercase tracking-tighter">Lost in <span className="text-accent">Space?</span></h2>
          <p className="text-white/40 text-lg font-medium max-w-md mx-auto leading-relaxed">
            This stage seems to be empty. Let's get you back to the main event.
          </p>
          <Link to="/" className="mt-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase shadow-2xl hover:shadow-white/10 transition-all"
            >
              Return Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};


export default NotFound;
