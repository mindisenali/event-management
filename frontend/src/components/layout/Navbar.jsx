import { Link, useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, LayoutDashboard, Calendar, ShoppingBag, Bell, Check, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useState, useEffect, useRef } from 'react';

import Button from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications');
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const unreadCount = notifications?.filter(n => !n.readBy?.includes(user?._id)).length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (

    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/40 group-hover:rotate-6 transition-transform">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black font-syne tracking-tighter uppercase">
            Event<span className="text-accent">ify</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-white/70">
          <Link to="/events" className="hover:text-white transition-colors relative group">
            Events
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' || user?.role === 'superadmin' ? (
                <>
                  <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                    <LayoutDashboard size={14} className="text-accent" /> Dashboard
                  </Link>
                  <Link to="/admin/bookings" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ShoppingBag size={14} className="text-accent" /> Bookings
                  </Link>
                </>

              ) : (
                <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <User size={14} className="text-accent" /> Dashboard
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <Bell size={16} className={`${unreadCount > 0 ? 'text-accent animate-swing' : 'text-white/40'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg shadow-accent/40 border border-primary">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl z-[200]"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Notifications</span>
                        {unreadCount > 0 && <span className="text-[8px] font-black text-accent uppercase tracking-widest">{unreadCount} New</span>}
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {notifications?.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n._id}
                                onClick={() => {
                                  markReadMutation.mutate(n._id);
                                  if (n.link && n.link.trim() !== '') {
                                    navigate(n.link);
                                    setShowNotifications(false);
                                  }
                                }}
                              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${!n.readBy?.includes(user?._id) ? 'bg-accent/5' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-success/20 text-success' : n.type === 'warning' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>
                                {n.type === 'success' ? <Check size={14} /> : n.type === 'warning' ? <Zap size={14} /> : <Bell size={14} />}
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-bold leading-tight">{n.title}</p>
                                <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center flex flex-col items-center gap-3">
                            <Bell size={32} className="text-white/5" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleLogout} className="hover:text-error transition-colors flex items-center gap-1.5 group">
                <LogOut size={14} className="text-white/40 group-hover:text-error" /> Logout
              </button>

            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase hover:shadow-xl hover:shadow-white/10 transition-all"
                >
                  Join Now
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
