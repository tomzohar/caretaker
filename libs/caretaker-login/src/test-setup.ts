import '@testing-library/jest-dom';
import { TextEncoder } from 'util';

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = require('util').TextDecoder;

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
})); 