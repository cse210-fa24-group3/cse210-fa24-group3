// Mock `displayEntries` to avoid invoking it during tests
jest.mock('../home', () => ({
    ...jest.requireActual('../home'),
    displayEntries: jest.fn(),
  }));
  
  const { formatRelativeTime, displayEntries } = require('../home');
  
  describe('Home Component Tests', () => {
    // Test `formatRelativeTime` function
    describe('formatRelativeTime', () => {
      test('returns "just now" for very recent dates', () => {
        const now = new Date();
        expect(formatRelativeTime(now.toISOString())).toBe('just now');
      });
  
      test('returns formatted string for minutes ago', () => {
        const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
        expect(formatRelativeTime(date.toISOString())).toBe('5 minutes ago');
      });
  
      test('returns formatted string for hours ago', () => {
        const date = new Date(Date.now() - 2 * 3600 * 1000); // 2 hours ago
        expect(formatRelativeTime(date.toISOString())).toBe('2 hours ago');
      });
  
      test('returns formatted string for days ago', () => {
        const date = new Date(Date.now() - 3 * 86400 * 1000); // 3 days ago
        expect(formatRelativeTime(date.toISOString())).toBe('3 days ago');
      });
  
      test('returns locale date string for dates older than a week', () => {
        const date = new Date('2020-01-01');
        expect(formatRelativeTime(date.toISOString())).toBe(date.toLocaleDateString());
      });
    });
  
    // Test `displayEntries` (mocked to ensure it doesn’t interact with the DOM)
    describe('displayEntries', () => {
      test('is mocked and not executed', () => {
        expect(jest.isMockFunction(displayEntries)).toBe(true);
      });
    });
  });
  