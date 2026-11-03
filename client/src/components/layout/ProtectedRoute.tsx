import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

type ProtectedRouteProps = {
  children: ReactNode;
  role?: 'admin';
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status !== 'ready') {
    return <main className="container section">Loading...</main>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}