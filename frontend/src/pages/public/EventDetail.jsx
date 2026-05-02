import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ShieldCheck, Star, ArrowRight } from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CountdownSection = ({ event, onBook }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(event.date) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  const boxes = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINS', value: timeLeft.mins },
    { label: 'SECS', value: timeLeft.secs },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 1.2 }}
      className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 mt-10 overflow-hidden relative shadow-2xl"
    >
      <div className="flex flex-col gap-8 z-10">
        <h2 className="text-3xl md:text-4xl font-black font-syne text-white uppercase tracking-tight">
          Event <span className="text-accent italic font-medium lowercase">will</span> start on
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-4">
            {boxes.map((box, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl md:text-3xl font-black text-white">{box.value}</span>
                </div>
                <span className="text-[10px] font-black text-white/40 tracking-widest">{box.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={onBook}
            className="mt-4 md:mt-0 md:ml-8 bg-white hover:bg-gray-100 text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
          >
            Book Now <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="w-full md:w-[350px] aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
        <img 
          src={event.coverImage || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'} 
          className="w-full h-full object-cover" 
          alt="Event Core" 
        />
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#2D3178]/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/events/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.ticketTiers?.length > 0) {
        setSelectedTier(data.ticketTiers.find(t => t.name === 'Normal') || data.ticketTiers[0]);
      }
    }
  });


  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/payments/create-checkout-session', {
        eventId: id,
        seats,
        tier: selectedTier?.name || 'Normal',
      });

      window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-primary">
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!event) return <div className="h-screen flex items-center justify-center bg-primary">
    <div className="text-center">
      <h2 className="text-4xl font-black font-syne uppercase">Event not found</h2>
      <Link to="/events" className="text-accent font-bold uppercase tracking-widest mt-4 block">Back to Events</Link>
    </div>
  </div>;

  return (
    <div className="flex flex-col pb-32 bg-primary min-h-screen pt-20">
      {/* Hero Header */}
      <div className="h-[60vh] relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5 }}
          src={event.coverImage || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200'} 
          className="w-full h-full object-cover" 
          alt={event.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute bottom-16 left-6 md:left-20 max-w-5xl flex flex-col gap-6 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <span className="bg-accent px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">{event.category}</span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-white/10">{event.status}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase font-syne leading-[0.9]"
          >
            {event.title}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 w-full">
        <CountdownSection event={event} onBook={handleBooking} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16">
        {/* Left Content */}
        <div className="lg:col-span-2 flex flex-col gap-16">
          {event.status === 'postponed' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 p-8 rounded-[2rem] flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                <Clock size={32} className="animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-red-500 uppercase font-syne tracking-tight">This Experience is Postponed</h3>
                <p className="text-red-500/60 font-medium leading-tight">The organizer has postponed this event. Check back soon for updated dates and times.</p>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-0.5">Date</p>
                <p className="font-bold text-lg">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-secondary"><Clock size={20} /></div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-0.5">Time</p>
                <p className="font-bold text-lg">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-error"><MapPin size={20} /></div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-0.5">Location</p>
                <p className="font-bold text-lg">{event.venue.city}, {event.venue.country}</p>
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-black font-syne uppercase tracking-tight">The Experience</h2>
            <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium">{event.description}</p>
          </div>

          <div className="flex flex-col gap-8 py-10 border-t border-white/10 mt-8">
             <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <MapPin size={24} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xl font-bold">{event.venue.name}</p>
                   <p className="text-sm text-white/40 font-medium">{event.venue.address}, {event.venue.city}</p>
                </div>
             </div>

             <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                  <Calendar size={24} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xl font-bold">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   <p className="text-sm text-white/40 font-medium">Doors open at {event.startTime}</p>
                </div>
             </div>

             <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all duration-500">
                  <Clock size={24} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xl font-bold">From {event.startTime} onwards</p>
                   <p className="text-sm text-white/40 font-medium">Event duration: approx. {event.endTime ? `${event.endTime}` : '2-3 hours'}</p>
                </div>
             </div>

             <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-all duration-500">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xl font-bold">Organized by {event.organizedBy || 'Eventify'}</p>
                   <p className="text-sm text-white/40 font-medium">Verified Event Organizer</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Booking Widget */}
        <aside className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="bg-white/5 backdrop-blur-3xl border border-white/15 p-10 sticky top-32 flex flex-col gap-8 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Animated BG Orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Select Ticket Type</span>
              <div className="grid grid-cols-2 gap-3">
                {event.ticketTiers?.map((tier) => (
                  <button 
                    key={tier.name}
                    onClick={() => {
                      setSelectedTier(tier);
                      setSeats(1);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-1 text-left ${selectedTier?.name === tier.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTier?.name === tier.name ? 'text-black/40' : 'text-white/40'}`}>{tier.name}</span>
                    <span className="font-bold text-lg">LKR {tier.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Tier Availability</span>
                <span className={event.availableSeats > 0 ? 'text-success' : 'text-error'}>
                  {event.availableSeats} Seats Left
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                  className="h-full bg-gradient-to-r from-accent to-secondary" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Quantity</label>
              <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >-</button>
                <span className="flex-1 text-center font-black text-xl">{seats}</span>
                <button 
                  onClick={() => setSeats(Math.min(10, event.availableSeats, seats + 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-6 relative z-10">
              <div className="flex justify-between font-black text-2xl uppercase tracking-tighter">
                <span>Total</span>
                <span className={event.status === 'postponed' ? 'text-red-500' : 'text-accent'}>
                  {event.status === 'postponed' ? 'POSTPONED' : `LKR ${( (selectedTier?.price || event.price) * seats).toFixed(2)}`}
                </span>
              </div>

              <motion.button 
                whileHover={event.status !== 'postponed' ? { scale: 1.02 } : {}}
                whileTap={event.status !== 'postponed' ? { scale: 0.98 } : {}}
                onClick={event.status !== 'postponed' ? handleBooking : undefined} 
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all flex items-center justify-center gap-2 group ${event.status === 'postponed' ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:shadow-accent/20'}`}
              >
                {event.status === 'postponed' ? 'Booking Paused' : (isAuthenticated ? 'Reserve Now' : 'Login to Reserve')}
                {event.status !== 'postponed' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <p className="text-[8px] text-center text-white/20 uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-success/50" /> Secure Encryption Active
              </p>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetail;
EventDetail;
