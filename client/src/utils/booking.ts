import type { Booking } from '../types/booking';

export function todayIso(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the user's own timezone
}

function toUtc(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((toUtc(checkOut) - toUtc(checkIn)) / 86_400_000);
}

// "2026-12-01" → "Tue, 1 Dec 2026"
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPrice(amount: number | string): string {
  return `R${Number(amount).toLocaleString('en-ZA', { maximumFractionDigits: 2 })}`;
}

// For display only. The server calculates the real total.
export function totalPrice(pricePerNight: string, nights: number, rooms: number): number {
  return (Math.round(Number(pricePerNight) * 100) * nights * rooms) / 100;
}

export function paymentLabel(status: Booking['payment_status']): string {
  if (status === 'paid') return 'Paid online';
  if (status === 'refunded') return 'Refunded';
  if (status === 'failed') return 'Payment failed';
  return 'Pay at the hotel';
}