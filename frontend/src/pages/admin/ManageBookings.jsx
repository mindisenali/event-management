import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, XCircle, Clock, User, Mail, Calendar, Search, Filter, Phone } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';

const ManageBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/bookings');
      return data;
    },
  });

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.patch(`/bookings/${id}`, { status });
      toast.success(`Booking ${status} successfully`);
      refetch();
      if (selectedBooking?._id === id) {
        setShowDetailModal(false);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('admin-ticket-preview');
    const opt = {
      margin: 0,
      filename: `Ticket-${selectedBooking.event.title}-${selectedBooking.user.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-white/10 text-white/40 border-white/20';
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'paid': return 'text-success';
      case 'pending': return 'text-amber-500';
      case 'failed': return 'text-error';
      default: return 'text-white/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col gap-12 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Booking Management</span>
          <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">Attendee Approvals</h1>
          <p className="text-white/40 font-medium">Verify ticket payments and approve entry codes</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by code, user or event..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:bg-white/10 focus:border-accent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
          {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />)
          ) : filteredBookings?.map((booking, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={booking._id} 
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailModal(true);
              }}
              className="group card-base bg-white/5 border-white/10 hover:border-white/20 p-8 flex flex-col lg:flex-row gap-10 items-center transition-all duration-500 cursor-pointer"
            >
              {/* Event Info */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden border border-white/10 shrink-0">
                  <img src={booking.event?.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-xl font-black truncate">{booking.event?.title}</h3>
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(booking.event?.date).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{booking.seats} Tickets ({booking.tier})</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-6 flex-1 min-w-0 border-x border-white/5 px-10">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <User size={20} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-bold text-base truncate">{booking.user?.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white/40 text-xs truncate font-medium">{booking.user?.email}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${getPaymentStatusStyle(booking.paymentStatus)}`}>
                      • {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-8 shrink-0">
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Booking Code</span>
                  <span className="font-mono text-xs text-white/60 tracking-wider bg-white/5 px-3 py-1 rounded-lg">
                    {booking.bookingCode?.substring(0, 8).toUpperCase()}...
                  </span>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredBookings?.length === 0 && (
          <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl grayscale">🎫</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-black font-syne uppercase tracking-tight">No bookings match</h3>
              <p className="text-white/40 max-w-sm mx-auto font-medium">Try adjusting your filters or search term to find what you're looking for.</p>
            </div>
            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-accent font-black uppercase tracking-widest text-xs">Clear all filters</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-primary border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative h-48">
                <img src={selectedBooking.event?.coverImage} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                <div className="absolute bottom-6 left-10">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Booking Information</span>
                   <h2 className="text-3xl font-black font-syne uppercase tracking-tighter mt-1">{selectedBooking.event?.title}</h2>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 flex flex-col gap-10">
                <div className="grid grid-cols-2 gap-10">
                   {/* Attendee Info */}
                   <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 pb-2">Attendee Details</h4>
                      <div className="flex flex-col gap-3">
                         <p className="text-lg font-bold">{selectedBooking.user?.name}</p>
                         <p className="text-sm text-white/60 flex items-center gap-2"><Mail size={14} className="text-accent" /> {selectedBooking.user?.email}</p>
                         <p className="text-sm text-white/60 flex items-center gap-2"><Phone size={14} className="text-accent" /> {selectedBooking.user?.phone || 'No phone provided'}</p>
                      </div>
                   </div>

                   {/* Booking Info */}
                   <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 pb-2">Booking Status</h4>
                      <div className="flex flex-col gap-3">
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-white/40 font-medium">Payment</span>
                            <span className={`text-sm font-black uppercase tracking-widest ${getPaymentStatusStyle(selectedBooking.paymentStatus)}`}>{selectedBooking.paymentStatus}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-white/40 font-medium">Tickets</span>
                            <span className="text-sm font-black text-white">{selectedBooking.seats} x {selectedBooking.tier}</span>
                         </div>
                         <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-sm text-white/40 font-medium">Total Paid</span>
                            <span className="text-xl font-black text-accent">LKR {selectedBooking.totalAmount?.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Full Booking Code</span>
                       <span className="font-mono text-sm text-white font-bold select-all cursor-copy">{selectedBooking.bookingCode}</span>
                    </div>
                    {selectedBooking.stripeSessionId && (
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Stripe Session</span>
                          <span className="text-xs text-white/40 font-medium truncate max-w-[200px]">{selectedBooking.stripeSessionId}</span>
                       </div>
                    )}
                 </div>

                 {/* Ticket Preview for Download */}
                 <div className="hidden">
                    <div id="admin-ticket-preview" className="w-[800px] bg-white text-black p-10 font-sans">
                       <div style={{ border: '2px solid #6d28d9', borderRadius: '24px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: '#6d28d9', padding: '40px', color: 'white' }}>
                             <h1 style={{ margin: 0, fontSize: '40px', fontWeight: '900' }}>EVENTIFY</h1>
                             <p style={{ margin: '5px 0 0 0', opacity: 0.8, letterSpacing: '0.2em' }}>OFFICIAL ENTRY PASS</p>
                          </div>
                          <div style={{ padding: '40px' }}>
                             <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{selectedBooking.event?.title}</h2>
                             <p style={{ color: '#666', marginBottom: '40px' }}>{new Date(selectedBooking.event?.date).toLocaleDateString()} | {selectedBooking.event?.startTime}</p>
                             
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div>
                                   <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>ATTENDEE</p>
                                   <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{selectedBooking.user?.name}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                   <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>PASS TYPE</p>
                                   <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#6d28d9' }}>{selectedBooking.seats} x {selectedBooking.tier}</p>
                                </div>
                             </div>

                             <div style={{ textAlign: 'center' }}>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qrco.de/bgmJmb" alt="QR" style={{ width: '150px' }} />
                                <p style={{ marginTop: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>#{selectedBooking.bookingCode?.toUpperCase()}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleDownloadPDF}
                   className="mt-4 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                 >
                    <Download size={18} /> Download User Ticket
                 </button>

                 {/* Footer Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                   {selectedBooking.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                          className="flex-1 py-4 rounded-xl bg-success text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-success/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                        >
                          <CheckCircle size={18} /> Approve Ticket
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                          className="flex-1 py-4 rounded-xl bg-error/10 text-error border border-error/20 font-black text-xs uppercase tracking-widest hover:bg-error hover:text-white transition-all"
                        >
                          Reject Booking
                        </button>
                      </>
                   ) : (
                      <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                         <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full animate-pulse ${selectedBooking.status === 'confirmed' ? 'bg-success' : 'bg-error'}`} />
                            <span className="text-sm font-black uppercase tracking-widest">This booking is {selectedBooking.status}</span>
                         </div>
                         <button 
                           onClick={() => handleStatusUpdate(selectedBooking._id, 'pending')}
                           className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                         >
                           Reset Status
                         </button>
                      </div>
                   )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBookings;
