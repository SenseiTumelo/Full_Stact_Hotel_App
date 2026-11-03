export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'guest' | 'admin';
};