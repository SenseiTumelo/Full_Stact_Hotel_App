import type { Booking, BookingStatus } from "../../types/booking";
import { formatDate, formatPrice, todayIso } from "../../utils/booking";
import { imageUrl } from "../../utils/imageUrl";
import Button from "../ui/Button";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Awaiting confirmation",
  approved: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

type BookingCardProps = {
  booking: Booking;
  onCancel: (id: string) => void;
};

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const isPaid = booking.payment_status === "paid";
  const canCancel =
    !isPaid &&
    (booking.status === "pending" || booking.status === "approved") &&
    booking.check_in > todayIso();
  return (
    <article className="trip-card">
      <div className="trip-image">
        {booking.cover_image && (
          <img src={imageUrl(booking.cover_image)} alt="" loading="lazy" />
        )}
      </div>

      <div className="trip-info">
        <h2 style={{ margin: 0, fontSize: 20 }}>{booking.hotel_name}</h2>
        <span className="summary-muted">
          {booking.room_name} · {booking.hotel_city}
        </span>
        <span>
          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
        </span>
        <span className="summary-muted">
          {booking.rooms} room{booking.rooms === 1 ? "" : "s"} ·{" "}
          {booking.guests} guest{booking.guests === 1 ? "" : "s"} · Ref{" "}
          {booking.booking_reference}
        </span>
      </div>

      <div className="trip-side">
        <span className={`status status-${booking.status}`}>
          {STATUS_LABEL[booking.status]}
        </span>
        <strong>{formatPrice(booking.total_price)}</strong>
        <span className="summary-muted">
          {booking.payment_status === "paid"
            ? "Paid online"
            : booking.payment_status === "refunded"
              ? "Refunded"
              : "Pay at the hotel"}
        </span>
        {canCancel && (
          <Button variant="secondary" onClick={() => onCancel(booking.id)}>
            Cancel booking
          </Button>
        )}
      </div>
    </article>
  );
}
