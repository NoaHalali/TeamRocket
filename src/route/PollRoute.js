import express from 'express';
import PollsManager from '../services/PollsManager.js';
import UserManager from '../services/UserManager.js';

const router = express.Router();

// Parse JSON bodies for all routes in this router
router.use(express.json());

const pollsManager = new PollsManager();
const userManager = new UserManager();

// Create a new user
router.post('/users', async (req , res ) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  }

  try {
    await userManager.createUser(username.trim());
    res.status(201).json({ message: `User "${username}" created successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List all polls
router.get('/polls', async (req, res) => {
  try {
    const polls = await pollsManager.getPolls();
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List polls created by a specific user
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List polls a user has voted in
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on a poll
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
    await pollsManager.vote(id, parseInt(option), username.trim());
    res.status(200).json({ message: `Vote recorded for option "${option}" by user "${username}".` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new poll
router.post('/polls', async (req, res) => {
  const { question, options, username } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Poll question cannot be empty.' });
  }

  if (
    !Array.isArray(options) ||
    !options.every(opt => typeof opt === 'string' && opt.trim().length > 0) ||
    options.length < 2
  ) {
    return res.status(400).json({ error: 'Poll must have at least 2 non-empty options.' });
  }

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.'});
  }

  try {
    const poll = await pollsManager.createPoll(question.trim(), options.map(opt => opt.trim()), username.trim());
    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a poll
router.delete('/polls/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username must be a non-empty string.' });
  } 

  try {
    await pollsManager.deletePoll(id, username.trim());
    res.status(200).json({ message: 'Poll deleted successfully.' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Only the creator')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

export default router;