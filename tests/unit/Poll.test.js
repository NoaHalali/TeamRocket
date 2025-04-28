// @ts-nocheck
// tests/Poll.test.js
import Poll from '../../src/models/Poll.js';

describe('Poll Class', () => {
  // Basic Functionality & Individual Requirement Test
  test('should create a poll with valid id, question, options, and creator', () => {
    // Arrange
    const question = 'What is your favorite color?';
    const options = ['Red', 'Blue', 'Green'];
    const creator = 'testuser';
  
    // Act
    const poll = new Poll(question, options, creator);
  
    // Assert
    expect(poll.question).toBe(question);
    expect(poll.options).toEqual(options);
    expect(poll.totalVotes).toBe(0);
    expect(poll.results).toEqual({ Red: 0, Blue: 0, Green: 0 });
    expect(poll.creator).toBe(creator); 
  });
  

  // Negative Test: invalid question type
  test('should throw error if question is not a string', () => {
    // Arrange
    const question = 12345;
    const options = ['Option1'];

    // Act & Assert
    expect(() => new Poll(question, options, 'creator')).toThrow(TypeError);
    expect(() => new Poll(question, options, 'creator')).toThrow('question must be a string');
  });

  // Negative Test: options is not an array
  test('should throw error if options is not an array', () => {
    // Arrange
    const question = 'Test non-array options';
    const options = 'Not an array';

    // Act & Assert
    expect(() => new Poll(question, options,'creator')).toThrow(TypeError);
    expect(() => new Poll(question, options,'creator')).toThrow('options must be an array of string');
  });

  // Negative Test: options array contains non-string element
  test('should throw error if options array contains non-string element', () => {
    // Arrange
    const question = 'Test non-string options';
    const options = ['Valid', 123];

    // Act & Assert
    expect(() => new Poll(question, options, 'creator')).toThrow(TypeError);
    expect(() => new Poll(question, options, 'creator')).toThrow('options must be an array of string');
  });

  // Basic Functionality: Valid voting behavior
  test('should correctly record a vote for a valid option', () => {
    // Arrange
    const poll = new Poll('Vote test?', ['OptionA', 'OptionB'],'creator');
    
    // Act
    poll.vote(0, 'paz');

    // Assert
    expect(poll.results['OptionA']).toBe(1);
    expect(poll.totalVotes).toBe(1);
  });

  // Negative Test: Voting for an invalid option
  test('should throw error when voting for an invalid option', () => {
    // Arrange
    const poll = new Poll('Invalid vote test?', ['Yes', 'No'], 'creator');

    // Act & Assert
    expect(() => poll.vote(2, 'bob')).toThrow(Error);
    expect(() => poll.vote(2, 'bob')).toThrow('Invalid option index: 2');
  });


  test('should throw error if user tries to vote twice in the same poll', () => {
    // Arrange
    const poll = new Poll('Duplicate vote test?', ['Option1', 'Option2'], 'creator');
  
    // Act
    poll.vote(0, 'user123'); 
  
    // Assert
    expect(() => poll.vote(1, 'user123')).toThrow(Error);
    expect(() => poll.vote(1, 'user123')).toThrow('User "user123" has already voted in this poll.');
  
    // Verify that only the first vote was counted
    expect(poll.totalVotes).toBe(1);
    expect(poll.results).toEqual({
      Option1: 1,
      Option2: 0
    });
  });

  // Combination Test: Multiple votes across options
  test('should correctly accumulate multiple votes', () => {
    // Arrange
    const poll = new Poll('Multiple votes test?', ['A', 'B', 'C'], 'creator');

    // Act
    poll.vote(0, 'u1'); // A
    poll.vote(1, 'u2'); // B
    poll.vote(0, 'u3'); // A
    poll.vote(2, 'u4'); // C
    poll.vote(1, 'u5'); // B

    // Assert
    expect(poll.results).toEqual({ A: 2, B: 2, C: 1 });
    expect(poll.totalVotes).toBe(5);
  });


  // Edge Case: Poll with empty options array
  test('should create poll with empty options and throw error on vote attempt', () => {
    // Arrange
    const poll = new Poll('Empty options test?', [], 'creator');
    
    // Act & Assert
    expect(poll.options).toEqual([]);
    expect(poll.results).toEqual({});
    expect(() => poll.vote(1, 'bob')).toThrow(Error);
  });

  // Combination Test: Full flow (create poll, vote multiple times, and verify final state)
  test('should handle full poll flow correctly', () => {
    // Arrange
    const poll = new Poll('Full flow test?', ['Yes', 'No', 'Maybe'], 'creator');
    
    // Act
    poll.vote(0, 'a'); // Yes
    poll.vote(1, 'b'); // No
    poll.vote(0, 'c'); // Yes
    poll.vote(2, 'd'); // Maybe
    poll.vote(1, 'e'); // No
    poll.vote(0, 'f'); // Yes

    // Assert
    expect(poll.results).toEqual({
      Yes: 3,
      No: 2,
      Maybe: 1
    });
    expect(poll.totalVotes).toBe(6);
  });

  // Combination Test: Multiple poll instances maintain independent state
  test('should maintain independent state for multiple poll instances', () => {
    // Arrange
    const poll1 = new Poll('Poll 1?', ['Opt1', 'Opt2'], 'creator1');
    const poll2 = new Poll('Poll 2?', ['OptA', 'OptB'], 'creator2');

    // Act
    poll1.vote(0, 'user1');
    poll1.vote(1, 'user2');
    poll2.vote(0, 'user3');
    poll2.vote(0, 'user4');
    // Assert
    expect(poll1.results).toEqual({ Opt1: 1, Opt2: 1 });
    expect(poll1.totalVotes).toBe(2);
    expect(poll2.results).toEqual({ OptA: 2, OptB: 0 });
    expect(poll2.totalVotes).toBe(2);
  });
});
