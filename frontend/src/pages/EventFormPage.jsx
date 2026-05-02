import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    eventType: 'Indoor',
    seatCapacity: 100,
    imageUrl: '',
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchEvent = async () => {
        try {
          const { data } = await axios.get(`/api/events/${id}`);
          // Ensure we extract only needed fields and format date for input[type="date"]
          setFormData({
            title: data.title,
            description: data.description,
            date: data.date ? data.date.split('T')[0] : '',
            time: data.time,
            location: data.location,
            eventType: data.eventType || 'Indoor',
            seatCapacity: data.seatCapacity,
            imageUrl: data.imageUrl || '',
          });
        } catch (error) {
          console.error('Error fetching event details:', error);
          toast.error('Failed to fetch event details.');
          navigate('/admin/events');
        }
      };
      fetchEvent();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      setFormData((prev) => ({ ...prev, imageUrl: data }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      toast.error('Error uploading image');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location.trim() || !formData.eventType) {
      toast.error('Please fill out all required fields properly.');
      return;
    }
    if (formData.seatCapacity < 1) {
      toast.error('Seat capacity must be at least 1.');
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`/api/events/${id}`, formData);
      } else {
        await axios.post('/api/events', formData);
      }
      toast.success(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      const message = error.response?.data?.message || error.message;
      toast.error(`Failed to save event: ${message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1>{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
        <button className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)' }} onClick={() => navigate('/admin/events')}>
          Cancel
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" name="title" className="form-control" required value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" rows="4" required value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" className="form-control" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" name="time" className="form-control" required value={formData.time} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" className="form-control" required value={formData.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <select name="eventType" className="form-control" value={formData.eventType} onChange={handleChange} required>
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Event Image</label>
            <input type="text" name="imageUrl" className="form-control" value={formData.imageUrl} onChange={handleChange} placeholder="Or enter image URL" />
            <input type="file" onChange={uploadFileHandler} style={{ marginTop: '0.5rem' }} />
            {uploading && <div style={{ marginTop: '0.5rem', color: 'var(--accent)' }}>Uploading image...</div>}
            {formData.imageUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.5rem' }} />
              </div>
            )}
          </div>

          <div className="form-group" style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '0.5rem', 
            border: '1px solid var(--accent)' 
          }}>
            <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Total Seat Capacity</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Only Administrators can set and update the maximum capacity for events.
            </p>
            <input 
              type="number" 
              name="seatCapacity" 
              className="form-control" 
              style={{ fontSize: '1.25rem', fontWeight: 'bold' }} 
              required 
              min="1" 
              value={formData.seatCapacity} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;
