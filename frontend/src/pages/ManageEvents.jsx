import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Users, 
  MapPin, 
  ArrowLeft,
  MoreVertical,
  ExternalLink,
  Loader2
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import Orbs from '../components/ui/Orbs';

const ManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    try {
      const { data } = await axiosInstance.get('/events/my');
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this experience?')) {
      try {
        await axiosInstance.delete(`/events/${id}`);
        setEvents(events.filter(e => e._id !== id));
        toast.success('Experience deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-success/20 text-success border-success/20';
      case 'draft': return 'bg-white/10 text-white/60 border-white/10';
      case 'postponed': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-error/20 text-error border-error/20';
      default: return 'bg-white/5 text-white/40 border-white/5';
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-primary">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-primary pt-32 pb-20 px-6 relative overflow-hidden">
      <Orbs />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex flex-col gap-2">
            <Link to="/admin" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Console Dashboard</span>
            </Link>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Experience Manager</span>
            <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">Your Events</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:bg-white/10 focus:border-accent transition-all text-sm font-bold min-w-[300px] outline-none"
              />
            </div>
            <Link to="/admin/events/new">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl h-full"
              >
                <Plus size={16} /> Create New
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Experience</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Schedule</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Tickets</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Revenue</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                          <Calendar size={32} />
                        </div>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No experiences found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={event._id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                            {event.coverImage ? (
                              <img src={event.coverImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-[8px]">NO IMG</div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-white truncate max-w-[200px]">{event.title}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent/60">{event.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{new Date(event.date).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-white/30">{event.startTime} - {event.endTime}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{event.totalSeats - event.availableSeats} / {event.totalSeats}</span>
                          <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-sm text-secondary">LKR {(event.price * (event.totalSeats - event.availableSeats)).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(event._id)}
                            className="w-10 h-10 rounded-xl bg-error/5 flex items-center justify-center text-error/40 hover:bg-error/20 hover:text-error transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <Link 
                            to={`/events/${event._id}`} 
                            target="_blank"
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                            title="View Public"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;

