import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Download, ArrowRight, Clock, ShieldCheck, Ticket } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import html2pdf from 'html2pdf.js';
import Orbs from '../../components/ui/Orbs';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isFree = searchParams.get('free') === 'true';
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        if (isFree && bookingId) {
          // For free bookings, we just fetch the booking details
          const { data } = await axiosInstance.get(`/bookings/${bookingId}`);
          setBooking(data);
        } else if (sessionId) {
          // For Stripe bookings, we verify the session
          const { data } = await axiosInstance.get(`/payments/verify/${sessionId}`);
          setBooking(data.booking);
        }
      } catch (error) {
        console.error('Verification failed:', error);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [sessionId, isFree, bookingId]);

  const handleDownloadTicket = () => {
    const element = document.getElementById('success-ticket-render');
    const opt = {
      margin: 0,
      filename: `Eventify-Ticket-${booking?.bookingCode}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-primary gap-6">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Authenticating Your Pass</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-primary relative overflow-hidden">
      <Orbs />
      
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-12">
        {/* Success Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-24 h-24 bg-success rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(0,230,118,0.3)] border-4 border-success/20"
          >
            <CheckCircle className="text-white w-12 h-12" />
          </motion.div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-6xl font-black font-syne uppercase tracking-tighter leading-none">
              Payment <span className="text-accent italic">Received</span>
            </h1>
            <p className="text-white/40 text-sm md:text-lg font-medium max-w-md mx-auto">
              Your payment was successful. Your booking is now <b>Awaiting Admin Approval</b>. You will receive your official ticket via email once verified.
            </p>
          </div>
        </div>

        {booking ? (
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full flex flex-col gap-8"
          >
            {/* Main Ticket Display */}
            <div className="card-base bg-white/5 backdrop-blur-3xl border-white/10 flex flex-col lg:flex-row overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              {/* Event Cover Image Area */}
              <div className="w-full lg:w-1/3 aspect-square lg:aspect-auto relative group">
                <img 
                  src={booking.event?.coverImage} 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-transparent to-transparent lg:hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent hidden lg:block" />
              </div>

              {/* Ticket Details Area */}
              <div className="flex-1 p-8 md:p-12 flex flex-col gap-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] bg-accent/10 px-3 py-1 rounded-full w-fit">Pending Verification</span>
                    <h3 className="text-2xl md:text-5xl font-black font-syne uppercase tracking-tighter leading-[0.9] mt-2">{booking.event?.title}</h3>
                  </div>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</span>
                    <span className="px-4 py-1 rounded-full bg-warning/10 border border-warning/30 text-warning text-[10px] font-black uppercase tracking-widest mt-1">Awaiting Approval</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Date</p>
                      <p className="font-bold text-lg">{new Date(booking.event?.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40"><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time</p>
                      <p className="font-bold text-lg">{booking.event?.startTime} Onwards</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Venue</p>
                      <p className="font-bold text-lg">{booking.event?.venue?.name}, {booking.event?.venue?.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40"><Ticket size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Pass Type</p>
                      <p className="font-bold text-lg text-accent">{booking.seats} x {booking.tier} PASS</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Booking Reference</span>
                    <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 font-mono font-black text-lg text-white tracking-widest uppercase">
                      {booking.bookingCode}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-2xl">
                    <div className="flex flex-col gap-1">
                      <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em]">Scan After Approval</p>
                      <p className="text-[10px] font-black text-black uppercase tracking-tighter">PENDING VERIFICATION</p>
                    </div>
                    <div className="relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingCode}`} 
                        className="w-16 h-16 blur-[2px] opacity-40" 
                        alt="QR" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Clock size={16} className="text-black/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Element for PDF Rendering */}
            <div className="hidden">
              <div id="success-ticket-render" className="w-[800px] bg-white text-black p-10 font-sans">
                <div style={{ border: '2px solid #6d28d9', borderRadius: '24px', overflow: 'hidden' }}>
                  <div style={{ height: '280px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={booking.event?.coverImage} 
                      crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      alt="" 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, white, transparent)' }} />
                  </div>
                  <div style={{ padding: '40px', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#6d28d9', letterSpacing: '0.2em' }}>Official Entry Pass</span>
                    <h2 style={{ fontSize: '42px', margin: '10px 0', fontWeight: '900', textTransform: 'uppercase' }}>{booking.event?.title}</h2>
                    <p style={{ color: '#666', marginBottom: '40px', fontSize: '20px', fontWeight: 'bold' }}>{new Date(booking.event?.date).toLocaleDateString()} | {booking.event?.startTime}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>ATTENDEE</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>{booking.user?.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>PASS TYPE</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6d28d9' }}>{booking.seats} x {booking.tier} PASS</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '20px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#999', fontSize: '12px', fontWeight: '900' }}>VENUE</p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{booking.event?.venue?.name}</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{booking.event?.venue?.city}, {booking.event?.venue?.country}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingCode}`} alt="QR" style={{ width: '120px' }} />
                        <p style={{ marginTop: '10px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>#{booking.bookingCode?.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#1a1a1a', padding: '20px', textAlign: 'center', color: 'white' }}>
                    <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.3em', fontWeight: 'bold' }}>SECURED BY EVENTIFY INFRASTRUCTURE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row gap-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadTicket}
                className="flex-1 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
              >
                <Download size={20} /> Download Ticket PDF
              </motion.button>
              
              <Link to="/dashboard" className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-10 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center gap-3 group"
                >
                  Go to My Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="text-center p-20 bg-white/5 rounded-[3rem] border border-white/10 max-w-xl w-full">
            <h3 className="text-2xl font-black uppercase">Session Expired</h3>
            <p className="text-white/40 mt-4 font-medium leading-relaxed">We couldn't retrieve your booking details. Please visit your dashboard to view your active passes.</p>
            <Link to="/dashboard" className="mt-8 inline-block px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest">Back to Dashboard</Link>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pb-10">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] flex items-center gap-3">
            <ShieldCheck size={14} className="text-success/30" /> Secure Cloud Infrastructure Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
