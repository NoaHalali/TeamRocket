import PollsManager from '../../src/services/PollsManager.js';
import PollsMemoryManagement from '../../src/repositories/PollsMemoryManagement.js';

describe('PollsManager – service-layer unit tests', () => {
  let manager;

  // New clean manager (and in-memory repo) for every test
  beforeEach(() => {
    manager = new PollsManager();
  });


  describe('Basic Functionality Tests', () => {
    test('creates a poll with valid input', async () => {
      // Arrange
      const q   = 'Favourite pet?';
      const opt = ['Cat', 'Dog'];

      // Act
      const poll = await manager.createPoll(q, opt, 'alice');

      // Assert
      expect(poll.question).toBe(q);
      expect(poll.options).toEqual(opt);
      expect(poll.totalVotes).toBe(0);
    });

    test('getPolls returns every stored poll', async () => {
      // Arrange
      await manager.createPoll('Q1', ['A', 'B'], 'u1');
      await manager.createPoll('Q2', ['C', 'D'], 'u2');

      // Act
      const all = await manager.getPolls();

      // Assert
      expect(all).toHaveLength(2);
      expect(all.map(p => p.question)).toEqual(expect.arrayContaining(['Q1', 'Q2']));
    });
  });

  
  describe('Individual Requirement Tests', () => {
    test('listPollsByCreator returns only that user’s polls', async () => {
      // Arrange
      const p1 = await manager.createPoll('U1-Poll', ['Y', 'N'], 'u1');
      await manager.createPoll('U2-Poll', ['Y', 'N'], 'u2');

      // Act
      const list = await manager.listPollsByCreator('u1');

      // Assert
      expect(list).toEqual([p1]);
    });

    test('listPollsVotedByUser returns polls the user voted in', async () => {
      // Arrange
      const p1 = await manager.createPoll('Vote?', ['Yes', 'No'], 'x');
      const p2 = await manager.createPoll('Another?', ['One', 'Two'], 'y');

      await manager.vote(p1.uuid, 0, 'voter'); // voter only votes in p1

      // Act
      const voted = await manager.listPollsVotedByUser('voter');

      // Assert
      expect(voted).toEqual([p1]);
    });
  });

  describe('Edge Case Tests', () => {
    test('listPollsByCreator for user with no polls returns empty array', async () => {
      const list = await manager.listPollsByCreator('ghost');
      expect(list).toEqual([]);
    });

    test('listPollsVotedByUser for user who never voted returns empty array', async () => {
      await manager.createPoll('Any?', ['1', '2'], 'someone');
      const list = await manager.listPollsVotedByUser('nonVoter');
      expect(list).toEqual([]);
    });
  });


  describe(' Negative (Exception) Tests', () => {
    test('createPoll throws if question empty', async () => {
      await expect(manager.createPoll('', ['A', 'B'], 'u'))
        .rejects.toThrow('Poll question cannot be empty.');
    });

    test('createPoll throws if fewer than 2 options', async () => {
      await expect(manager.createPoll('Bad poll', ['Only one'], 'u'))
        .rejects.toThrow('Poll must have at least 2 options.');
    });

    test('vote throws for non-existent poll', async () => {
      await expect(manager.vote('missing', 0, 'user'))
        .rejects.toThrow('Poll with ID missing not found.');
    });

    test('deletePoll throws when requester is not creator', async () => {
      // Arrange
      const poll = await manager.createPoll('Delete?', ['X', 'Y'], 'owner');

      // Act & Assert
      await expect(manager.deletePoll(poll.uuid, 'stranger'))
        .rejects.toThrow('Only the creator can delete this poll.');
    });
  });


  describe('Combination Tests (entire flows)', () => {
    test('full flow: create → vote → results → delete', async () => {
      // Arrange
      const poll = await manager.createPoll('Keep?', ['Yes', 'No'], 'creator');

      // Act
      await manager.vote(poll.uuid, 0, 'v1');
      const summary = await manager.getResults(poll.uuid);
      await manager.deletePoll(poll.uuid, 'creator');
      const afterDeletion = await manager.getPoll(poll.uuid);

      // Assert
      expect(summary.totalVotes).toBe(1);
      expect(summary.results).toEqual({ Yes: 1, No: 0 });
      expect(afterDeletion).toBeNull();
    });

    test('multiple polls maintain independent state across operations', async () => {
      // Arrange
      const p1 = await manager.createPoll('Q1', ['A', 'B'], 'u1');
      const p2 = await manager.createPoll('Q2', ['C', 'D'], 'u2');

      // Act
      await manager.vote(p1.uuid, 1, 'v'); // B
      await manager.vote(p2.uuid, 0, 'v'); // C

      // Assert
      const res1 = await manager.getResults(p1.uuid);
      const res2 = await manager.getResults(p2.uuid);

      expect(res1.results).toEqual({ A: 0, B: 1 });
      expect(res2.results).toEqual({ C: 1, D: 0 });
    });
  });
});