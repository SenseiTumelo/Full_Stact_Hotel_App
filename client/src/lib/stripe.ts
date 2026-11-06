import { loadStripe } from '@stripe/stripe-js';

// Created once, outside any component, so Stripe.js loads a single time
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);