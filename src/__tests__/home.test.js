const { truncateText } = require('../home');

describe('truncateText', () => {
  test('returns full text if shorter than maxLength', () => {
    expect(truncateText('Short text', 20)).toBe('Short text');
  });

  test('truncates text and adds ellipsis if longer than maxLength', () => {
    expect(truncateText('This is a long text', 10)).toBe('This is...');
  });
});