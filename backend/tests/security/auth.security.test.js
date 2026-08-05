const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { generateTestToken, generateExpiredToken } = require('../helpers/testHelper');
const userRepository = require('../../repositories/user.repository');
const roleRepository = require('../../repositories/role.repository');

jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/role.repository');

describe('Security & RBAC Test: Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    userRepository.findById.mockReset();
    roleRepository.getRoleNamesForUser.mockReset();
  });

  test('should reject request without Bearer authorization header', async () => {
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Access denied') }));
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject expired JWT token', async () => {
    const expiredToken = generateExpiredToken({ id: 1 });
    req.headers.authorization = `Bearer ${expiredToken}`;

    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Token expired. Please login again.' }));
    expect(next).not.toHaveBeenCalled();
  });

  test('should accept valid JWT token and attach user + roles to request', async () => {
    const validToken = generateTestToken({ id: 1 });
    req.headers.authorization = `Bearer ${validToken}`;

    userRepository.findById.mockResolvedValueOnce({ id: 1, is_active: true, email: 'user@example.com' });
    roleRepository.getRoleNamesForUser.mockResolvedValueOnce(['donor']);

    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({
      id: 1,
      email: 'user@example.com',
      roles: ['donor']
    }));
  });

  test('authorize middleware should deny access if user lacks required role', () => {
    req.user = { id: 1, roles: ['donor'] };
    const middleware = authorize('hospital', 'admin');

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Access denied') }));
    expect(next).not.toHaveBeenCalled();
  });

  test('authorize middleware should allow access if user has required role', () => {
    req.user = { id: 1, roles: ['hospital'] };
    const middleware = authorize('hospital', 'admin');

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
