import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let appPromise;

export default async function handler(request, response) {
  try {
    // Vercel serves this as one stable function and forwards the original API
    // path through the `path` query parameter in vercel.json.
    const incoming = new URL(request.url || '/', `https://${request.headers.host || 'localhost'}`);
    const originalPath = incoming.searchParams.get('path');
    if (!originalPath || !(originalPath.startsWith('/api/v1/') || originalPath.startsWith('/uploads/'))) {
      response.statusCode = 400;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ message: 'Invalid API route' }));
      return;
    }

    incoming.searchParams.delete('path');
    request.url = `${originalPath}${incoming.search}`;
    appPromise ??= Promise.resolve().then(() => {
      const module = require('../server/dist/app.js');
      return module.default || module;
    });
    const app = await appPromise;
    return app(request, response);
  } catch (error) {
    console.error('API initialization failed:', error);
    const message = error instanceof Error ? error.message : '';
    const missingSetting = message.match(/Missing environment variable: ([A-Z0-9_]+)/)?.[1];
    response.statusCode = 503;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({
      message: missingSetting
        ? `The API is missing the ${missingSetting} deployment setting.`
        : 'The API could not start. Check the Vercel function logs.',
    }));
  }
}
