import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadAdminBookings } from '../store/slices/adminBookingsSlice';
import StatusBadge from '../components/bookings/StatusBadge';
import Button from '../components/ui/Button';
import Text from '../components/ui/Text';
import { formatDate, formatPrice, paymentLabel } from '../utils/booking';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminReservationsPage() {
  const dispatch = useAppDispatch();
  const { list, listStatus, listError } = useAppSelector((state) => state.adminBookings);

  // The filters live in the address bar, so refreshing keeps them and links can be shared
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    dispatch(loadAdminBookings({ status: status || undefined, q: q || undefined, page }));
  }, [dispatch, status, q, page]);

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    update({ q: searchText.trim(), page: '' });
  }

  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));

  return (
    <section>
      <div className="section-head">
        <h2 className="section-title" style={{ margin: 0 }}>Reservations</h2>
        <span className="summary-muted">{list.total} found</span>
      </div>

      <form className="search-bar" onSubmit={handleSearch} style={{ marginTop: 0, marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            value={searchText}
            placeholder="Guest name, email or reference"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(event) => update({ status: event.target.value, page: '' })}>
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Search</Button>
      </form>

      {listError && <p role="alert" className="form-error">{listError}</p>}
      {listStatus === 'loading' && list.items.length === 0 && <Text>Loading...</Text>}
      {listStatus === 'succeeded' && list.items.length === 0 && (
        <Text variant="caption">No reservations match these filters.</Text>
      )}

      {list.items.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Guest</th>
                <th scope="col">Hotel and room</th>
                <th scope="col">Stay</th>
                <th scope="col">Status</th>
                <th scope="col">Payment</th>
                <th scope="col">Total</th>
                <th scope="col"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.booking_reference}</strong></td>
                  <td>
                    {booking.guest_name}
                    <div className="summary-muted">{booking.guest_email}</div>
                  </td>
                  <td>
                    {booking.hotel_name}
                    <div className="summary-muted">{booking.room_name} × {booking.rooms}</div>
                  </td>
                  <td>
                    {formatDate(booking.check_in)}
                    <div className="summary-muted">to {formatDate(booking.check_out)}</div>
                  </td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>{paymentLabel(booking.payment_status)}</td>
                  <td>{formatPrice(booking.total_price)}</td>
                  <td>
                    <Link
                      to={`/admin/reservations/${booking.id}`}
                      className="btn btn-secondary btn-small"
                      aria-label={`Open reservation ${booking.booking_reference}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="secondary"
            className="btn-small"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <span aria-live="polite">Page {page} of {totalPages}</span>
          <Button
            variant="secondary"
            className="btn-small"
            disabled={page >= totalPages}
            onClick={() => update({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}