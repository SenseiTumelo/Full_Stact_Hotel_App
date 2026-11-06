export default function StarRating({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      {'★'.repeat(filled)}
      <span className="stars-off">{'★'.repeat(5 - filled)}</span>
    </span>
  );
}