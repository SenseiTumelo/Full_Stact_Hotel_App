
const API_ORIGIN = String(import.meta.env.VITE_API_URL).replace(/\/api\/v1\/?$/, '');

export function imageUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}