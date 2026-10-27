import axios from 'axios';
import type { Hotel } from '../types/hotel';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function fetchHotels(): Promise<Hotel[]> {
  const response = await api.get('/hotels');
  return response.data;
}