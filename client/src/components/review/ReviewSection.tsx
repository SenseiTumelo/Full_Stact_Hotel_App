import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadReviews, removeReview } from '../../store/slices/reviewsSlice';
import ReviewList from './ReviewList';
import StarRating from '../ui/StarRating';
import Text from '../ui/Text';
import { useFeedback } from '../ui/FeedbackProvider';

export default function ReviewSection({ hotelId }: { hotelId: string }) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { hotelId: loadedId, average, count, items, status, removeError } = useAppSelector(
    (state) => state.reviews
  );
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const { confirm, notify } = useFeedback();

  useEffect(() => {
    dispatch(loadReviews(hotelId));
  }, [hotelId, dispatch]);

  // Arriving from the "Leave a review" page: scroll down to the reviews
  useEffect(() => {
    if (location.hash === '#reviews' && status === 'succeeded') {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash, status]);

  async function handleRemove(id: string) {
    if (!await confirm({ title: 'Remove this review?', message: 'This review will no longer appear on the property page.', confirmLabel: 'Remove review', destructive: true })) return;
    const result = await dispatch(removeReview(id));
    if (removeReview.fulfilled.match(result)) {
      notify('Review removed.');
      dispatch(loadReviews(hotelId));
    } else {
      notify(result.payload ?? 'Could not remove review.', 'error');
    }
  }

  const ready = loadedId === hotelId;

  return (
    <section id="reviews" style={{ marginTop: 48 }} aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="section-title">Guest reviews</h2>

      {!ready && status !== 'failed' && <Text variant="caption">Loading reviews...</Text>}
      {status === 'failed' && <Text variant="caption">Could not load reviews.</Text>}
      {removeError && <p role="alert" className="form-error">{removeError}</p>}

      {ready && status === 'succeeded' && count === 0 && (
        <Text variant="caption">No reviews yet. Guests can review after their stay.</Text>
      )}

      {ready && count > 0 && (
        <>
          <div className="review-summary">
            <span className="review-score">{average.toFixed(1)}</span>
            <StarRating value={average} />
            <span className="summary-muted">{count} review{count === 1 ? '' : 's'}</span>
          </div>
          <ReviewList reviews={items} canRemove={isAdmin} onRemove={handleRemove} />
          {count > items.length && (
            <p className="summary-muted">Showing the {items.length} most recent reviews.</p>
          )}
        </>
      )}
    </section>
  );
}
