import appModule from '../../server/dist/app.js';

const app = appModule.default || appModule;

export default function handler(request, response) {
  return app(request, response);
}
