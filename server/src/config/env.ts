function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: required('CLIENT_URL'),
  jwtSecret: required('JWT_SECRET'),
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: required('GOOGLE_CALLBACK_URL'),
  stripeSecretKey: required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: required('STRIPE_WEBHOOK_SECRET'),
};