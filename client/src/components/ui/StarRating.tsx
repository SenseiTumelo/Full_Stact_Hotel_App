import { Star } from 'lucide-react';

export default function StarRating({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} strokeWidth={1.8} fill={star <= filled ? 'currentColor' : 'none'} className={star <= filled ? '' : 'stars-off'} aria-hidden="true" />)}
    </span>
  );
}
