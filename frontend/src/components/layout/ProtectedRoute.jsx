import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if ((user?.role === 'admin' || user?.role === 'superadmin') && !user?.isApproved) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="card p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold text-error mb-4">Pending Approval</h2>
        <p className="text-white/60">Your admin account is currently awaiting approval from the SuperAdmin. Please check back later.</p>
      </div>
    </div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
