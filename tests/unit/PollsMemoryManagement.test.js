// tests/unit/PollsMemoryManagement.test.js
import PollsMemoryManagement from '../../src/repositories/PollsMemoryManagement.js';
import Poll from '../../src/models/Poll.js';


describe('PollsMemoryManagement – unit tests', () => {
  let repo;

  beforeEach(() => {
    repo = new PollsMemoryManagement();   // fresh repo for every test
  });


  describe('Basic Functionality Tests', () => {
    test('adds and retrieves a poll', async () => {
      // Arrange
      const poll = new Poll('Tea or Coffee?', ['Tea', 'Coffee'], 'alice');

      // Act
      await repo.addPoll(poll);
      const result = await repo.getPoll(poll.uuid);

      // Assert
      expect(result).toBe(poll);
    });

    test('getPoll returns null for unknown id', async () => {
      // Act
      const result = await repo.getPoll('missing');

      // Assert
      expect(result).toBeNull();
    });
  });

 
  describe('Individual Requirement Tests', () => {
    test('votePoll registers a valid vote', async () => {
      // Arrange
      const poll = new Poll('Best JS runtime?', ['Node', 'Deno'], 'alice');
      await repo.addPoll(poll);

      // Act
      await repo.votePoll(poll.uuid, 1, 'bob');   // vote for 'Deno'

      // Assert
      expect(poll.results).toEqual({ Node: 0, Deno: 1 });
      expect(poll.totalVotes).toBe(1);
    });

    test('getAllPolls returns every stored poll', async () => {
      // Arrange
      const p1 = new Poll('Q1?', ['A', 'B'], 'u1');
      const p2 = new Poll('Q2?', ['C', 'D'], 'u2');
      await repo.addPoll(p1);
      await repo.addPoll(p2);

      // Act
      const all = await repo.getAllPolls();

      // Assert
      expect(all).toHaveLength(2);
      expect(all).toEqual(expect.arrayContaining([p1, p2]));
    });
  });

  
  describe('Edge Case Tests', () => {
    test('re-adding an existing poll id silently overwrites', async () => {
      // Arrange
      const poll = new Poll('Q?', ['X'], 'u');
      await repo.addPoll(poll);

      const clone = poll;          // same instance, same UUID
      clone.vote(0, 'voter1');     // mutate before re-add

      // Act
      await repo.addPoll(clone);   // Map#set overwrites

      // Assert
      const stored = await repo.getPoll(poll.uuid);
      expect(stored.totalVotes).toBe(1);  // overwrite succeeded
    });

    test('deletePoll on non-existent id resolves without throwing', async () => {
      // Act & Assert
      await expect(repo.deletePoll('ghost')).resolves.not.toThrow();
    });
  });


  describe('Negative (Exception) Tests', () => {
    test('addPoll throws if argument is not Poll', async () => {
      // Arrange
      const notAPoll = { uuid: '123' };

      // Act & Assert
      await expect(repo.addPoll(notAPoll))
        .rejects.toThrow('The provided object is not an instance of Poll.');
    });

    test('votePoll throws for missing poll', async () => {
      await expect(repo.votePoll('no-id', 0, 'user'))
        .rejects.toThrow('Poll with ID no-id not found.');
    });

    test('votePoll propagates duplicate-voter error', async () => {
      // Arrange
      const poll = new Poll('Pick one', ['X', 'Y'], 'creator');
      await repo.addPoll(poll);
      await repo.votePoll(poll.uuid, 0, 'sam');

      // Act & Assert
      await expect(repo.votePoll(poll.uuid, 1, 'sam'))
        .rejects.toThrow('User "sam" has already voted in this poll.');
    });
  });


  describe('Combination Tests (entire flows)', () => {
    test('full flow: add → vote → delete → verify removal', async () => {
      // Arrange
      const poll = new Poll('Keep or Delete?', ['Keep', 'Delete'], 'owner');

      // Act
      await repo.addPoll(poll);
      await repo.votePoll(poll.uuid, 0, 'v');   // one vote
      await repo.deletePoll(poll.uuid);
      const afterDelete = await repo.getPoll(poll.uuid);

      // Assert
      expect(afterDelete).toBeNull();
    });

    test('multiple polls maintain independent state', async () => {
      // Arrange
      const p1 = new Poll('Q1', ['A', 'B'], 'x');
      const p2 = new Poll('Q2', ['C', 'D'], 'y');
      await repo.addPoll(p1);
      await repo.addPoll(p2);

      // Act
      await repo.votePoll(p1.uuid, 1, 'user1'); // B
      await repo.votePoll(p2.uuid, 0, 'user2'); // C

      // Assert
      expect(p1.results).toEqual({ A: 0, B: 1 });
      expect(p2.results).toEqual({ C: 1, D: 0 });
    });
  });
});
