const isProd = import.meta.env.PROD;

export const environment = {
  apiUrl: isProd ? 'https://api.caretaker.center' : 'http://localhost:3333'
}; 