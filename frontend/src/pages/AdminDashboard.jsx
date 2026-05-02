import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <button className="btn-danger" onClick={() => { logout(); toast.success('Logged out successfully'); }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h2>Overview</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            You are logged in as an Administrator. You have full access to manage all system events.
          </p>
        </div>

        <div className="card">
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => navigate('/admin/events')}>
              Manage Events
            </button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)' }} onClick={() => navigate('/admin/events/new')}>
              Create New Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
