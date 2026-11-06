import type { BookingStatus } from '../../types/booking';

const LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`status status-${status}`}>{LABEL[status]}</span>;
}