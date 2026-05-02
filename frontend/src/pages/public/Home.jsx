import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, TrendingUp, ArrowRight, Star, Zap, Music, Mic, Globe, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import Orbs from '../../components/ui/Orbs';

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'concert', label: 'Concerts' },
  { id: 'theatre', label: 'Theatre' },
  { id: 'family', label: 'Family' },
  { id: 'festival', label: 'Festivals' },
  { id: 'tech', label: 'Tech Stack' },
];


const REVIEWS = [
  { name: 'Sarah J.', role: 'Power User', avatar: 'https://i.pravatar.cc/150?u=1', rating: 5, comment: 'Eventify has completely changed how I discover live music. The interface is stunning and booking takes seconds!' },
  { name: 'Marcus T.', role: 'Event Organizer', avatar: 'https://i.pravatar.cc/150?u=2', rating: 5, comment: 'As an organizer, I love the analytics and the seamless check-in process. The best platform for events in the market.' },
  { name: 'Elena R.', role: 'Frequent Traveler', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5, comment: 'Secure payments and instant ticket delivery. I never have to worry about my passes when using Eventify.' },
  { name: 'David K.', role: 'Community Lead', avatar: 'https://i.pravatar.cc/150?u=4', rating: 5, comment: 'Finally an event platform that feels premium. The dark mode design and animations make it a joy to use.' },
];


const fadeUp = {
  hidden: { opacity: 0, y: 32 },

  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Event Card ─── */
const EventCard = ({ event, index }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors duration-300 cursor-pointer"
  >
    <Link to={`/events/${event._id}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className={`absolute top-4 left-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full`}>
          {event.category.toUpperCase()}
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold">4.9</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base font-bold leading-snug group-hover:text-white transition-colors">{event.title}</h3>
          <span className="text-accent font-extrabold text-lg shrink-0">LKR {event.price}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-white/30" />
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-white/30" />
            {event.venue.city}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-1 w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:bg-white hover:text-black hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          Book Now
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </motion.button>
      </div>
    </Link>
  </motion.div>
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── Scroll-Down Indicator ─── */
const ScrollHint = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 2.2, duration: 0.6 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
  >
    <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
      <ChevronDown size={18} />
    </motion.div>
  </motion.div>
);

const BroadcastNotice = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/10 border-y border-accent/20 py-3 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
        <div className="bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 shrink-0">
          <Zap size={12} className="fill-white" /> Broadcast
        </div>
        
        <div className="flex-1 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap"
          >
            {[...events, ...events, ...events].map((event, i) => (
              <Link 
                key={i} 
                to={`/events/${event._id}`}
                className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-3"
              >
                <span className="text-white/40">•</span>
                Exciting News! <span className="text-accent">{event.title}</span> is now Rescheduled and Open for Booking!
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-primary to-transparent z-10 hidden md:block" />
      </div>
    </motion.div>
  );
};

/* ─── Main Component ─── */
const Home = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const { data: eventsData } = useQuery({
    queryKey: ['featured-events'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/events?limit=20');
      return data.data.events;
    }
  });

  const { data: publicReviews } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/reviews');
      return data;
    }
  });

  const { data: statsData } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/events/stats/public');
      return data;
    }
  });

  const { data: rescheduledEvents } = useQuery({
    queryKey: ['rescheduled-events'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/events?isRescheduled=true&limit=5');
      return data.data.events;
    }
  });

  const filteredEvents = activeTab === 'all' 
    ? eventsData?.slice(0, 6) 
    : eventsData?.filter(e => e.category === activeTab).slice(0, 6);

  const displayReviews = publicReviews?.length > 0 ? publicReviews : REVIEWS;

  const stats = [
    { icon: <Calendar size={22} className="text-violet-400" />, value: `${statsData?.totalEvents?.toLocaleString()}+` || '100+', label: 'Events Hosted', gradient: 'from-violet-600/10 to-purple-600/5' },
    { icon: <Users size={22} className="text-cyan-400" />, value: `${statsData?.totalTickets?.toLocaleString()}+` || '500+', label: 'Tickets Sold', gradient: 'from-cyan-600/10 to-blue-600/5' },
    { icon: <TrendingUp size={22} className="text-rose-400" />, value: `${statsData?.totalCities?.toLocaleString()}+` || '10+', label: 'Cities Worldwide', gradient: 'from-rose-600/10 to-pink-600/5' },
  ];


  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchVal) params.append('search', searchVal);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-28 pb-28 bg-primary min-h-screen">
      <div className="fixed top-20 left-0 right-0 z-40">
        <BroadcastNotice events={rescheduledEvents} />
      </div>

      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: bgY, opacity: bgOpacity }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=3000"
            alt="Event Background"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-primary" />
          <div className="absolute inset-0 bg-primary/30" />
        </motion.div>

        <Orbs />

        <motion.div
          style={{ y: textY }}
          className="relative z-10 max-w-5xl w-full mx-auto px-6 flex flex-col items-center text-center gap-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white/70 text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            The Future of Live Events
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase font-syne leading-[0.9]">
              Event
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-accent to-pink-500">ify</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-400 to-pink-500 origin-left"
                />
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Discover and book the world's most extraordinary concerts, festivals, and conferences — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl mt-2"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 bg-white/8 backdrop-blur-2xl border border-white/12 rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 px-4 flex-1 min-w-0">
                <Search className="text-accent shrink-0" size={18} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search events, artists, venues..."
                  className="bg-transparent outline-none w-full py-3.5 text-base text-white placeholder:text-white/30 font-medium"
                />
              </div>
              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-accent font-bold text-sm tracking-wide text-white shadow-lg shadow-accent/30 flex items-center gap-2 justify-center w-full md:w-auto"
              >
                <Search size={22} />
              </motion.button>
            </div>
          </motion.div>



        </motion.div>

        <ScrollHint />
      </section>

      <section className="max-w-6xl mx-auto w-full px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat, idx) => (

            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              whileHover={{ y: -6 }}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-8 flex items-center gap-6`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                <p className="text-white/40 text-sm font-medium mt-0.5">{stat.label}</p>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── LATEST EVENTS SECTION (Photo Style) ── */}
      <section className="max-w-6xl mx-auto w-full px-6 flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
            <span className="text-accent">Latest</span> Events
          </h2>

          {/* Tab Navigation */}
          <div className="flex items-center gap-10 border-b border-white/5 pb-0 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`relative pb-4 text-sm font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap ${activeTab === cat.id ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                {cat.label}
                {activeTab === cat.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {filteredEvents?.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
            
            {filteredEvents?.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10 rounded-[2.5rem] bg-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                  <Calendar size={32} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">No events found</p>
                  <p className="text-sm text-white/40">Check back later for new experiences in this category</p>
                </div>
              </div>
            )}

            {!eventsData && [1,2,3].map(i => (
              <div key={i} className="aspect-[16/10] bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>


      {/* ── REVIEWS / FEEDBACK ── */}
      <section className="flex flex-col gap-12 overflow-hidden py-10">
        <div className="max-w-6xl mx-auto w-full px-6 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2">What Our Attendees Say</h2>
        </div>

        <div className="relative flex overflow-hidden">
          {/* Marquee Container */}
          <motion.div 
            animate={{ x: [0, -1035 * 2] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[...displayReviews, ...displayReviews, ...displayReviews, ...displayReviews].map((rev, i) => (
              <div 
                key={i}
                className="w-[350px] shrink-0 bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl"
              >
                <div className="text-center flex flex-col gap-2">
                  <p className="text-2xl font-black text-white font-syne">{rev.user?.name || rev.name}</p>
                  <p className="text-[10px] text-accent uppercase font-black tracking-widest truncate">{rev.event?.title || rev.role}</p>
                </div>
                
                <p className="text-white/60 text-base text-center leading-relaxed whitespace-normal font-medium h-[4.5rem] overflow-hidden">
                  "{rev.comment}"
                </p>

                <div className="flex gap-1.5 mt-auto pt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={28} className={i < rev.rating ? "fill-[#FFB800] text-[#FFB800]" : "text-white/10"} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}

      <section className="max-w-6xl mx-auto w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/40 via-purple-900/20 to-pink-900/30 p-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-3 z-10">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">
              Host Your Next Event<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">on Eventify</span>
            </h3>
            <p className="text-white/50 max-w-md text-sm leading-relaxed">
              Reach thousands of passionate attendees. Sell tickets, manage RSVPs, and grow your audience effortlessly.
            </p>
          </div>

          <Link to="/login" className="z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0 px-10 py-4 rounded-2xl bg-white text-black font-extrabold text-sm tracking-wide shadow-2xl flex items-center gap-2 group/cta"
            >
              Let's Start Enjoy
              <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
            </motion.button>
          </Link>

        </motion.div>
      </section>
    </div>
  );
};

export default Home;

