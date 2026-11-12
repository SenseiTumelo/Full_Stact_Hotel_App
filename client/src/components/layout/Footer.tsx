import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export default function Footer() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Link to="/" className="brand" aria-label="Sensei Hotels home">
              <span className="brand-monogram">S</span>
              <span className="brand-copy"><strong>Sensei</strong><small>Hotels & stays</small></span>
            </Link>
            <p>Thoughtful places, warm hospitality, and time well spent.</p>
          </div>

          <nav className="site-footer-links" aria-label="Footer navigation">
            <strong>Explore</strong>
            <Link to="/#stays"><MapPin size={15} /> Find a stay</Link>
            {isAdmin
              ? <Link to="/admin">Manage your properties <ArrowUpRight size={14} /></Link>
              : user && <Link to="/my-trips">My trips <ArrowUpRight size={14} /></Link>}
          </nav>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Sensei Hotels</span>
          <Link to="/">Made for stays worth remembering <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </footer>
  );
}
