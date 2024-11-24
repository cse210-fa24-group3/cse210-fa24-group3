jest.mock('../home', () => ({
    ...jest.requireActual('../home'),
    addEventListener: jest.fn(),
  }));

  describe('Home Component Tests', () => {
    describe('addListner', () => {
        test('is mocked and not executed', () => {
          expect(jest.isMockFunction(addEventListener)).toBe(false);
        });
      });
  });
  