import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  approveAdminBooking,
  cancelAdminBooking,

  loadAdminBooking,
  modifyAdminBooking,
} from '../store/slices/adminBookingsSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StatusBadge from '../components/bookings/StatusBadge';
import Button from '../components/ui/Button';
import Text from '../components/ui/Text';
import type { Booking } from '../types/booking';
import { formatDate, formatPrice, nightsBetween, paymentLabel, todayIso } from '../utils/booking';

function ModifyForm({ booking }: { booking: Booking }) {
  const dispatch = useAppDispatch();
  const busy = useAppSelector((state) => state.adminBookings.actionBusy);

  const [checkIn, setCheckIn] = useState(booking.check_in);
  const [checkOut, setCheckOut] = useState(booking.check_out);
  const [rooms, setRooms] = useState(String(booking.rooms));
  const [guests, setGuests] = useState(String(booking.guests));

  const valid = checkOut > checkIn && nightsBetween(checkIn, checkOut) <= 30;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    dispatch(
      modifyAdminBooking({
        id: booking.id,
        payload: { checkIn, checkOut, rooms: Number(rooms), guests: Number(guests) },
      })
    );
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit} aria-labelledby="modify-heading">
      <h2 id="modify-heading">Change dates, rooms or guests</h2>
      <div className="form-row">
        <div className="field">
          <label htmlFor="mCheckIn">Check-in</label>
          <input id="mCheckIn" type="date" min={todayIso()} required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mCheckOut">Check-out</label>
          <input id="mCheckOut" type="date" min={checkIn} required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mRooms">Rooms</label>
          <input id="mRooms" type="number" min={1} max={10} required value={rooms} onChange={(e) => setRooms(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mGuests">Guests</label>
          <input id="mGuests" type="number" min={1} max={20} required value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
      </div>
      <p className="summary-muted">
        The booking keeps its original nightly rate. If it has a payment attached, the total must stay the same.
      </p>
      <div>
        <Button type="submit" variant="dark" disabled={busy || !valid}>
          {busy ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: booking, currentStatus, actionBusy, actionError, actionNote } = useAppSelector(
    (state) => state.adminBookings
  );

  useEffect(() => {
    if (id) dispatch(loadAdminBooking(id));
  }, [id, dispatch]);

  if (currentStatus === 'failed') {
    return (
      <section>
        <Text variant="heading">Reservation not found</Text>
        <p><Link to="/admin/reservations">Back to reservations</Link></p>
      </section>
    );
  }
  if (!booking || booking.id !== id) return <Text>Loading...</Text>;

  const canApprove = booking.status === 'pending';
  const canChange = booking.status === 'pending' || booking.status === 'approved';
  const isPaid = booking.payment_status === 'paid';
  const nights = nightsBetween(booking.check_in, booking.check_out);

  function handleApprove() {
    dispatch(approveAdminBooking(booking!.id));
  }

  function handleCancel() {
    const question = isPaid
      ? `Cancel ${booking!.booking_reference} and refund ${formatPrice(booking!.total_price)} to the guest's card?`
      : `Cancel ${booking!.booking_reference}?`;
    if (window.confirm(question)) dispatch(cancelAdminBooking(booking!.id));
  }

  return (
    <section>
      <Breadcrumbs
        items={[
          { label: 'Admin', to: '/admin/hotels' },
          { label: 'Reservations', to: '/admin/reservations' },
          { label: booking.booking_reference },
        ]}
      />

      <div className="section-head">
        <h2 className="section-title" style={{ margin: 0 }}>
          {booking.booking_reference} <StatusBadge status={booking.status} />
        </h2>
      </div>

      {actionNote && <p role="status" className="success-note">{actionNote}</p>}
      {actionError && <p role="alert" className="form-error">{actionError}</p>}

      <div className="admin-section">
        <h2>Stay</h2>
        <dl className="detail-list">
          <div><dt>Hotel</dt><dd>{booking.hotel_name}, {booking.hotel_city}</dd></div>
          <div><dt>Room</dt><dd>{booking.room_name} × {booking.rooms}</dd></div>
          <div><dt>Check-in</dt><dd>{formatDate(booking.check_in)}</dd></div>
          <div><dt>Check-out</dt><dd>{formatDate(booking.check_out)} ({nights} night{nights === 1 ? '' : 's'})</dd></div>
          <div><dt>Guests</dt><dd>{booking.guests}</dd></div>
          <div><dt>Total</dt><dd>{formatPrice(booking.total_price)}</dd></div>
        </dl>
      </div>

      <div className="admin-section">
        <h2>Guest</h2>
        <dl className="detail-list">
          <div><dt>Name</dt><dd>{booking.guest_name}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${booking.guest_email}`}>{booking.guest_email}</a></dd></div>
          <div><dt>Phone</dt><dd><a href={`tel:${booking.guest_phone}`}>{booking.guest_phone}</a></dd></div>
          <div><dt>Special request</dt><dd>{booking.special_request || 'None'}</dd></div>
        </dl>
      </div>

      <div className="admin-section">
        <h2>Payment</h2>
        <dl className="detail-list">
          <div><dt>Status</dt><dd>{paymentLabel(booking.payment_status)}</dd></div>
        </dl>
      </div>

      {canChange && (
        <div className="admin-section">
          <h2>Actions</h2>
          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            {canApprove && (
              <Button variant="dark" onClick={handleApprove} disabled={actionBusy}>
                {actionBusy ? 'Working...' : 'Approve booking'}
              </Button>
            )}
            <Button variant="secondary" className="btn-danger" onClick={handleCancel} disabled={actionBusy}>
              {isPaid ? 'Cancel and refund' : 'Cancel booking'}
            </Button>
          </div>
        </div>
      )}

      {canChange && (
        <ModifyForm
          key={`${booking.check_in}-${booking.check_out}-${booking.rooms}-${booking.guests}`}
          booking={booking}
        />
      )}
    </section>
  );
}