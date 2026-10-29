import axios from 'axios';
import type { Hotel, HotelDetails } from '../types/hotel';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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