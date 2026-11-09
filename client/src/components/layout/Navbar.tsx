import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { CalendarDays, Compass, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="Sensei Hotels home"><span className="brand-monogram">S</span><span className="brand-copy"><strong>Sensei</strong><small>Hotels & stays</small></span></Link>

        <nav className={`nav-links${menuOpen ? ' nav-links-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}><Compass size={16} /> Explore stays</NavLink>
          <NavLink to="/my-trips" onClick={() => setMenuOpen(false)}><CalendarDays size={16} /> My trips</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Admin</NavLink>}
        </nav>

        <div className="nav-right">
          {status === 'ready' && user && (
            <>
              <Link to="/my-trips" className="nav-bookings"><CalendarDays size={16} /> My bookings</Link>
              <Link to="/profile" className="nav-profile" aria-label="Your profile" title="Your profile">
                <UserRound size={17} /><span className="nav-profile-label">Profile</span>
                <span className="avatar" aria-hidden="true">{user.full_name.charAt(0).toUpperCase()}</span>
              </Link>
              <button type="button" className="nav-signout" onClick={() => dispatch(logout())} aria-label="Sign out">
                <LogOut size={17} />
              </button>
            </>
          )}

          {status === 'ready' && !user && (
            <Link to="/login" className="btn btn-primary nav-signin">Sign in</Link>
          )}
        </div>
        <button type="button" className="nav-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
