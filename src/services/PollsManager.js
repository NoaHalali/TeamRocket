/**
 * @module PollsManager
 * @description
 * Service‑layer façade that wraps {@link PollsMemoryManagement} to expose the
 * business‑logic API required by the application (create poll, vote, list, etc.).
 * The class is *framework‑agnostic* – it contains no Express‑specific code so
 * that it can be reused in CLI tools or unit tests without modification.
 */

import PollsMemoryManagement from '../repositories/PollsMemoryManagement.js';
import Poll from '../models/Poll.js';

/**
 * High‑level service responsible for orchestrating poll operations.
 *
 * @example
 * ```js
 * import PollsManager from './services/PollsManager.js';
 *
 * const service = new PollsManager();
 * const poll = await service.createPoll('Favourite colour?', ['Red', 'Blue'], 'alice');
 * await service.vote(poll.uuid, 1, 'bob');      // Bob votes for "Blue"
 * const summary = await service.getResults(poll.uuid);
 * console.log(summary.totalVotes);              // => 1
 * ```
 */
export default class PollsManager {
  /**
   * Underlying data‑access layer.
   * @type {PollsMemoryManagement}
   * @private
   */
  pollsMemoryManagement;

  /* ------------------------------------------------------------------ *
   * Construction                                                       *
   * ------------------------------------------------------------------ */

  /**
   * Create a new {@link PollsManager} instance.
   *
   * @param {PollsMemoryManagement} [pollsMemoryManagement] Optional custom
   *        repository implementation. If omitted, a new in‑memory repository
   *        is created automatically.
   */
  constructor(pollsMemoryManagement) {
    this.pollsMemoryManagement = pollsMemoryManagement || new PollsMemoryManagement();
  }

  /* ------------------------------------------------------------------ *
   * Query helpers                                                      *
   * ------------------------------------------------------------------ */

  /**
   * Fetch **all** polls currently stored by the repository.
   *
   * @returns {Promise<Poll[]>} Promise that resolves with an array of polls.
   */
  async getPolls() {
    return this.pollsMemoryManagement.getAllPolls();
  }

  /**
   * Retrieve a single poll by its UUID.
   *
   * @param {string} pollId The UUID of the poll to fetch.
   * @returns {Promise<Poll|null>} The poll or `null` if it does not exist.
   */
  async getPoll(pollId) {
    return this.pollsMemoryManagement.getPoll(pollId);
  }

  /* ------------------------------------------------------------------ *
   * Mutations                                                          *
   * ------------------------------------------------------------------ */

  /**
   * Create and persist a new poll.
   *
   * @param {string}   question  Non‑empty question text.
   * @param {string[]} options   Array of **at least two** non‑empty option strings.
   * @param {string}   creator   Username of the poll creator.
   *
   * @throws {Error} If validation fails.
   *
   * @returns {Promise<Poll>} The created {@link Poll} instance.
   */
  async createPoll(question, options, creator) {
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw new Error('Poll question cannot be empty.');
    }
    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      !options.every(opt => typeof opt === 'string' && opt.trim())
    ) {
      throw new Error('Poll must have at least 2 options.');
    }

    const poll = new Poll(question, options, creator);
    await this.pollsMemoryManagement.addPoll(poll);
    return poll;
  }

  /**
   * List all polls created by a specific user.
   *
   * @param {string} username The creator's username.
   * @returns {Promise<Poll[]>} Array of polls created by `username`.
   */
  async listPollsByCreator(username) {
    const polls = await this.pollsMemoryManagement.getAllPolls();
    return polls.filter(p => p.creator === username);
  }

  /**
   * List all polls in which a user has cast a vote.
   *
   * @param {string} username The voter's username.
   * @returns {Promise<Poll[]>} Array of polls the user participated in.
   */
  async listPollsVotedByUser(username) {
    const polls = await this.pollsMemoryManagement.getAllPolls();
    return polls.filter(p => p.voters?.has(username));
  }

  /**
   * Register a vote for a given option in a poll.
   *
   * @param {string} pollId       UUID of the poll.
   * @param {number} optionIndex  Index of the option selected.
   * @param {string} username     Username of the voter.
   *
   * @throws {Error|RangeError} Propagates errors from {@link Poll#vote} or
   *         throws if the poll does not exist.
   *
   * @returns {Promise<void>}
   */
  async vote(pollId, optionIndex, username) {
    const poll = await this.pollsMemoryManagement.getPoll(pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }
    poll.vote(optionIndex, username);
  }

  /* ------------------------------------------------------------------ *
   * Results & deletion                                                 *
   * ------------------------------------------------------------------ */

  /**
   * Get an immutable snapshot of a poll's results.
   *
   * @param {string} pollId UUID of the poll.
   *
   * @returns {Promise<{question:string,totalVotes:number,results:Object.<string,number>}>}
   *          Object with summary data.
   *
   * @throws {Error} If the poll does not exist.
   */
  async getResults(pollId) {
    const poll = await this.pollsMemoryManagement.getPoll(pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }
    return {
      question: poll.question,
      totalVotes: poll.totalVotes,
      results: poll.results
    };
  }

  /**
   * Delete a poll – only the **creator** is authorised to do so.
   *
   * @param {string} pollId   UUID of the poll.
   * @param {string} username Username of the requester.
   *
   * @throws {Error} If poll does not exist or requester is not the creator.
   *
   * @returns {Promise<void>}
   */
  async deletePoll(pollId, username) {
    const poll = await this.pollsMemoryManagement.getPoll(pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }
    if (poll.creator !== username) {
      throw new Error('Only the creator can delete this poll.');
    }
    await this.pollsMemoryManagement.deletePoll(pollId);
  }
}
