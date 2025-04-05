// In a test environment, this will be 'test'
// In development, this will be 'development'
// In production build, this will be 'production'
const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;

// Default to development mode for tests
const isProd = nodeEnv === 'production';

export const environment = {
  apiUrl: isProd ? 'https://api.caretaker.center' : 'http://localhost:3333'
}; 