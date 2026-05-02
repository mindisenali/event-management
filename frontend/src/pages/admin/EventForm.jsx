import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Image as ImageIcon, 
  Tag, 
  ArrowLeft, 
  Plus, 
  Save,
  Loader2,
  DollarSign
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Orbs from '../../components/ui/Orbs';

const CATEGORIES = ['concert', 'festival', 'tech', 'theatre', 'family', 'other'];


const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'concert',
    date: '',
    startTime: '',
    endTime: '',
    totalSeats: 100,
    price: 0,
    normalPrice: 0,
    vipPrice: 0,
    organizedBy: '',
    venue: {
      name: '',
      address: '',
      city: '',
      country: '',
    },
    coverImage: '',
    status: 'published',
  });


  useEffect(() => {
    if (isEdit) {
      const fetchEvent = async () => {
        try {
          const { data } = await axiosInstance.get(`/events/${id}`);
          const normalTier = data.ticketTiers?.find(t => t.name === 'Normal');
          const vipTier = data.ticketTiers?.find(t => t.name === 'VIP');
          
          setFormData({
            ...data,
            date: data.date ? data.date.split('T')[0] : '',
            normalPrice: normalTier?.price || data.price || 0,
            vipPrice: vipTier?.price || 0,
            organizedBy: data.organizedBy || '',
          });
        } catch (error) {
          toast.error('Failed to load event details');
          navigate('/admin');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' && value === '' ? '' : (type === 'number' ? Number(value) : value)
      }));
    }
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const { data } = await axiosInstance.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, coverImage: data.url || data }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submissionData = {
      ...formData,
      price: formData.normalPrice, // Sync base price with normal price
      ticketTiers: [
        { name: 'Normal', price: formData.normalPrice },
        { name: 'VIP', price: formData.vipPrice }
      ]
    };

    try {
      if (isEdit) {
        await axiosInstance.patch(`/events/${id}`, submissionData);
        toast.success('Event updated successfully');
      } else {
        await axiosInstance.post('/events', submissionData);
        toast.success('Event created successfully');
      }
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/admin" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Console</span>
        </Link>

        <div className="flex flex-col gap-2 mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">
            {isEdit ? 'Modification Mode' : 'New Experience'}
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-syne tracking-tighter uppercase">
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* General Info Section */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent"><Tag size={18} /></div>
              <h2 className="text-xl font-black font-syne uppercase tracking-tight">General Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Event Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="The Grand Gala"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all text-lg font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Description</label>
                <textarea 
                  name="description" 
                  rows="5" 
                  required 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Tell the world what makes this event extraordinary..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-medium leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Organized By</label>
                <input 
                  type="text" 
                  name="organizedBy" 
                  value={formData.organizedBy} 
                  onChange={handleChange}
                  placeholder="Sri Lanka Customs Welfare Association"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat} className="text-black">{cat.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                >
                  <option value="draft" className="text-black">DRAFT</option>
                  <option value="published" className="text-black">PUBLISHED</option>
                  <option value="postponed" className="text-black">POSTPONED</option>
                  <option value="cancelled" className="text-black">CANCELLED</option>
                </select>
              </div>
            </div>
          </section>

          {/* Time & Logistics Section */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary"><Calendar size={18} /></div>
              <h2 className="text-xl font-black font-syne uppercase tracking-tight">Time & Logistics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Start Time</label>
                <input 
                  type="time" 
                  name="startTime" 
                  required 
                  value={formData.startTime} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">End Time</label>
                <input 
                  type="time" 
                  name="endTime" 
                  required 
                  value={formData.endTime} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Total Capacity</label>
                <div className="relative">
                  <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    name="totalSeats" 
                    required 
                    min="1"
                    value={formData.totalSeats} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Normal Ticket Price (LKR)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    name="normalPrice" 
                    required 
                    min="0"
                    value={formData.normalPrice} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">VIP Ticket Price (LKR)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    name="vipPrice" 
                    required 
                    min="0"
                    value={formData.vipPrice} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Venue Section */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error/20 rounded-xl flex items-center justify-center text-error"><MapPin size={18} /></div>
              <h2 className="text-xl font-black font-syne uppercase tracking-tight">Venue Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Venue Name</label>
                <input 
                  type="text" 
                  name="venue.name" 
                  required 
                  value={formData.venue.name} 
                  onChange={handleChange}
                  placeholder="Royal Hall"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">City</label>
                <input 
                  type="text" 
                  name="venue.city" 
                  required 
                  value={formData.venue.city} 
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3">Full Address</label>
                <input 
                  type="text" 
                  name="venue.address" 
                  required 
                  value={formData.venue.address} 
                  onChange={handleChange}
                  placeholder="123 Luxury Ave, Manhattan"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all font-bold"
                />
              </div>
            </div>
          </section>

          {/* Media Section */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center text-success"><ImageIcon size={18} /></div>
              <h2 className="text-xl font-black font-syne uppercase tracking-tight">Visual Assets</h2>
            </div>

            <div className="flex flex-col gap-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Cover Image</label>
              
              <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 overflow-hidden flex flex-col items-center justify-center gap-4 transition-all hover:border-accent/40">
                {formData.coverImage ? (
                  <>
                    <img src={formData.coverImage} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-2xl">Replace Image</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      {uploading ? <Loader2 className="animate-spin" /> : <Plus size={32} />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold uppercase tracking-widest text-white/40">Drop experience cover here</p>
                      <p className="text-[10px] text-white/20 mt-1 font-bold">PNG, JPG or WebP (Max 5MB)</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              
              <input 
                type="text" 
                name="coverImage" 
                value={formData.coverImage} 
                onChange={handleChange}
                placeholder="Or paste image URL directly..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:bg-white/10 focus:border-accent transition-all text-xs font-mono"
              />
            </div>
          </section>

          <div className="flex gap-6 mt-4">
             <button 
              type="button" 
              onClick={() => navigate('/admin')}
              className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
             >
               Cancel
             </button>
             <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={submitting}
              className="flex-[2] py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2"
             >
               {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
               {isEdit ? 'Update Experience' : 'Create Experience'}
             </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
