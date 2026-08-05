const ResponseUtil = require('../../utils/response');

describe('Unit Test: ResponseUtil', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      req: { id: 'test_req_123' }
    };
  });

  test('ResponseUtil.success should return a standardized success payload', () => {
    const data = { user: { id: 1, name: 'John' } };
    ResponseUtil.success(res, { code: 200, message: 'User found', data });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        code: 200,
        message: 'User found',
        data,
        meta: expect.objectContaining({
          requestId: 'test_req_123'
        })
      })
    );
  });

  test('ResponseUtil.error should return a standardized RFC 7807 style error payload', () => {
    ResponseUtil.error(res, {
      code: 400,
      type: 'INVALID_INPUT',
      message: 'Email is required',
      details: [{ field: 'email', issue: 'missing' }]
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 400,
        error: {
          type: 'INVALID_INPUT',
          message: 'Email is required',
          details: [{ field: 'email', issue: 'missing' }]
        }
      })
    );
  });
});
