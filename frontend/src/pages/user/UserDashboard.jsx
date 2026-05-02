import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, User as UserIcon, Settings, Calendar, Mail, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const UserDashboard = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('bookings');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/bookings/my');
      return data;
    },
    enabled: activeTab === 'bookings'
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/reviews/my');
      return data;
    },
    enabled: activeTab === 'reviews'
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/reviews', {
        eventId: selectedEventId,
        rating,
        comment,
        type: selectedEventId ? 'event' : 'platform'
      });

      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await axiosInstance.patch('/auth/me', data);
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };


  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-ticket');
    const opt = {
      margin: 0,
      filename: `Ticket-${selectedBooking.event.title.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: <ShoppingBag size={18} /> },
    { id: 'reviews', label: 'My Reviews', icon: <Star size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <UserIcon size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col gap-12 min-h-screen">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Member Area</span>
          <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-white/40 font-medium">Manage your extraordinary experiences and tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 no-print">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col gap-2 sticky top-32">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.div 
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black font-syne uppercase tracking-tight">Recent Bookings</h2>
                  <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {bookingsLoading ? (
                    [1, 2].map(i => <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />)
                  ) : bookings?.map((booking) => (
                    <div key={booking._id} className="group card-base bg-white/5 border-white/10 hover:border-white/20 p-6 flex flex-col md:flex-row gap-8 items-center transition-all duration-300">
                      <div className="w-full md:w-40 aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0 border border-white/5">
                        <img src={booking.event?.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      </div>
                      <div className="flex-1 flex flex-col gap-4 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-xl tracking-tight group-hover:text-accent transition-colors">{booking.event?.title}</h3>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-1 flex items-center gap-2">
                              <Calendar size={12} /> {new Date(booking.event?.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                             {booking.status === 'confirmed' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBooking(booking);
                                    setShowTicketModal(true);
                                  }}
                                  className="px-4 py-2 rounded-lg bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-lg shadow-accent/10"
                                >
                                  View Ticket
                                </button>
                             )}
                             <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${booking.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                {booking.status}
                             </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-white/5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Booking Code</span>
                            <span className="font-mono text-sm text-accent font-bold tracking-wider">{booking.bookingCode?.substring(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="flex flex-col gap-1 ml-auto text-right">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tickets ({booking.tier})</span>
                            <span className="font-black text-lg text-white">{booking.seats}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings?.length === 0 && (
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-20 text-center flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl grayscale">🎟️</div>
                      <div>
                        <h3 className="text-2xl font-black font-syne uppercase tracking-tight">No bookings yet</h3>
                        <p className="text-white/40 max-w-xs mx-auto mt-2 font-medium">Your upcoming experiences will appear here once you've secured your tickets.</p>
                      </div>
                      <Link to="/events">
                        <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-white/10 transition-all">Browse Events</button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black font-syne uppercase tracking-tight">My Reviews</h2>
                  <button 
                    onClick={() => {
                      setSelectedEventId(null);
                      setShowReviewModal(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                  >
                    Write Platform Review
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {reviewsLoading ? (
                    [1, 2].map(i => <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />)
                  ) : reviews?.map((review) => (
                    <div key={review._id} className="card-base bg-white/5 border-white/10 p-8 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{review.type === 'platform' ? 'Eventify Platform' : review.event?.title}</h3>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-white/10"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/60 font-medium leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black font-syne uppercase tracking-tight">Profile Settings</h2>
                  <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <UserIcon size={12} className="text-accent" /> Full Name
                      </label>
                      <input 
                        name="name"
                        defaultValue={user?.name}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-3 opacity-60">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <Mail size={12} className="text-accent" /> Email Address
                      </label>
                      <input 
                        value={user?.email}
                        disabled
                        className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 cursor-not-allowed font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <Phone size={12} className="text-accent" /> Phone Number
                      </label>
                      <input 
                        name="phone"
                        defaultValue={user?.phone}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-success" /> Account Status
                      </label>
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
                        <span className="font-bold text-sm uppercase tracking-widest">{user?.role}</span>
                        {user?.emailVerified && <span className="text-[10px] font-black text-success uppercase tracking-widest">Verified</span>}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-white/10 transition-all mt-4"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-primary border border-white/10 p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black font-syne uppercase tracking-tight">Share Experience</h2>
                <p className="text-white/40 text-sm mt-2">How was the event? Rate your experience</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-6">
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={32} 
                        fill={star <= rating ? "#FBBF24" : "none"} 
                        className={star <= rating ? "text-amber-400" : "text-white/10"} 
                      />
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Review Message</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Write your thoughts here..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent outline-none transition-all font-medium min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-4 rounded-xl border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      {/* Hidden Ticket for Background Generation */}
      {selectedBooking && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div id="printable-ticket" className="w-[800px] bg-white text-black p-10 font-sans">
              <div style={{ border: '2px solid #6d28d9', borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img src={selectedBooking.event?.coverImage} style={{ width: '100%', height: '100%', objectCover: 'cover' }} alt="" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, white, transparent)' }} />
                </div>
                <div style={{ padding: '40px', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#6d28d9', letterSpacing: '0.2em' }}>Official Entry Pass</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0', fontWeight: '900', textTransform: 'uppercase' }}>{selectedBooking.event?.title}</h2>
                    <p style={{ color: '#666', marginBottom: '40px', fontSize: '18px', fontWeight: 'bold' }}>{new Date(selectedBooking.event?.date).toLocaleDateString()} | {selectedBooking.event?.startTime}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                      <div>
                          <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>ATTENDEE</p>
                          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>{selectedBooking.user?.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>PASS TYPE</p>
                          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6d28d9' }}>{selectedBooking.seats} x {selectedBooking.tier} PASS</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '20px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>VENUE</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{selectedBooking.event?.venue?.name}</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{selectedBooking.event?.venue?.city}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qrco.de/bgmJmb" alt="QR" style={{ width: '120px' }} />
                        <p style={{ marginTop: '10px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>#{selectedBooking.bookingCode?.toUpperCase()}</p>
                      </div>
                    </div>
                </div>
              </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showTicketModal && selectedBooking && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl flex flex-col gap-8 max-h-[95vh] overflow-y-auto no-scrollbar p-2"
            >
              {/* Ticket Layout */}
              <div id="printable-ticket" className="bg-white text-black rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(255,255,255,0.1)]">
                 <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={selectedBooking.event?.coverImage} 
                      className="w-full h-full object-cover"
                      alt="Event Header"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    <div className="absolute bottom-6 left-10">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">Official Entry Ticket</span>
                    </div>
                 </div>

                 <div className="p-10 pt-4 flex flex-col gap-10">
                    <div className="flex justify-between items-start gap-10">
                       <div className="flex flex-col gap-6 flex-1">
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-2">Experience Name</span>
                             <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight text-[#2D3178] font-syne">{selectedBooking.event?.title}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                             <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">Date</span>
                                <p className="font-bold text-lg">{new Date(selectedBooking.event?.date).toLocaleDateString()}</p>
                             </div>
                             <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">Time</span>
                                <p className="font-bold text-lg">{selectedBooking.event?.startTime}</p>
                             </div>
                          </div>
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">Venue</span>
                             <p className="font-bold text-lg">{selectedBooking.event?.venue?.name}, {selectedBooking.event?.venue?.city}</p>
                          </div>
                       </div>
                       
                       <div className="w-44 h-44 bg-white rounded-3xl border-2 border-black/5 flex items-center justify-center p-2 shadow-lg">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://qrco.de/bgmJmb" alt="Ticket QR" className="w-full h-full object-contain" />
                       </div>
                    </div>

                    <div className="flex items-center gap-10 border-t border-black/5 pt-10">
                       <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">Attendee Name</span>
                          <p className="font-black text-2xl uppercase tracking-tighter text-[#2D3178]">{selectedBooking.user?.name}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">Pass Type</span>
                          <p className="font-black text-2xl uppercase tracking-tighter text-accent">{selectedBooking.seats} x {selectedBooking.tier} PASS</p>
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-black/5">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Booking Reference</p>
                          <p className="font-mono text-sm font-bold">#{selectedBooking.bookingCode?.toUpperCase()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Order Date</p>
                          <p className="font-bold text-sm">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="text-center opacity-30">
                       <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-4 flex items-center justify-center gap-4">
                          <ShieldCheck size={12} /> SECURED BY EVENTIFY INFRASTRUCTURE <ShieldCheck size={12} />
                       </p>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                 <button 
                   onClick={() => setShowTicketModal(false)}
                   className="flex-1 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                 >
                   Back to Dashboard
                 </button>
                 <button 
                   onClick={handleDownloadPDF}
                   className="flex-1 py-5 rounded-2xl bg-accent text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/40 hover:scale-[1.02] transition-all"
                 >
                   Download Ticket
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;





