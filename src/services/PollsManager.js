import PollsMemoryManagement from '../repositories/PollsMemoryManagement.js';
import Poll from '../models/Poll.js';

/**
 * Service layer for handling poll business logic.
 * Provides methods to create polls, register votes, and retrieve poll results.
 *
 * @example
 * const pollService = new PollService();
 * const poll = pollService.createPoll('What is your favorite color?', ['Red', 'Green', 'Blue']);
 * pollService.vote(poll.id, 'Red');
 * const results = pollService.getResults(poll.id);
 */
export default class PollsManager {
  /**
   * Creates an instance of PollService.
   *
   * @param {PollsMemoryManagement} [pollsMemoryManagement=new PollsMemoryManagement()] - An instance of PollsMemoryManagement used for data storage.
   */
  constructor(pollsMemoryManagement) {
    this.pollsMemoryManagement = pollsMemoryManagement || new PollsMemoryManagement();
  }


  /**
   * Retrieves all polls from the memory management system.
   *
   * @returns {Array} An array of all polls.
   */
  getPolls() {
    return this.pollsMemoryManagement.getAllPolls();
  }


  /**
   * Retrieves a poll by its ID.  
   * 
   * @param {string} pollId - The unique identifier of the poll.
   * @returns {Poll|null} The Poll instance if found; otherwise, null.
   */
  getPoll(pollId) {
    return this.pollsMemoryManagement.getPoll(pollId);
  } 

  /**
   * Creates a new poll with the provided question and options.
   *
   * @param {string} question - A non-empty string representing the poll question.
   * @param {string[]} options - An array of non-empty strings representing poll options (minimum 2 options).
   * @returns {Poll} The newly created Poll instance.
   * @throws {Error} Throws an error if the question is empty or not a valid string.
   * @throws {Error} Throws an error if options is not an array of at least 2 non-empty strings.
   *
   * @example
   * const poll = pollService.createPoll("Favorite programming language?", ["JavaScript", "Python"]);
   */
  createPoll(question, options, creator) {
    // Validate question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw new Error('Poll question cannot be empty.');
    }

    // Validate options
    if (
      !Array.isArray(options) ||
      !options.every(opt => typeof opt === 'string' && opt.trim().length > 0) ||
      options.length < 2
    ) {
      throw new Error('Poll must have at least 2 options.');
    }
    const poll = new Poll(question, options, creator);
    this.pollsMemoryManagement.addPoll(poll);
  
    return poll;
    
  }

  /**
   * Lists all polls created by a specific user.
   * @param {string} username - The username of the creator.
   * @returns {Poll[]} An array of polls created by the user.
   */
  listPollsByCreator(username) {
    return this.pollsMemoryManagement.getAllPolls().filter(poll => poll.creator === username);
  }

  /**
   * Lists all polls a user has voted in.
   * @param {string} username - The username of the voter.
   * @returns {Poll[]} An array of polls the user has voted in.
   */
  listPollsVotedByUser(username) {
    //return this.pollsMemoryManagement.listPollsVotedByUser(username);
    return this.pollsMemoryManagement.getAllPolls().filter(poll => poll.voters?.has(username));
  }

  /**
   * Registers a vote for a specified option in a poll.
   * @param {string} pollId - The unique identifier of the poll.
   * @param {number} optionIndex - The text of the option to vote for.
   * @param {string} username - The username of the voter.
   */
  vote(pollId, optionIndex, username) {
    const poll = this.pollsMemoryManagement.getPoll(pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }

    if (
      typeof optionIndex !== 'number' ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      throw new Error(`Invalid option index: ${optionIndex}`);
    }
    poll.vote(optionIndex, username);
  }

  /**
   * Retrieves the results of a specified poll.
   *
   * @param {string} pollId - The unique identifier of the poll.
   * @returns {Object} An object containing the poll's question, total vote count, and the vote counts for each option.
   * @throws {TypeError} Throws if pollId is not a number.
   * @throws {Error} Throws if the poll with the given ID is not found.
   *
   * @example
   * const results = pollService.getResults(1);
   * // results: { question: "Favorite programming language?", totalVotes: 5, results: { "JavaScript": 3, "Python": 2 } }
   */
  getResults(pollId) {
    // Validate pollId
    if (typeof pollId !== 'number') {
      throw new TypeError(`Poll ID must be a number.`);
    }
    const poll = this.pollsMemoryManagement.getPoll(pollId);
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
   * Deletes a poll with the specified ID and username.
   *
   * @param {string} pollId - The unique identifier of the poll.
   * @param {string} username - The username of the person requesting the deletion.
   */
  deletePoll(pollId, username) {
    const poll = this.pollsMemoryManagement.getPoll(pollId);

    if (!poll) {
        throw new Error(`Poll with ID ${pollId} not found.`);
    }

    if (poll.creator !== username) {
        throw new Error('Only the creator can delete this poll.');
    }

    this.pollsMemoryManagement.deletePoll(pollId, username);
}
}
