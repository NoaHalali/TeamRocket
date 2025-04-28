// src/app.js
import express from 'express';
import pollRoutes from './route/PollRoute.js';

const app = express();
app.use(express.json());
app.use('/api', pollRoutes);


export default app;            // <── the tests & startServer import this
