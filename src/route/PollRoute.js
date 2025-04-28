/**
 * @module pollRoutes
 * @description
 * Express router exposing the public HTTP API for **users** and **polls**.
 * Every route returns JSON and relies on the service layer
 * ({@link PollsManager} / {@link UserManager}) for business–logic.
 *
 * **Base‑path:** `/api` (mounted by the main Express app)
 *
 * > All request bodies are expected to be sent as `application/json`.
 */

import express from 'express';
import PollsManager from '../services/PollsManager.js';
import UserManager  from '../services/UserManager.js';

const router = express.Router();
router.use(express.json()); // parse JSON for all handlers

// ---------------------------------------------------------------------------
//  Singletons (in‑memory implementation)
// ---------------------------------------------------------------------------
const pollsManager = new PollsManager();
const userManager  = new UserManager();

/* ========================================================================== *
 *  USER ENDPOINTS                                                            *
 * ========================================================================== */

/**
 * Create a new **user**.
 *
 * @route POST /users
 * @param {string}   body.username  Unique, non‑empty username.
 * @returns {201|400} JSON `{ message }` on success or `{ error }`.
 */
router.post('/users', async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  }
  try {
    await userManager.createUser(username.trim());
    res.status(201).json({ message: `User "${username}" created successfully.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ========================================================================== *
 *  POLL READ ENDPOINTS                                                       *
 * ========================================================================== */

/**
 * Get **all polls**.
 *
 * @route GET /polls
 * @returns {200|500} Array of polls or `{ message }` if none; `{ error }` on server error.
 */
router.get('/polls', async (req, res) => {
  try {
    const polls = await pollsManager.getPolls();
    if (polls.length === 0) {
      return res.status(200).json({ message: 'No polls available.' });
    }
    res.status(200).json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List polls **created by** a specific user.
 *
 * @route GET /polls/creator?username=:user
 * @param {string} query.username Username to filter by.
 * @returns {200|400|404|500}
 */
router.get('/polls/creator', async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be provided as a query parameter.' });
  }
  try {
    const polls = await pollsManager.listPollsByCreator(username.trim());
    if (polls.length === 0) {
      return res.status(404).json({ message: `No polls found for user "${username}".` });
    }
    res.status(200).json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List polls a user has **voted in**.
 *
 * @route GET /polls/voter?username=:user
 * @returns {200|400|404|500}
 */
router.get('/polls/voter', async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be provided as a query parameter.' });
  }
  try {
    const polls = await pollsManager.listPollsVotedByUser(username.trim());
    if (polls.length === 0) {
      return res.status(404).json({ message: `No polls found that user "${username}" has voted in.` });
    }
    res.status(200).json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================================================================== *
 *  POLL WRITE ENDPOINTS                                                      *
 * ========================================================================== */

/**
 * Cast a **vote** in a poll.
 *
 * @route POST /polls/:id/vote
 * @param {string}   param.id         Poll UUID.
 * @param {number}   body.option      Zero‑based option index.
 * @param {string}   body.username    Voter username.
 * @returns {200|400} Success `{ message }` or error `{ error }`.
 */
router.post('/polls/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { option, username } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  }
  if (isNaN(option)) {
    return res.status(400).json({ error: 'Option must be a valid number.' });
  }
  try {
    await pollsManager.vote(id, parseInt(option, 10), username.trim());
    res.status(200).json({ message: `Vote recorded for option "${option}" by user "${username}".` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Create a **new poll**.
 *
 * @route POST /polls
 * @param {string}     body.question   Poll question text.
 * @param {string[]}   body.options    Array of option strings (≥ 2).
 * @param {string}     body.username   Creator username.
 * @returns {201|400} Success `{ message }` with poll UUID or `{ error }`.
 */
router.post('/polls', async (req, res) => {
  const { question, options, username } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Poll question cannot be empty.' });
  }
  if (!Array.isArray(options) || options.length < 2 || !options.every(o => typeof o === 'string' && o.trim())) {
    return res.status(400).json({ error: 'Poll must have at least 2 non-empty options.' });
  }
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  }
  try {
    if (!(await userManager.userExists(username.trim()))) {
      return res.status(400).json({ error: `User '${username}' does not exist. Please create the user first.` });
    }
    const poll = await pollsManager.createPoll(
      question.trim(),
      options.map(o => o.trim()),
      username.trim()
    );
    res.status(201).json({ message: `Poll "${poll.uuid}" created successfully.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a poll.
 *
 * @route DELETE /polls/:id
 * @param {string} param.id      Poll UUID.
 * @param {string} body.username Requester username (must match creator).
 * @returns {200|400|403|404} JSON `{ message }` or `{ error }`.
 */
router.delete('/polls/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  }
  try {
    await pollsManager.deletePoll(id, username.trim());
    res.status(200).json({ message: 'Poll deleted successfully.' });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('Only the creator')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;
