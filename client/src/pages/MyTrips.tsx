import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { cancelMyBooking, loadMyBookings } from '../store/slices/bookingSlice';
import BookingCard from '../components/bookings/BookingCard';
import Text from '../components/ui/Text';
import type { Booking } from '../types/booking';
import { todayIso } from '../utils/booking';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { getErrorMessage } from '../utils/errors';

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

      {mineStatus === 'loading' && <Text>Loading...</Text>}
      {mineError && <p role="alert" className="form-error">{mineError}</p>}
      {mineStatus === 'succeeded' && visible.length === 0 && (
        <Text variant="caption">No {tab} bookings.</Text>
      )}

      <div className="trip-list">
        {visible.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
        ))}
      </div>
    </main>
  );
}
