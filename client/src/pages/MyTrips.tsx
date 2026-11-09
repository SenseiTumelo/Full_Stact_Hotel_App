import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { cancelMyBooking, loadMyBookings } from '../store/slices/bookingSlice';
import BookingCard from '../components/bookings/BookingCard';
import Text from '../components/ui/Text';
import type { Booking } from '../types/booking';
import { todayIso } from '../utils/booking';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { getErrorMessage } from '../utils/errors';
import EmptyState from '../components/ui/EmptyState';
import { Ban, CalendarDays, Compass, History, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type Tab = (typeof TABS)[number]['key'];

function tabFor(booking: Booking, today: string): Tab {
  if (booking.status === 'cancelled') return 'cancelled';
  return booking.check_out >= today ? 'upcoming' : 'past';
}

export default function MyTrips() {
  const dispatch = useAppDispatch();
  const { mine, mineStatus, mineError } = useAppSelector((state) => state.booking);
  const [tab, setTab] = useState<Tab>('upcoming');
  const { confirm, notify } = useFeedback();

  useEffect(() => {
    dispatch(loadMyBookings());
  }, [dispatch]);

  const today = todayIso();
  const visible = mine.filter((booking) => tabFor(booking, today) === tab);

  async function handleCancel(id: string) {
    if (!await confirm({ title: 'Cancel this stay?', message: 'This reservation will be cancelled. You may need to contact the property about payments or refunds.', confirmLabel: 'Cancel booking', destructive: true })) return;
    try {
      await dispatch(cancelMyBooking(id)).unwrap();
      notify('Your reservation has been cancelled.');
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    }
  }

  return (
    <main className="container section">
      <Text variant="heading">My trips</Text>

      <div className="toggle-group" role="group" aria-label="Filter bookings">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="toggle-btn"
            aria-pressed={tab === item.key}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mineStatus === 'loading' && <div className="empty-state-loading">Loading your trips…</div>}
      {mineError && visible.length > 0 && <p role="alert" className="form-error">{mineError}</p>}
      {mineStatus === 'failed' && <EmptyState icon={CalendarDays} title="Your trips could not be loaded" description={mineError ?? 'Check your connection and try again.'}><Button variant="secondary" onClick={() => dispatch(loadMyBookings())}><RefreshCw size={15} /> Try again</Button></EmptyState>}
      {mineStatus === 'succeeded' && visible.length === 0 && (
        <EmptyState icon={tab === 'upcoming' ? Compass : tab === 'past' ? History : Ban} title={tab === 'upcoming' ? 'No upcoming stays' : tab === 'past' ? 'No past stays yet' : 'No cancelled stays'} description={tab === 'upcoming' ? 'Your next getaway will be waiting here after you book a stay.' : tab === 'past' ? 'Completed stays will appear here after checkout.' : 'Reservations you cancel will be listed here.'}>
          {tab === 'upcoming' && <Link to="/" className="btn btn-primary">Explore stays</Link>}
          {tab !== 'upcoming' && <button type="button" className="btn btn-secondary" onClick={() => setTab('upcoming')}>View upcoming stays</button>}
        </EmptyState>
      )}

      <div className="trip-list">
        {visible.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
        ))}
      </div>
    </main>
  );
}
