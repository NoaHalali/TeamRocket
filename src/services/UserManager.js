// @ts-nocheck
/**
 * @module UserManager
 * @description
 * Simple in‑memory registry that tracks application usernames and enforces
 * global uniqueness. All API methods are asynchronous so that callers remain
 * agnostic to whether the underlying store is memory, database, or remote
 * service.
 */

/**
 * Service for creating and querying **users** identified by a unique username.
 *
 * @example
 * ```js
 * import UserManager from './services/UserManager.js';
 *
 * const users = new UserManager();
 * await users.createUser('alice');
 * console.log(await users.userExists('alice')); // => true
 * console.log(await users.getAllUsers());       // => ['alice']
 * ```
 */
export default class UserManager {
  /* ------------------------------------------------------------------ *
   * Private state                                                      *
   * ------------------------------------------------------------------ */

  /**
   * Internal set of usernames.
   * @type {Set<string>}
   * @private
   */
  #users;

  /* ------------------------------------------------------------------ *
   * Life‑cycle                                                         *
   * ------------------------------------------------------------------ */

  /**
   * Instantiate an empty user registry.
   */
  constructor() {
    /** @private */
    this.#users = new Set();
  }

  /* ------------------------------------------------------------------ *
   * Mutations                                                          *
   * ------------------------------------------------------------------ */

  /**
   * Register a new username.
   *
   * @param {string} username  The desired username. Must be non‑empty and unique.
   *
   * @throws {Error} If **username** is not a non‑empty string.
   * @throws {Error} If **username** already exists.
   *
   * @returns {Promise<void>} Resolves once the user is stored.
   */
  async createUser(username) {
    if (typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('Username must be a non-empty string.');
    }
    if (this.#users.has(username)) {
      throw new Error(`Username "${username}" already exists.`);
    }
    this.#users.add(username);
  }

  /* ------------------------------------------------------------------ *
   * Queries                                                             *
   * ------------------------------------------------------------------ */

  /**
   * Check whether a username already exists.
   *
   * @param {string} username  Username to look up.
   * @returns {Promise<boolean>} `true` if the user exists, otherwise `false`.
   */
  async userExists(username) {
    return this.#users.has(username);
  }

  /**
   * Get an array of **all** registered usernames.
   *
   * @returns {Promise<string[]>} Alphabetical list of usernames.
   */
  async getAllUsers() {
    return Array.from(this.#users).sort();
  }
}
