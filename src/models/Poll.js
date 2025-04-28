import { v4 as uuidv4 } from 'uuid';

/**
 * @module Poll
 * @description
 * Provides the {@link Poll} class for creating and managing simple multiple‑choice polls.
 * Each poll tracks its own unique identifier, question, options, vote counts, and the
 * set of users that have already voted.
 */

/**
 * Class representing a multiple‑choice poll.
 *
 * @example
 * ```js
 * import Poll from './Poll.js';
 *
 * const poll = new Poll('What is your favorite color?', ['Red', 'Blue', 'Green'], 'alice');
 * poll.vote(1, 'bob');           // Bob votes for "Blue" (index 1)
 * console.log(poll.results);     // => { Red: 0, Blue: 1, Green: 0 }
 * console.log(poll.totalVotes);  // => 1
 * ```
 */
export default class Poll {
  /* ------------------------------------------------------------------ *
   * Private state                                                      *
   * ------------------------------------------------------------------ */

  /** @type {Object.<string, number>} */
  #results;
  /** @type {string} */
  #uuid;
  /** @type {string} */
  #question;
  /** @type {string[]} */
  #options;
  /** @type {number} */
  #totalVotes;
  /** @type {string} */
  #creator;
  /** @type {Set<string>} */
  #voters;

  /* ------------------------------------------------------------------ *
   * Life‑cycle                                                         *
   * ------------------------------------------------------------------ */

  /**
   * Create a new {@link Poll} instance.
   *
   * @param {string} question               The question posed by the poll.
   * @param {string[]} options              An array of **distinct** answer option strings.  
   *                                        Order is preserved and referenced by index.
   * @param {string} creator                The username of the poll creator.
   *
   * @throws {TypeError} If **question** is not a string.
   * @throws {TypeError} If **options** is not an array of strings.
   */
  constructor(question, options, creator) {
    if (typeof question !== 'string') {
      throw new TypeError('question must be a string');
    }
    if (!Array.isArray(options) || !options.every(opt => typeof opt === 'string')) {
      throw new TypeError('options must be an array of strings');
    }
    if (typeof creator !== 'string' || creator.trim().length === 0) {
      throw new TypeError('creator must be a non-empty string');
    }

    this.#uuid = uuidv4();            // Generate a unique identifier for the poll
    this.#question = question.trim(); // Normalise question text
    this.#options = [...options];     // Shallow copy to prevent external mutation
    this.#totalVotes = 0;
    this.#results = {};
    this.#creator = creator;
    this.#voters = new Set();

    for (const option of this.#options) {
      this.#results[option] = 0;
    }
  }

  /* ------------------------------------------------------------------ *
   * Serialisation                                                      *
   * ------------------------------------------------------------------ */

  /**
   * Serialise the poll into a plain JSON‑serialisable object.
   *
   * @returns {PollJSON} A shallow representation of the poll suitable for `JSON.stringify`.
   *
   * @typedef {Object} PollJSON
   * @property {string} uuid                         The poll's unique identifier.
   * @property {string} question                     The poll's question text.
   * @property {string[]} options                    The list of available answer options.
   * @property {string} creator                      Username of the poll creator.
   * @property {number} totalVotes                   Total number of votes cast.
   * @property {Object.<string, number>} results     Mapping of option text to vote count.
   */
  toJSON() {
    return {
      uuid: this.uuid,
      question: this.question,
      options: this.options,
      creator: this.creator,
      totalVotes: this.totalVotes,
      results: this.results
    };
  }

  /* ------------------------------------------------------------------ *
   * Accessors (read‑only)                                              *
   * ------------------------------------------------------------------ */

  /**
   * The poll's unique identifier.
   * @readonly
   * @returns {string}
   */
  get uuid() {
    return this.#uuid;
  }

  /**
   * The poll's question text.
   * @readonly
   * @returns {string}
   */
  get question() {
    return this.#question;
  }

  /**
   * The list of answer options.
   * @readonly
   * @returns {string[]}
   */
  get options() {
    return this.#options;
  }

  /**
   * The total number of votes that have been cast.
   * @readonly
   * @returns {number}
   */
  get totalVotes() {
    return this.#totalVotes;
  }

  /**
   * An object mapping each option to its current vote count.
   * @readonly
   * @returns {Object.<string, number>}
   */
  get results() {
    return this.#results;
  }

  /**
   * Username of the poll creator.
   * @readonly
   * @returns {string}
   */
  get creator() {
    return this.#creator;
  }

  /**
   * A **copy** of the set of usernames that have already voted.  
   * The internal `Set` is cloned to preserve encapsulation.
   *
   * @readonly
   * @returns {Set<string>}
   */
  get voters() {
    return new Set(this.#voters);
  }

  /* ------------------------------------------------------------------ *
   * Behaviour                                                          *
   * ------------------------------------------------------------------ */

  /**
   * Cast a vote on the poll.
   *
   * @param {number} optionIndex  Zero‑based index of the option selected by the user.
   * @param {string} username     Username of the voter.
   *
   * @throws {RangeError} If **optionIndex** is out of range.
   * @throws {Error}      If **username** has already voted in this poll.
   *
   * @returns {void}
   */
  vote(optionIndex, username) {
    if (
      typeof optionIndex !== 'number' ||
      !Number.isInteger(optionIndex) ||
      optionIndex < 0 ||
      optionIndex >= this.#options.length
    ) {
      throw new RangeError(`Invalid option index: ${optionIndex}`);
    }

    if (this.#voters.has(username)) {
      throw new Error(`User \"${username}\" has already voted in this poll.`);
    }

    const option = this.#options[optionIndex];
    this.#results[option] += 1;
    this.#totalVotes += 1;
    this.#voters.add(username);
  }
}
