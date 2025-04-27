import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a poll with a question, multiple options, and vote tracking.
 *
 * @example
 * const poll = new Poll(1, 'What is your favorite color?', ['Red', 'Blue', 'Green']);
 * poll.vote('Blue');
 * console.log(poll.results); // { Red: 0, Blue: 1, Green: 0 }
 */
export default class Poll {
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
    /**
     * 
     * @type {Object.<string, number>}
     */
    #results;
  
    /**
     * @type {string}
     */
    #uuid;
  
    /**
     * @type {string}
     */
    #question;
  
    /**
     * @type {string[]}
     */
    #options;
  
    /**
     * @type {number}
     */
    #totalVotes;

    #creator; // The creator of the poll (user ID or username)
    #voters; // A set to track users who have voted
  
    /**
     * Creates an instance of Poll.
     *
     * @param {string} question - The question posed by the poll.
     * @param {string[]} options - An array of strings representing the poll options.
     * @throws {TypeError} Throws if the id is not a string or number, if question is not a string,
     *                     or if options is not an array of strings.
     */
    constructor(question, options, creator) {

      if (typeof question !== 'string') {
        throw new TypeError('question must be a string');
      }
      if (!Array.isArray(options) || !options.every(opt => typeof opt === 'string')) {
        throw new TypeError('options must be an array of string');
      }
  
      this.#uuid = uuidv4(); // Generate a unique identifier for the poll
      this.#question = question;
      this.#options = options;
      this.#totalVotes = 0;
      this.#results = {};
      this.#creator = creator; // The creator of the poll (user ID or username)

      for (const option of options) {
        this.#results[option] = 0;
      }
    }
  
    /**
     * Gets the poll's unique identifier.
     *
     * @return {string} The id of the poll.
     */
    get uuid() {
      return this.#uuid;
    }
  
    /**
     * Gets the poll's question.
     *
     * @return {string} The question of the poll.
     */
    get question() {
      return this.#question;
    }
  
    /**
     * Gets the list of poll options.
     *
     * @return {string[]} An array containing the poll options.
     */
    get options() {
      return this.#options;
    }
  
    /**
     * Gets the total number of votes cast in the poll.
     *
     * @return {number} The total votes.
     */
    get totalVotes() {
      return this.#totalVotes;
    }
  
    /**
     * Gets the current vote results.
     *
     * @return {Object.<string, number>} An object where keys are options and values are vote counts.
     */
    get results() {
      return this.#results;
    }

    get creator() {
      return this.#creator;
    }

    get voters() {
      return this.#voters;
    }
  
    /**
     * Records a vote for a specified option.
     *
     * @param {number} optionIndex - The option to vote for.
     * @param {string} username - The username of the voter.
     * @throws {Error} Throws an error if the specified option is not valid or if the user has already voted.
     */
    vote(optionIndex, username) {

      if (
        typeof optionIndex !== 'number' ||
        optionIndex < 0 ||
        optionIndex >= this.#options.length
      ) {
        throw new Error(`Invalid option index: ${optionIndex}`);
      }

      if (!this.#voters) {
        this.#voters = new Set(); // Track users who voted
      }
      if (this.#voters.has(username)) {
        throw new Error(`User "${username}" has already voted in this poll.`);
      }

      const option = this.#options[optionIndex];
      this.#results[option] += 1;
      this.#totalVotes += 1;
      this.#voters.add(username);
    }
  }
