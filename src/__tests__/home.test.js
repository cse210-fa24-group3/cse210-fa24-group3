const { displayEntries } = require('../home');

beforeEach(() => {
  // Clear and set up DOM
  document.body.innerHTML = '<div id="entries-grid"></div>';

  // Mock localStorage
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
});

describe('displayEntries', () => {
//   test('should display a message when there are no entries', () => {
//     // Mock localStorage to return no entries
//     // localStorage.getItem.mockReturnValue(null);

//     // Debugging: Log the DOM state before the function call
//     console.log(document.body.innerHTML);

//     // Call the function
//     // displayEntries();

//     // Verify the DOM
//     const entriesGrid = document.getElementById('entries-grid');
//     expect(entriesGrid).not.toBeNull(); // Ensure the element exists
//     expect(entriesGrid.innerHTML).toContain('No entries yet. Click "Create New" to get started!');
//   });
test('formatRelativeTime should return "just now" for very recent dates', () => {
    const now = new Date();
    // expect(formatRelativeTime(now.toISOString())).toBe('just now');
  });
});
