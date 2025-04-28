// src/server/startServer.js
import http from 'http';
import app from '../app.js';

let server;
const sockets = new Set();

export async function start() {
  return new Promise(res => {
    server = http.createServer(app);

    // track keep-alive sockets
    server.on('connection', s => {
      sockets.add(s);
      s.on('close', () => sockets.delete(s));
    });

    server.listen(0, () => {
      const { port } = server.address();
      res({ baseURL: `http://localhost:${port}/api` });
    });
  });
}

export async function stop() {
  // destroy any open keep-alive sockets
  for (const s of sockets) s.destroy();

  return new Promise(res => server.close(res));
}
