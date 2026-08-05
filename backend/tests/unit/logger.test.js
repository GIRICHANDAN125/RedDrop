const Logger = require('../../utils/logger');

describe('Unit Test: Logger', () => {
  let logSpy, warnSpy, errorSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Logger.info logs formatted JSON message', () => {
    Logger.info('Test info message', { userId: 42 });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('Test info message');
    expect(parsed.meta).toEqual({ userId: 42 });
  });

  test('Logger.warn logs formatted warning JSON message', () => {
    Logger.warn('Test warn message');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('WARN');
  });

  test('Logger.error logs formatted error JSON message', () => {
    Logger.error('Test error message', { error: 'DB_CONN_FAIL' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('ERROR');
    expect(parsed.meta.error).toBe('DB_CONN_FAIL');
  });
});
