// tests/unit/UserManager.test.js
import UserManager from '../../src/services/UserManager.js';

describe('UserManager – unit tests', () => {
  let manager;

  /* ------------------------------------------------------------------ */
  /*  Fresh instance per test                                           */
  /* ------------------------------------------------------------------ */
  beforeEach(() => {
    manager = new UserManager();
  });


  describe('Basic Functionality Tests', () => {
    test('creates a new user', async () => {
      // Arrange
      const username = 'alice';

      // Act
      await manager.createUser(username);
      const exists = await manager.userExists(username);

      // Assert
      expect(exists).toBe(true);
    });

    test('userExists returns false for unknown user', async () => {
      // Act
      const exists = await manager.userExists('ghost');

      // Assert
      expect(exists).toBe(false);
    });
  });


  describe('Individual Requirement Tests', () => {
    test('getAllUsers returns a sorted list', async () => {
      // Arrange
      await manager.createUser('charlie');
      await manager.createUser('bob');
      await manager.createUser('alice');

      // Act
      const list = await manager.getAllUsers();

      // Assert
      expect(list).toEqual(['alice', 'bob', 'charlie']); // alphabetical
    });

    test('createUser prevents duplicate usernames', async () => {
      // Arrange
      await manager.createUser('duplicate');

      // Act & Assert
      await expect(manager.createUser('duplicate'))
        .rejects.toThrow('Username "duplicate" already exists.');
    });
  });

  
  describe('Edge Case Tests', () => {
    test('allows usernames that differ only in case', async () => {
      // Arrange & Act
      await manager.createUser('Bob');
      await manager.createUser('bob');

      // Assert
      const list = await manager.getAllUsers();
      expect(list).toEqual(['Bob', 'bob']); // case-sensitive uniqueness
    });

    test('preserves leading/trailing whitespace in username string', async () => {
      // Arrange
      const spaced = '  spaced  ';

      // Act
      await manager.createUser(spaced);
      const exists = await manager.userExists(spaced);

      // Assert
      expect(exists).toBe(true);
      expect(await manager.getAllUsers()).toEqual([spaced]);
    });
  });

  
  describe('Negative (Exception) Tests', () => {
    test('throws on empty string', async () => {
      await expect(manager.createUser(''))
        .rejects.toThrow('Username must be a non-empty string.');
    });

    test('throws on whitespace-only string', async () => {
      await expect(manager.createUser('   '))
        .rejects.toThrow('Username must be a non-empty string.');
    });

    test('throws on non-string username', async () => {
      // @ts-expect-error – intentional wrong type
      await expect(manager.createUser(123))
        .rejects.toThrow('Username must be a non-empty string.');
    });
  });

  
  describe('Combination Tests (entire flows)', () => {
    test('create multiple users then verify existence and list integrity', async () => {
      // Arrange
      const users = ['u1', 'u2', 'u3'];
      for (const u of users) await manager.createUser(u);

      // Act
      const all = await manager.getAllUsers();
      const existChecks = await Promise.all(users.map(u => manager.userExists(u)));

      // Assert
      expect(all).toEqual(['u1', 'u2', 'u3']);
      expect(existChecks).toEqual([true, true, true]);
    });
  });
});
