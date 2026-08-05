const userRepository = require('../../repositories/user.repository');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    execute: jest.fn(),
    query: jest.fn()
  }
}));

describe('Repository Test: UserRepository', () => {
  beforeEach(() => {
    pool.execute.mockReset();
    pool.query.mockReset();
  });

  test('findByEmail should query users table by email', async () => {
    const mockUser = { id: 1, email: 'john@example.com', name: 'John' };
    pool.execute.mockResolvedValueOnce([[mockUser]]);

    const result = await userRepository.findByEmail('john@example.com');
    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM users WHERE email = ?'),
      ['john@example.com']
    );
    expect(result).toEqual(mockUser);
  });

  test('findByPhone should check user_profiles and users table', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1 }]]); // user_profiles match

    const result = await userRepository.findByPhone('+1234567890');
    expect(result).toEqual({ id: 1 });
  });

  test('findFullProfileById should execute merged profile query', async () => {
    const mockFullProfile = {
      id: 1,
      email: 'john@example.com',
      name: 'John',
      blood_group: 'O+'
    };
    pool.execute
      .mockResolvedValueOnce([[mockFullProfile]]) // profile row
      .mockResolvedValueOnce([[{ name: 'donor' }]]); // roles rows with 'name' column

    const result = await userRepository.findFullProfileById(1);
    expect(result).toEqual(expect.objectContaining({
      id: 1,
      name: 'John',
      roles: ['donor']
    }));
  });
});
