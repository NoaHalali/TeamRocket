/**
 * @module User
 * @description
 * Provides the {@link User} class, a lightweight value‑object that represents an
 * application user by username.  
 * The class is intentionally minimal – additional user‑related state (e.g.
 * authentication tokens, profile metadata) should be managed by higher‑level
 * services.
 */

/**
 * Class representing a single user identified solely by a **username**.
 *
 * @example
 * ```js
 * import User from './User.js';
 *
 * const alice = new User('alice');
 * console.log(alice.getUserName()); // => 'alice'
 * ```
 */
export default class User {
    /* ------------------------------------------------------------------ *
     * Private state                                                      *
     * ------------------------------------------------------------------ */
  
    /** @type {string} */
    #userName;
  
    /* ------------------------------------------------------------------ *
     * Life‑cycle                                                         *
     * ------------------------------------------------------------------ */
  
    /**
     * Create a new {@link User} instance.
     *
     * @param {string} userName  The unique username that identifies the user.
     *
     * @throws {TypeError} If **userName** is not a non‑empty string.
     */
    constructor(userName) {
      if (typeof userName !== 'string' || userName.trim() === '') {
        throw new TypeError('userName must be a non‑empty string');
      }
      /** @private */
      this.#userName = userName.trim();
    }
  
    /* ------------------------------------------------------------------ *
     * Accessors                                                          *
     * ------------------------------------------------------------------ */
  
    /**
     * Get the user's username.
     *
     * @returns {string} The username associated with this {@link User}.
     */
    getUserName() {
      return this.#userName;
    }
  }
  