import axios from 'axios';
import type { Hotel, HotelDetails } from '../types/hotel';
import type { User } from '../types/user';

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

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}
