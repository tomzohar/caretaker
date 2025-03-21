import initApp from '../app';

describe('Caretaker Backend App', () => {
  it('should initialize the app', async () => {
    const app = await initApp();
    expect(app).toBeDefined();
  });
}); 