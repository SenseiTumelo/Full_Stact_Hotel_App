import { Star } from 'lucide-react';

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <fieldset className="rating-input">
      <legend>Your rating</legend>
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className={star <= value ? 'on' : ''}>
          <input
            type="radio"
            name="rating"
            value={star}
            checked={value === star}
            onChange={() => onChange(star)}
          />
          <Star aria-hidden="true" size={28} fill={star <= value ? 'currentColor' : 'none'} />
          <span className="sr-only">{star} star{star === 1 ? '' : 's'}</span>
        </label>
      ))}
    </fieldset>
  );
}
