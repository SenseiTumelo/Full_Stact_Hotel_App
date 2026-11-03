export const MAX_NIGHTS = 30;

// "2026-12-01" → milliseconds, or null if it's not a real date (like 2026-02-31)
export function parseIsoDate(value: string): number | null {
  const [year, month, day] = value.split('-').map(Number);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return isReal ? time : null;
}

export function todayIso(): string {
  return new Date().toLocaleDateString('en-CA'); // en-CA formats as YYYY-MM-DD
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((parseIsoDate(checkOut)! - parseIsoDate(checkIn)!) / 86_400_000);
}

// Returns an error message, or null when the stay is fine
export function validateStay(checkIn: string, checkOut: string): string | null {
  const inTime = parseIsoDate(checkIn);
  const outTime = parseIsoDate(checkOut);

  if (inTime === null || outTime === null) return 'Dates must be real dates in YYYY-MM-DD format';
  if (checkIn < todayIso()) return 'Check-in cannot be in the past';
  if (outTime <= inTime) return 'Check-out must be after check-in';
  if (nightsBetween(checkIn, checkOut) > MAX_NIGHTS) {
    return `You can book at most ${MAX_NIGHTS} nights at a time`;
  }
  return null;
}