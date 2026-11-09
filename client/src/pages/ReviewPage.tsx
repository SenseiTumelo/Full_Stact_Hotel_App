import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadMyBookings } from '../store/slices/bookingSlice';
import { resetSubmit, submitReview } from '../store/slices/reviewsSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StarRatingInput from '../components/ui/StarRatingInput';
import Button from '../components/ui/Button';
import Text from '../components/ui/Text';
import { formatDate, todayIso } from '../utils/booking';
import EmptyState from '../components/ui/EmptyState';
import { CalendarDays, RefreshCw } from 'lucide-react';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mine, mineStatus } = useAppSelector((state) => state.booking);
  const { submitStatus, submitError } = useAppSelector((state) => state.reviews);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    dispatch(resetSubmit());
    dispatch(loadMyBookings()); // always fresh, so "already reviewed" is up to date
  }, [dispatch]);

  const booking = mine.find((item) => item.id === id);

  if (!booking) {
    if (mineStatus === 'loading' || mineStatus === 'idle') return <main className="container section"><Text>Loading...</Text></main>;
    return (
      <main className="container section">
        <EmptyState icon={CalendarDays} title={mineStatus === 'failed' ? 'Your booking could not be loaded' : 'Booking not found'} description={mineStatus === 'failed' ? 'Check your connection and try again.' : 'This reservation may have been removed or may not belong to your account.'}>
          {mineStatus === 'failed' && <Button variant="secondary" onClick={() => dispatch(loadMyBookings())}><RefreshCw size={15} /> Try again</Button>}
          <Link to="/my-trips" className="btn btn-primary">Back to my trips</Link>
        </EmptyState>
      </main>
    );
  }

  const confirmed = booking.status === 'approved' || booking.status === 'completed';
  const ended = booking.check_out <= todayIso();

  let blocked = '';
  if (booking.has_review) blocked = 'You have already reviewed this stay. Thank you!';
  else if (!confirmed) blocked = 'Only confirmed stays can be reviewed.';
  else if (!ended) blocked = 'You can leave a review after your check-out date.';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      setRatingError('Please choose a star rating.');
      return;
    }
    setRatingError('');

    const result = await dispatch(
      submitReview({ bookingId: booking!.id, rating, comment: comment.trim() || undefined })
    );
    if (submitReview.fulfilled.match(result)) {
      dispatch(loadMyBookings()); // so My trips shows "Reviewed"
      navigate(`/hotels/${booking!.hotel_id}#reviews`);
    }
  }

  return (
    <main className="container section">
      <Breadcrumbs items={[{ label: 'My trips', to: '/my-trips' }, { label: 'Leave a review' }]} />
      <h1 className="page-title">How was your stay?</h1>
      <p className="page-subtitle">
        {booking.hotel_name} · {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
      </p>

      {blocked ? (
        <div className="form-card">
          <p style={{ margin: 0 }}>{blocked}</p>
          <Link to="/my-trips" className="btn btn-secondary">Back to my trips</Link>
        </div>
      ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <StarRatingInput value={rating} onChange={setRating} />
          {ratingError && <p role="alert" className="form-error">{ratingError}</p>}

          <div className="field">
            <label htmlFor="comment">Your review (optional)</label>
            <textarea
              id="comment"
              maxLength={1000}
              placeholder="What did you like? What could be better?"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <span className="summary-muted">{comment.length} / 1000</span>
          </div>

          <p className="summary-muted">
            Your review is public and shows your first name and last initial.
          </p>

          {submitError && <p role="alert" className="form-error">{submitError}</p>}

          <Button type="submit" variant="dark" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? 'Posting...' : 'Post review'}
          </Button>
        </form>
      )}
    </main>
  );
}
