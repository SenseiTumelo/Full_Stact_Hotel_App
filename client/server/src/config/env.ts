function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Generate one with crypto.randomBytes(48).');
}

const clientUrl = required('CLIENT_URL').replace(/\/+$/, '');
if (process.env.NODE_ENV === 'production' && !clientUrl.startsWith('https://')) {
  throw new Error('CLIENT_URL must start with https:// in production');
}
export const env = {
  isProd: process.env.NODE_ENV === 'production',
  clientUrl,
  jwtSecret,
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: required('GOOGLE_CALLBACK_URL'),
  stripeSecretKey: required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: required('STRIPE_WEBHOOK_SECRET'),
};