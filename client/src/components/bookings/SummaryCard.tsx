import { formatDate, formatPrice, nightsBetween, totalPrice } from '../../utils/booking';

type SummaryCardProps = {
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  pricePerNight: string;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function SummaryCard(props: SummaryCardProps) {
  const nights = nightsBetween(props.checkIn, props.checkOut);
  const total = totalPrice(props.pricePerNight, nights, props.rooms);

  return (
    <aside className="summary-card" aria-label="Booking summary">
      <p className="eyebrow">Your stay</p>
      <h2>{props.hotelName}</h2>
      <p className="summary-muted">{props.roomName}</p>
      <hr />
      <div className="summary-dates">
        <div>
          <span className="eyebrow">Check-in</span>
          <strong>{formatDate(props.checkIn)}</strong>
        </div>
        <div>
          <span className="eyebrow">Check-out</span>
          <strong>{formatDate(props.checkOut)}</strong>
        </div>
      </div>
      <p className="summary-muted">
        {plural(nights, 'night')} · {plural(props.guests, 'guest')} · {plural(props.rooms, 'room')}
      </p>
      <hr />
      <div className="summary-row">
        <span>
          {formatPrice(props.pricePerNight)} × {plural(nights, 'night')} × {plural(props.rooms, 'room')}
        </span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      <p className="summary-muted">No payment is taken yet.</p>
    </aside>
  );
}