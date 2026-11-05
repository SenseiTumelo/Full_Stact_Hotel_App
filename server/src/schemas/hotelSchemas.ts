import { z } from 'zod';

export const hotelSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  starRating: z.number().int().min(1).max(5),
  policies: z.string().trim().max(2000).optional(),
  amenityIds: z.array(z.number().int().positive()).max(50).default([]),
});

// For PATCH: every field becomes optional, and only the ones sent are changed
export const hotelUpdateSchema = hotelSchema.partial();

export const roomTypeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  capacity: z.number().int().min(1).max(20),
  pricePerNight: z.number().min(0).max(1_000_000),
  totalRooms: z.number().int().min(0).max(1000),
});

export const roomTypeUpdateSchema = roomTypeSchema.partial();

export type HotelInput = z.infer<typeof hotelSchema>;
export type HotelUpdate = z.infer<typeof hotelUpdateSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type RoomTypeUpdate = z.infer<typeof roomTypeUpdateSchema>;