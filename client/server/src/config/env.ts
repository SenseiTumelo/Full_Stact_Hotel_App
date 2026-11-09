function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Generate one with crypto.randomBytes(48).');
}

const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const clientUrl = (process.env.CLIENT_URL || (vercelProjectUrl ? `https://${vercelProjectUrl}` : required('CLIENT_URL'))).replace(/\/+$/, '');
if (process.env.NODE_ENV === 'production' && !clientUrl.startsWith('https://')) {
  throw new Error('CLIENT_URL must start with https:// in production');
}
export const env = {
  isProd: process.env.NODE_ENV === 'production',
  clientUrl,
  jwtSecret,
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};
