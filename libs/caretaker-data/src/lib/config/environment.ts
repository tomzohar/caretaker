// In a test environment, this will be 'test'
// In development, this will be 'development'
// In production build, this will be 'production'
const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;

// Check for multiple indicators of a production environment
const isProd = 
  // Standard NODE_ENV check
  nodeEnv === 'production' || 
  // Check for CI/CD environment variables commonly set in production pipelines
  process?.env?.CI === 'true' || 
  // Check for deployment-specific environment variables
  typeof window !== 'undefined' && 
  (window.location.hostname === 'caretaker.center' || 
   window.location.hostname.endsWith('.caretaker.center') ||
   window.location.hostname.includes('caretaker-prod'));

export const environment = {
  apiUrl: isProd ? 'https://api.caretaker.center' : 'http://localhost:3333'
};