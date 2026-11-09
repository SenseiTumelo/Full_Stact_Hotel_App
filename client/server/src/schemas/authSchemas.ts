import { z } from 'zod';

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8, 'Use at least 8 characters').max(128, 'Password is too long');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name').max(100),
  email,
  password,
});

export const loginSchema = z.object({ email, password });

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name').max(100),
  phone: z.string().trim().max(20).refine((value) => !value || /^\+?[0-9 ()-]{7,20}$/.test(value), 'Enter a valid phone number').nullable(),
});
