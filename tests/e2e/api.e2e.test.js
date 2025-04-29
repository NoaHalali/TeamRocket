/** 
import express from 'express';
import request from 'supertest';
import pollRoutes from '../../src/route/PollRoute.js';

const app = express();
app.use(express.json());
app.use('/api', pollRoutes);

describe('E2E API Tests', () => {
  test('Full poll flow', async () => {
    await request(app).post('/api/users').send({ username: 'daniel' }).expect(201);
    const createRes = await request(app).post('/api/polls').send({
      question: 'Favorite color?',
      options: ['Red', 'Blue'],
      username: 'daniel'
    }).expect(201);

    const pollId = createRes.body.uuid;
    await request(app).post(`/api/polls/${pollId}/vote`).send({ option: 0, username: 'daniel' }).expect(200);
    await request(app).get(`/api/polls/voter/daniel`).expect(200);
    await request(app).delete(`/api/polls/${pollId}`).send({ username: 'daniel' }).expect(200);
  });
});
**/



// tests/e2e/api.e2e.test.js
import { jest } from '@jest/globals';
import axios from 'axios';
import { start, stop } from '../../src/server/startServer.js';

jest.setTimeout(10_000);          // plenty for network I/O

describe('🌐 API E2E – real HTTP requests', () => {
  let baseURL;

  /* -------------------------------------------------------------- *
   * Spin-up / tear-down                                            *
   * -------------------------------------------------------------- */
  beforeAll(async () => {
    ({ baseURL } = await start());
  });

  afterAll(async () => {
    await stop();
  });

  /* -------------------------------------------------------------- *
   * 1. Create user                                                 *
   * -------------------------------------------------------------- */
  test('create a new user (POST /users)', async () => {
    const res = await axios.post(`${baseURL}/users`, { username: 'alice' });
    expect(res.status).toBe(201);
    expect(res.data.message).toMatch(/alice/);
  });

  /* -------------------------------------------------------------- *
   * 2. Duplicate user should fail                                  *
   * -------------------------------------------------------------- */
  test('duplicate user returns 400', async () => {
    const fail = axios.post(`${baseURL}/users`, { username: 'alice' });
    await expect(fail).rejects.toMatchObject({ response: { status: 400 } });
  });

  /* -------------------------------------------------------------- *
   * 3. Create poll                                                 *
   * -------------------------------------------------------------- */
  let pollId;      // captured for later tests
  test('create poll (POST /polls)', async () => {
    const body = {
      question: 'Tea or Coffee?',
      options: ['Tea', 'Coffee'],
      username: 'alice'
    };
    const res = await axios.post(`${baseURL}/polls`, body);
    expect(res.status).toBe(201);
    pollId = res.data.message.match(/"(.+?)"/)[1]; // extract uuid from message
    expect(pollId).toBeDefined();
  });

  /* -------------------------------------------------------------- *
   * 4. Vote in poll                                                *
   * -------------------------------------------------------------- */
  test('vote succeeds (POST /polls/:id/vote)', async () => {
    const res = await axios.post(`${baseURL}/polls/${pollId}/vote`, {
      option: 1,              // Coffee
      username: 'bob'
    });
    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/bob/);
  });

  /* -------------------------------------------------------------- *
   * 5. Retrieve poll list & verify vote count                      *
   * -------------------------------------------------------------- */
  test('list polls and validate results (GET /polls)', async () => {
    const res = await axios.get(`${baseURL}/polls`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    const poll = res.data.find(p => p.uuid === pollId);
    expect(poll).toBeDefined();
    expect(poll.totalVotes).toBe(1);
    expect(poll.results).toEqual({ Tea: 0, Coffee: 1 });
  });

  /* -------------------------------------------------------------- *
   * 6. Delete poll by creator                                      *
   * -------------------------------------------------------------- */
  test('delete poll (DELETE /polls/:id)', async () => {
    const res = await axios.delete(`${baseURL}/polls/${pollId}`, {
      data: { username: 'alice' }
    });
    expect(res.status).toBe(200);

    // confirm it’s gone
    const list = await axios.get(`${baseURL}/polls`);
    const remaining = Array.isArray(list.data) ? list.data : []; // defensive check
    expect(remaining.find(p => p.uuid === pollId)).toBeUndefined();
  });
});
