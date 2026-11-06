import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <main className="container section">
      <div className="admin-header">
        <h1 className="page-title">Admin</h1>
        <nav className="admin-tabs" aria-label="Admin">
          <NavLink to="/admin/hotels">Hotels</NavLink>
          <NavLink to="/admin/reservations">Reservations</NavLink>
        </nav>
      </div>
      <Outlet />
    </main>
  );
}