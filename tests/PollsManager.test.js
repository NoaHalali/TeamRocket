import PollsManager from '../src/services/PollsManager.js';
import { jest } from '@jest/globals';


describe('PollsManager', () => {
  let pollsMemoryManagement;
  let pollsManager;

  beforeEach(() => {
    // Arrange: create a fakePollsMemoryManagement with jest mock functions.
   pollsMemoryManagement = {
      createPoll: jest.fn(),
      getPoll: jest.fn(),
      votePoll: jest.fn()
    };
  pollsManager = new PollsManager(pollsMemoryManagement);
  });

  // Basic Functionality Tests

  // test('createPoll should call repository.createPoll with valid question and options', () => {
  //   // Arrange
  //   const question = 'What is your favorite color?';
  //   const options = ['Red', 'Blue'];
  //   const createdPoll = { question, options };
  //  pollsMemoryManagement.createPoll.mockReturnValue(createdPoll);
    
  //   // Act
  //   const result = pollsManager.createPoll(question, options, 'creator');
    
  //   // Assert
  //   expect(pollsMemoryManagement.createPoll).toHaveBeenCalledWith(question, options);
  //   expect(result).toEqual(createdPoll);
  // });

  // Individual Requirement & Edge Case Tests

  test('createPoll should throw error when question is empty', () => {
    // Arrange
    const question = '';
    const options = ['Option1', 'Option2'];
    // Act & Assert
    expect(() => pollsManager.createPoll(question, options, 'creator'))
      .toThrow('Poll question cannot be empty.');
  });

  test('createPoll should throw error when question is only whitespace', () => {
    // Arrange
    const question = '   ';
    const options = ['Option1', 'Option2'];
    // Act & Assert
    expect(() => pollsManager.createPoll(question, options, 'creator'))
      .toThrow('Poll question cannot be empty.');
  });

  test('createPoll should throw error when options is not an array', () => {
    // Arrange
    const question = 'Valid Question?';
    const options = 'Not an array';
    // Act & Assert
    expect(() => pollsManager.createPoll(question, options, 'creator'))
      .toThrow('Poll must have at least 2 options.');
  });

  test('createPoll should throw error when options array has less than 2 items', () => {
    // Arrange
    const question = 'Valid Question?';
    const options = ['Only one option'];
    // Act & Assert
    expect(() => pollsManager.createPoll(question, options, 'creator'))
      .toThrow('Poll must have at least 2 options.');
  });

  test('createPoll should throw error when one of the options is an empty string', () => {
    // Arrange
    const question = 'Valid Question?';
    const options = ['Option1', ''];
    // Act & Assert
    expect(() => pollsManager.createPoll(question, options, 'creator'))
      .toThrow('Poll must have at least 2 options.');
  });

  // Vote Method Tests

  test('vote should not throw error for a valid vote', () => {
    // Arrange
    const pollId = 1;
    const poll = {
      id: pollId,
      options: ['Option1', 'Option2'],
      vote: jest.fn()
    };
    pollsMemoryManagement.getPoll = jest.fn().mockReturnValue(poll);

    // Act & Assert
    expect(() => pollsManager.vote(pollId, 0, 'user123')).not.toThrow();
    expect(poll.vote).toHaveBeenCalledWith(0, 'user123');
  });

  test('vote should throw error when poll is not found', () => {
    // Arrange
    const pollId = 1;
    const optionText = 'Option1';
    pollsMemoryManagement.getPoll.mockReturnValue(undefined);

    // Act & Assert
    expect(() => pollsManager.vote(pollId, optionText))
      .toThrow(`Poll with ID ${pollId} not found.`);
  });

  test('vote should throw error when option index is invalid (out of range)', () => {
    // Arrange
    const pollId = 1;
    const poll = {
      id: pollId,
      options: ['Option1', 'Option2'],
      vote: jest.fn()
    };
    pollsMemoryManagement.getPoll = jest.fn().mockReturnValue(poll);

    // Act & Assert
    expect(() => pollsManager.vote(pollId, 5, 'user123'))
      .toThrow('Invalid option index: 5');
  });


  // getResults Method Tests

  test('getResults should return correct poll results for a valid poll', () => {
    // Arrange
    const pollId = 1;
    const poll = {
      id: pollId,
      question: 'Valid Question?',
      totalVotes: 10,
      results: [
        { option: 'Option1', votes: 6 },
        { option: 'Option2', votes: 4 }
      ]
    };
    pollsMemoryManagement.getPoll.mockReturnValue(poll);

    // Act
    const results = pollsManager.getResults(pollId);

    // Assert
    expect(results).toEqual({
      question: poll.question,
      totalVotes: poll.totalVotes,
      results: poll.results
    });
  });

  test('getResults should throw error when poll is not found', () => {
    // Arrange
    const pollId = 1;
    pollsMemoryManagement.getPoll.mockReturnValue(undefined);

    // Act & Assert
    expect(() => pollsManager.getResults(pollId))
      .toThrow(`Poll with ID ${pollId} not found.`);
  });

  test('getResults should throw TypeError when pollId is not a number', () => {
    // Arrange
    const pollId = '1'; // pollId as string instead of number

    // Act & Assert
    expect(() => pollsManager.getResults(pollId))
      .toThrow(`Poll ID must be a number.`);
  });
});

// const PollsManager = require('../src/services/PollsManager');

// describe('PollsManager', () => {
//     let pollsManager;

//     beforeEach(() => {
//         pollsManager = new PollsManager();
//     });

//     test('createPoll should create a poll with valid question and options', () => {
//         const question = 'What is your favorite programming language?';
//         const options = ['JavaScript', 'Python', 'Ruby'];
//         const creator = 'creator';

//         const poll = pollsManager.createPoll(question, options, creator);

//         expect(poll).toBeDefined();
//         expect(poll.question).toBe(question);
//         expect(poll.options.length).toBe(3);
//         expect(poll.creator).toBe(creator);
//     });

//     test('createPoll should throw an error for invalid data', () => {
//         expect(() => pollsManager.createPoll('', ['Option1'], 'creator')).toThrow('Invalid poll data');
//         expect(() => pollsManager.createPoll('Question', [], 'creator')).toThrow('Invalid poll data');
//     });

//     test('getPoll should return the correct poll', () => {
//         const question = 'What is your favorite programming language?';
//         const options = ['JavaScript', 'Python', 'Ruby'];
//         const creator = 'creator';

//         const poll = pollsManager.createPoll(question, options, creator);
//         const retrievedPoll = pollsManager.getPoll(poll.uuid);

//         expect(retrievedPoll).toEqual(poll);
//     });

//     test('vote should correctly update the vote count for an option', () => {
//         const question = 'What is your favorite programming language?';
//         const options = ['JavaScript', 'Python', 'Ruby'];
//         const creator = 'creator';

//         const poll = pollsManager.createPoll(question, options, creator);
//         pollsManager.vote(poll.uuid, 'JavaScript');

//         const updatedPoll = pollsManager.getPoll(poll.uuid);
//         const votedOption = updatedPoll.options.find(opt => opt.text === 'JavaScript');

//         expect(votedOption.votes).toBe(1);
//     });

//     test('vote should throw an error for invalid poll ID or option', () => {
//         const question = 'What is your favorite programming language?';
//         const options = ['JavaScript', 'Python', 'Ruby'];
//         const creator = 'creator';

//         const poll = pollsManager.createPoll(question, options, creator);

//         expect(() => pollsManager.vote('invalid-id', 'JavaScript')).toThrow('Poll not found');
//         expect(() => pollsManager.vote(poll.uuid, 'InvalidOption')).toThrow('Invalid option');
//     });
// });