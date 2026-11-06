import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import type { Review } from '../../types/review';

type ReviewListProps = {
  reviews: Review[];
  canRemove: boolean;
  onRemove: (id: string) => void;
};

export default function ReviewList({ reviews, canRemove, onRemove }: ReviewListProps) {
  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id} className="review">
          <div className="review-head">
            <StarRating value={review.rating} />
            <strong>{review.author}</strong>
            <span className="summary-muted">
              {new Date(review.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          {/* Shown as plain text. React escapes it, so a comment can never run code. */}
          {review.comment && <p className="review-comment">{review.comment}</p>}
          {canRemove && (
            <Button variant="secondary" className="btn-small btn-danger" onClick={() => onRemove(review.id)}>
              Remove review
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}