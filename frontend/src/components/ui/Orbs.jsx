import { motion } from 'framer-motion';

const Orbs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[
      { size: 420, top: '-10%', left: '-8%', color: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' },
      { size: 350, top: '30%', right: '-6%', color: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)' },
      { size: 280, bottom: '10%', left: '30%', color: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' },
    ].map((o, i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
        style={{
          position: 'absolute',
          width: o.size,
          height: o.size,
          top: o.top,
          left: o.left,
          right: o.right,
          bottom: o.bottom,
          background: o.color,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
    ))}
  </div>
);

export default Orbs;
