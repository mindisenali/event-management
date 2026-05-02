import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, Search, Calendar, MapPin, Tag, ArrowRight, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';


import axiosInstance from '../../api/axiosInstance';
import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const EventsList = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    city: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const city = params.get('city') || '';
    if (search || city) {
      setFilters(prev => ({ ...prev, search, city }));
    }
  }, [location.search]);


  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('venue.city', filters.city);
      
      const { data } = await axiosInstance.get(`/events?${params.toString()}`);
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-80 flex flex-col gap-8 shrink-0">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl sticky top-32 flex flex-col gap-8">
          <div className="flex items-center gap-2 text-2xl font-black font-syne tracking-tight uppercase">
            <Filter size={20} className="text-accent" /> Filters
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Event name..." 
                className="input-base pl-10 bg-white/5 border-white/5 hover:border-white/10 focus:bg-white/10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />

            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search city..." 
                className="input-base pl-10 bg-white/5 border-white/5 hover:border-white/10 focus:bg-white/10"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />

            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
            <div className="flex flex-col gap-2">
              {['concert', 'festival', 'tech', 'theatre', 'family', 'other'].map((cat) => (
                <label key={cat} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all group">
                  <span className="text-sm font-semibold capitalize text-white/60 group-hover:text-white">{cat}</span>
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat}
                    checked={filters.category === cat}
                    className="accent-accent w-4 h-4"
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  />
                </label>
              ))}
              <button 
                onClick={() => setFilters({ ...filters, category: '' })} 
                className="text-xs font-bold text-accent hover:text-white transition-colors uppercase tracking-widest mt-2"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-10">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black font-syne tracking-tight uppercase">Explore Events</h1>
            <p className="text-white/40 font-medium">{data?.results || 0} extraordinary experiences found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-base h-96 animate-pulse bg-white/5 border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {data?.data.events.map((event, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={event._id}
                className="card-base group bg-white/5 border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <Link to={`/events/${event._id}`}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img 
                      src={event.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
                        {event.category}
                      </div>
                      {event.status === 'postponed' && (
                        <div className="bg-red-500/20 text-red-500 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-red-500/40 animate-pulse">
                          Postponed
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white/20 shadow-2xl">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-black text-white">{event.averageRating || '4.8'}</span>
                    </div>

                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors min-h-[3.5rem]">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-white/40">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-secondary" /> {event.venue.city}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
                      <span className="text-2xl font-black text-white">LKR {event.price}</span>
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                        <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {data?.data.events.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl grayscale">🎫</div>
                <h3 className="text-2xl font-black font-syne uppercase">No events found</h3>
                <p className="text-white/40 max-w-sm">We couldn't find any events matching your current filters. Try broadening your search!</p>
                <button onClick={() => setFilters({ category: '', search: '', city: '' })} className="mt-4 text-accent font-bold uppercase tracking-widest hover:text-white transition-colors">Clear All Filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default EventsList;
