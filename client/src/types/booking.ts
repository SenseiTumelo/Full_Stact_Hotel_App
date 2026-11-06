export type BookingStatus = 'pending' | 'approved' | 'cancelled' | 'completed';

export type Booking = {
  id: string;
  booking_reference: string;
  status: BookingStatus;
  check_in: string;
  check_out: string;
  rooms: number;
  guests: number;
  total_price: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_request: string | null;
  created_at: string;
  room_name: string;
  hotel_id: string;
  hotel_name: string;
  hotel_city: string;
  cover_image: string | null;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | null;
};

export type RoomAvailability = { room_type_id: string; available: number };

export type BookingPayload = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest?: string;
};

// What the user has picked so far, before the booking is saved
export type BookingDraft = {
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomName: string;
  pricePerNight: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
};

export type BookingList = {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
};

export type ModifyPayload = {
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
};