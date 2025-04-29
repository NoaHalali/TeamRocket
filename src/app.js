/**
 * @module app
 * @description
 * Express application instance configured with middleware and routes.
 */

import express from 'express';
import pollRoutes from './route/PollRoute.js';

const app = express();

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Mount the poll-related routes under the `/api` base path.
 */
app.use('/api', pollRoutes);

export default app; // <── the tests & startServer import this
