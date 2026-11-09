import axios from 'axios';
import type { Amenity, Hotel, HotelDetails, HotelInput, RoomTypeInput } from '../types/hotel';
import type { User } from '../types/user';
import type { Booking, BookingList, BookingPayload, ModifyPayload, ReviewSummary, RoomAvailability } from '../types/booking';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export type HotelSearch = {
  city?: string;
  minStars?: number;
  maxPrice?: number;
};

export async function fetchHotels(search: HotelSearch = {}): Promise<Hotel[]> {
  const response = await api.get('/hotels', {params: search});
  return response.data;
}

export async function fetchHotelById(id: string): Promise<HotelDetails> {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function loginWithPasswordRequest(input: { email: string; password: string }): Promise<User> {
  const response = await api.post('/auth/login', input);
  return response.data;
}

export async function registerWithPasswordRequest(input: { fullName: string; email: string; password: string }): Promise<User> {
  const response = await api.post('/auth/register', input);
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string
): Promise<RoomAvailability[]> {
  const response = await api.get(`/hotels/${hotelId}/availability`, { params: { checkIn, checkOut } });
  return response.data;
}

export async function createBookingRequest(payload: BookingPayload): Promise<Booking> {
  const response = await api.post('/bookings', payload);
  return response.data;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const response = await api.get('/bookings/me');
  return response.data;
}

export async function cancelBookingRequest(id: string): Promise<Booking> {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
}
export async function createPaymentIntentRequest(
  bookingId: string
): Promise<{ clientSecret: string; amount: number; currency: string }> {
  const response = await api.post('/payments/intent', { bookingId });
  return response.data;
}

export async function fetchAmenities(): Promise<Amenity[]> {
  const response = await api.get('/amenities');
  return response.data;
}

export async function createHotelRequest(input: HotelInput): Promise<HotelDetails> {
  const response = await api.post('/admin/hotels', input);
  return response.data;
}

export async function updateHotelRequest(id: string, input: HotelInput): Promise<HotelDetails> {
  const response = await api.patch(`/admin/hotels/${id}`, input);
  return response.data;
}

export async function deleteHotelRequest(id: string): Promise<void> {
  await api.delete(`/admin/hotels/${id}`);
}

export async function uploadHotelImagesRequest(hotelId: string, files: File[]): Promise<void> {
  const data = new FormData();
  files.forEach((file) => data.append('images', file));
  // Do not set Content-Type yourself: the browser adds the correct one with the file boundary
  await api.post(`/hotels/${hotelId}/images`, data, { timeout: 60000 });
}

export async function deleteHotelImageRequest(hotelId: string, imageId: string): Promise<void> {
  await api.delete(`/admin/hotels/${hotelId}/images/${imageId}`);
}

export async function createRoomTypeRequest(hotelId: string, input: RoomTypeInput): Promise<void> {
  await api.post(`/admin/hotels/${hotelId}/room-types`, input);
}

export async function updateRoomTypeRequest(id: string, input: RoomTypeInput): Promise<void> {
  await api.patch(`/admin/room-types/${id}`, input);
}

export async function deleteRoomTypeRequest(id: string): Promise<void> {
  await api.delete(`/admin/room-types/${id}`);
}

export async function uploadRoomTypeImagesRequest(roomTypeId: string, files: File[]): Promise<void> {
  const data = new FormData();
  files.forEach((file) => data.append('images', file));
  await api.post(`/admin/room-types/${roomTypeId}/images`, data, { timeout: 60000 });
}

export async function deleteRoomTypeImageRequest(roomTypeId: string, imageId: string): Promise<void> {
  await api.delete(`/admin/room-types/${roomTypeId}/images/${imageId}`);
}

export async function fetchAdminBookings(params: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<BookingList> {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
}

export type AdminDashboardData = {
  hotels: number;
  roomTypes: number;
  bookings: number;
  pendingBookings: number;
  activeBookings: number;
  paidRevenue: string;
  reviews: number;
  recentBookings: Booking[];
};

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  booking_id: string;
  hotel_id: string;
  hotel_name: string;
  author: string;
};

export type AdminReviewList = { items: AdminReview[]; total: number; page: number; pageSize: number };

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await api.get('/admin/dashboard');
  return response.data;
}

export async function fetchAdminReviews(params: { q?: string; page?: number }): Promise<AdminReviewList> {
  const response = await api.get('/admin/reviews', { params });
  return response.data;
}

export async function fetchAdminBooking(id: string): Promise<Booking> {
  const response = await api.get(`/admin/bookings/${id}`);
  return response.data;
}

export async function approveBookingRequest(id: string): Promise<Booking> {
  const response = await api.post(`/admin/bookings/${id}/approve`);
  return response.data;
}

export async function completeBookingRequest(id: string): Promise<Booking> {
  const response = await api.post(`/admin/bookings/${id}/complete`);
  return response.data;
}

export async function cancelBookingAdminRequest(id: string): Promise<Booking> {
  const response = await api.post(`/admin/bookings/${id}/cancel`, undefined, { timeout: 30000 });
  return response.data;
}

export async function modifyBookingRequest(id: string, payload: ModifyPayload): Promise<Booking> {
  const response = await api.patch(`/admin/bookings/${id}`, payload);
  return response.data;
}

export async function fetchHotelReviews(hotelId: string): Promise<ReviewSummary> {
  const response = await api.get(`/hotels/${hotelId}/reviews`);
  return response.data;
}

export async function createReviewRequest(payload: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<{ id: string; hotelId: string }> {
  const response = await api.post('/reviews', payload);
  return response.data;
}

export async function deleteReviewRequest(id: string): Promise<void> {
  await api.delete(`/admin/reviews/${id}`);
}
