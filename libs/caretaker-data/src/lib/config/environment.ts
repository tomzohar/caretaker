const isProd = process && process?.env?.['NODE_ENV'] === 'production';

export const environment = {
  apiUrl: isProd ? 'https://api.caretaker.center' : 'http://localhost:3333'
}; 