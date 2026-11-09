import { Link, NavLink, Outlet } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function AdminLayout() {
  return (
    <main className="container section admin-shell">
      <div className="admin-header">
        <Link to="/admin" className="admin-brand"><span className="admin-brand-mark">S</span><span><small>Sensei Hotels</small><strong>Operations</strong></span></Link>
        <nav className="admin-tabs" aria-label="Admin navigation">
          <NavLink to="/admin" end>Overview</NavLink>
          <NavLink to="/admin/hotels">Properties</NavLink>
          <NavLink to="/admin/reservations">Reservations</NavLink>
          <NavLink to="/admin/reviews">Reviews</NavLink>
        </nav>
        <Link to="/" className="admin-view-site">View site <ExternalLink size={15} /></Link>
      </div>
      <Outlet />
    </main>
  );
}
