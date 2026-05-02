import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Globe, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateNotification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/notifications', formData);
      toast.success('Notification broadcasted successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'info', icon: <Info size={18} />, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'success', icon: <CheckCircle size={18} />, color: 'text-success', bg: 'bg-success/10' },
    { id: 'warning', icon: <AlertCircle size={18} />, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 min-h-screen flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Broadcast Center</span>
        <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">Create <span className="text-accent">Notice</span></h1>
        <p className="text-white/40 font-medium">Send important updates to specific users or broadcast to everyone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Notification Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. New Event Published!"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent outline-none transition-all font-bold"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Message Content</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your detailed message here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent outline-none transition-all font-medium min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Notification Type</label>
                  <div className="flex gap-3">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t.id })}
                        className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.type === t.id ? `bg-white text-black border-white` : 'border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {t.icon}
                        <span className="text-[10px] font-black uppercase">{t.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Send size={16} /> {loading ? 'Broadcasting...' : 'Broadcast Notification'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-accent/10 border border-accent/20 p-8 rounded-[2.5rem] flex flex-col gap-4">
            <Globe className="text-accent" size={32} />
            <h3 className="text-xl font-black uppercase tracking-tight">Global Notice</h3>
            <p className="text-white/60 text-sm leading-relaxed">Notifications sent from this console are broadcast to every registered user on the platform instantly.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-4">
            <Bell className="text-white/40" size={32} />
            <h3 className="text-xl font-black uppercase tracking-tight">Real-time Delivery</h3>
            <p className="text-white/60 text-sm leading-relaxed">Notifications will appear in the user's navigation bar bell icon immediately after broadcasting.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;
