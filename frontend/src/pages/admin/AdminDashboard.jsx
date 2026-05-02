import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Calendar, Users, DollarSign, Plus, Settings, Trash2, Clock, Loader2, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/events/my');
      return data;
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/admin/stats');
      return data;
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axiosInstance.delete(`/events/${id}`);
        toast.success('Event deleted');
        refetch();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handlePostpone = async (id) => {
    try {
      await axiosInstance.patch(`/events/${id}`, { status: 'postponed' });
      toast.success('Event postponed');
      refetch();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const stats = [
    { 
      title: 'Total Events', 
      value: statsData?.totalEvents || 0, 
      icon: <Calendar size={22} className="text-accent" />, 
      color: 'from-violet-600/10 to-purple-600/5' 
    },
    { 
      title: 'Total Bookings', 
      value: statsData?.totalBookings || 0, 
      icon: <Users size={22} className="text-secondary" />, 
      color: 'from-cyan-600/10 to-blue-600/5' 
    },
    { 
      title: 'Real Revenue', 
      value: `LKR ${(statsData?.totalRevenue || 0).toLocaleString()}`, 
      icon: <DollarSign size={22} className="text-success" />, 
      color: 'from-rose-600/10 to-pink-600/5' 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-success/10 text-success border-success/20';
      case 'postponed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-error/10 text-error border-error/20';
      case 'draft': return 'bg-white/10 text-white/40 border-white/20';
      default: return 'bg-white/10 text-white/40 border-white/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col gap-12 min-h-screen">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Management Suite</span>
          <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">Admin Console</h1>
          <p className="text-white/40 font-medium">Oversee your events, monitor revenue, and manage attendees</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/notifications/create">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all"
            >
              <Bell size={20} /> Broadcast
            </motion.button>
          </Link>
          <Link to="/admin/events/create">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase shadow-2xl hover:shadow-white/10 transition-all"
            >
              <Plus size={20} /> Create Event
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -5 }}
            className={`card-base bg-gradient-to-br ${stat.color} p-8 flex items-center gap-6 border-white/10`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.title}</p>
              <h3 className="text-4xl font-black font-syne mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Events Table Area */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-syne uppercase tracking-tight">Active Events</h2>
          <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
        </div>

        <div className="card-base bg-white/5 border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Event Detail</th>
                  <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Date</th>
                  <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Capacity</th>
                  <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>
                  <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                   [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="p-6"><div className="h-10 bg-white/5 rounded-xl w-full" /></td>
                    </tr>
                   ))
                ) : events?.map((event) => (
                  <tr key={event._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/5">
                          <img src={event.coverImage} className="w-full h-full object-cover" alt="" />
                        </div>
                        <span className="font-bold text-base group-hover:text-accent transition-colors">{event.title}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-white/60">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                          <span>{event.availableSeats} Left</span>
                          <span>{Math.round((event.availableSeats / event.totalSeats) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/admin/events/${event._id}/edit`}>
                          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all" title="Edit">
                            <Settings size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handlePostpone(event._id)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all text-amber-500/60" title="Postpone"
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-error hover:text-white transition-all text-error/60" title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="text-4xl grayscale">📂</div>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No active events found in your console</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

