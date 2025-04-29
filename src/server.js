/**
 * @module server
 * @description
 * Entry point for starting the Express server in non-test environments.
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

if (process.env.NODE_ENV !== 'test') {
  /**
   * Start the server on the specified port (default: 3000).
   * Logs the server URL to the console.
   */
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  );
}

export default app; // for testing purposes