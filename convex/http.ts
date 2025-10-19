import { httpRouter } from 'convex/server';

import { authComponent, createAuth } from './auth';
import { checkParking } from './easypark';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

// Easypark API endpoint
http.route({
  path: '/easypark-check',
  method: 'GET',
  handler: checkParking,
});

export default http;
