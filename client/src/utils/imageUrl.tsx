
const API_ORIGIN = import.meta.env.PROD
  ? ''
  : String(import.meta.env.VITE_API_URL || '/api/v1').replace(/\/api\/v1\/?$/, '');

export function imageUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}
