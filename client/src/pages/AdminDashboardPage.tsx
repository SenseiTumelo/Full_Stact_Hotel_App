import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminDashboard } from '../services/api';
import type { AdminDashboardData } from '../services/api';
import StatusBadge from '../components/bookings/StatusBadge';
import { formatDate, formatPrice } from '../utils/booking';
import { getErrorMessage } from '../utils/errors';
import { ArrowRight, ArrowUpRight, Building2, CalendarDays, Star } from 'lucide-react';

const EMPTY: AdminDashboardData = {
  hotels: 0, roomTypes: 0, bookings: 0, pendingBookings: 0,
  activeBookings: 0, paidRevenue: '0', reviews: 0, recentBookings: [],
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="admin-dashboard">
      <div className="admin-welcome">
        <div>
          <p className="eyebrow">Property operations</p>
          <h2>Overview</h2>
          <p>Keep your properties, reservations and guest feedback moving smoothly.</p>
        </div>
        <div className="admin-quick-actions">
          <Link to="/admin/hotels/new" className="btn btn-primary">Add a hotel</Link>
          <Link to="/admin/reservations?status=pending" className="btn btn-dark">Review pending</Link>
        </div>
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}

      <div className="admin-metrics" aria-label="Business summary">
        <article className="admin-metric"><span>Hotels</span><strong>{loading ? '—' : data.hotels}</strong><small>{data.roomTypes} room types</small></article>
        <article className="admin-metric"><span>Reservations</span><strong>{loading ? '—' : data.bookings}</strong><small>{data.activeBookings} active stays</small></article>
        <article className="admin-metric admin-metric-highlight"><span>Needs attention</span><strong>{loading ? '—' : data.pendingBookings}</strong><small>Reservations awaiting review</small></article>
        <article className="admin-metric"><span>Paid revenue</span><strong>{loading ? '—' : formatPrice(data.paidRevenue)}</strong><small>Successful online payments</small></article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="section-head">
            <div><p className="eyebrow">Latest activity</p><h2>Recent reservations</h2></div>
            <Link to="/admin/reservations" className="admin-text-link">All reservations <ArrowRight size={15} /></Link>
          </div>
          {loading ? <p className="summary-muted">Loading reservations…</p> : data.recentBookings.length === 0 ? (
            <div className="admin-empty"><strong>No reservations yet</strong><p>New guest reservations will show up here.</p></div>
          ) : (
            <div className="table-wrap admin-recent-wrap">
              <table className="admin-table">
                <thead><tr><th>Guest</th><th>Property</th><th>Stay</th><th>Status</th><th>Total</th><th /></tr></thead>
                <tbody>{data.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.guest_name}</strong><div className="summary-muted">{booking.booking_reference}</div></td>
                    <td>{booking.hotel_name}</td>
                    <td>{formatDate(booking.check_in)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>{formatPrice(booking.total_price)}</td>
                    <td><Link to={`/admin/reservations/${booking.id}`} className="admin-text-link">View</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="admin-panel admin-shortcuts">
          <p className="eyebrow">Manage your business</p>
          <h2>Quick links</h2>
          <Link to="/admin/hotels"><span className="shortcut-icon"><Building2 size={19} /></span><span><strong>Properties</strong><small>Add hotels, rooms, amenities and photos</small></span><ArrowUpRight size={16} /></Link>
          <Link to="/admin/reservations"><span className="shortcut-icon"><CalendarDays size={19} /></span><span><strong>Reservations</strong><small>Approve, update or cancel guest stays</small></span><ArrowUpRight size={16} /></Link>
          <Link to="/admin/reviews"><span className="shortcut-icon"><Star size={19} /></span><span><strong>Guest reviews</strong><small>{data.reviews} reviews to browse and moderate</small></span><ArrowUpRight size={16} /></Link>
          <div className="admin-tip"><strong>Pending queue</strong><p>{data.pendingBookings ? `${data.pendingBookings} reservation${data.pendingBookings === 1 ? '' : 's'} need your attention.` : 'You are all caught up on pending reservations.'}</p><Link to="/admin/reservations?status=pending">Open the queue <ArrowRight size={14} /></Link></div>
        </aside>
      </div>
    </section>
  );
}
