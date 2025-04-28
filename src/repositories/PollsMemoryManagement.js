/**
 * @module PollsMemoryManagement
 * @description
 * An **in‑memory repository** that stores {@link Poll} instances using their UUID
 * as the key.  
 * All methods are asynchronous (`async`) so that the public API aligns with
 * potential future implementations (e.g. database, Redis) without changing
 * call‑sites.
 */

import Poll from '../models/Poll.js';

/**
 * Repository / service for managing multiple {@link Poll | Polls} in memory.
 *
 * @example
 * ```js
 * import Poll from './models/Poll.js';
 * import PollsMemoryManagement from './repositories/PollsMemoryManagement.js';
 *
 * const repo = new PollsMemoryManagement();
 * const poll = new Poll('Tea or Coffee?', ['Tea', 'Coffee'], 'alice');
 *
 * await repo.addPoll(poll);
 * await repo.votePoll(poll.uuid, 1, 'bob');
 *
 * console.log(await repo.getPoll(poll.uuid).results);
 * // => { Tea: 0, Coffee: 1 }
 * ```
 */
export default class PollsMemoryManagement {
  /* ------------------------------------------------------------------ *
   * Private state                                                      *
   * ------------------------------------------------------------------ */

  /** @type {Map<string, Poll>} */
  #polls;

  /* ------------------------------------------------------------------ *
   * Life‑cycle                                                         *
   * ------------------------------------------------------------------ */

  /**
   * Instantiate an empty in‑memory poll store.
   */
  constructor() {
    /** @private */
    this.#polls = new Map();
  }

  /* ------------------------------------------------------------------ *
   * CRUD operations                                                    *
   * ------------------------------------------------------------------ */

  /**
   * Add a new {@link Poll} to the repository.
   *
   * @param {Poll} poll  A valid {@link Poll} instance.
   *
   * @throws {Error} If **poll** is not an instance of {@link Poll}.
   *
   * @returns {Promise<void>} Resolves once the poll is stored.
   */
  async addPoll(poll) {
    if (!(poll instanceof Poll)) {
      throw new Error('The provided object is not an instance of Poll.');
    }
    this.#polls.set(poll.uuid, poll);
  }

  /**
   * Retrieve a poll by its UUID.
   *
   * @param {string} pollId  The UUID of the poll to retrieve.
   *
   * @returns {Promise<Poll|null>} The poll or `null` if not found.
   */
  async getPoll(pollId) {
    return this.#polls.get(pollId) || null;
  }

  /**
   * Cast a vote on an existing poll.
   *
   * @param {string}  pollId       UUID of the target poll.
   * @param {number}  optionIndex  Zero‑based index of the selected option.
   * @param {string}  username     Username of the voter.
   *
   * @throws {Error}  If the poll does not exist.
   * @throws {RangeError|Error} Propagates any validation errors thrown by {@link Poll#vote}.
   *
   * @returns {Promise<void>} Resolves after the vote is recorded.
   */
  async votePoll(pollId, optionIndex, username) {
    const poll = await this.getPoll(pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }
    poll.vote(optionIndex, username);
  }

  /**
   * Get **all** polls currently stored in memory.
   *
   * @returns {Promise<Poll[]>} An array of {@link Poll} instances.
   */
  async getAllPolls() {
    return Array.from(this.#polls.values());
  }

  /**
   * Permanently remove a poll from the repository.
   *
   * @param {string} pollId  UUID of the poll to delete.
   *
   * @returns {Promise<void>} Resolves when the poll has been deleted (noop if absent).
   */
  async deletePoll(pollId) {
    this.#polls.delete(pollId);
  }
}
