import appModule from '../server/dist/app.js';

const app = appModule.default || appModule;

export default function handler(request, response) {
  // Vercel serves this as one stable function and forwards the original API
  // path through the `path` query parameter in vercel.json.
  const incoming = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const originalPath = incoming.searchParams.get('path');
  if (!originalPath || !originalPath.startsWith('/api/v1/')) {
    response.statusCode = 400;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ message: 'Invalid API route' }));
    return;
  }

  incoming.searchParams.delete('path');
  request.url = `${originalPath}${incoming.search}`;
  return app(request, response);
}
