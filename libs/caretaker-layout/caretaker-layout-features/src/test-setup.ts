import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Polyfill for TextEncoder/TextDecoder
class TextEncoderPolyfill implements TextEncoder {
  encoding = 'utf-8';
  encode(input: string): Uint8Array {
    const arr = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      arr[i] = input.charCodeAt(i);
    }
    return arr;
  }
  encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult {
    const encoded = this.encode(source);
    destination.set(encoded);
    return {
      read: source.length,
      written: encoded.length
    };
  }
}

class TextDecoderPolyfill implements TextDecoder {
  encoding = 'utf-8';
  fatal = false;
  ignoreBOM = false;

  constructor(label?: string, options?: TextDecoderOptions) {
    // These are ignored in this simple polyfill
  }

  decode(input?: BufferSource, options?: TextDecodeOptions): string {
    if (!input) return '';
    const arr = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer);
    return String.fromCharCode.apply(null, Array.from(arr));
  }
}

global.TextEncoder = TextEncoderPolyfill as unknown as typeof TextEncoder;
global.TextDecoder = TextDecoderPolyfill as unknown as typeof TextDecoder;

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  // Mock other hooks and components as needed
}));

// Mock caretaker-data
jest.mock('@caretaker/caretaker-data', () => ({
  SessionService: {
    logout: jest.fn(),
  },
  userStore: {
    value: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      account: {
        id: 1,
        name: 'Test Account',
        slug: 'test-account',
        users: []
      }
    }
  },
  appStore: {
    value: {
      isSidebarOpen: false,
      alerts: [],
    },
    openSidebar: jest.fn(),
    closeSidebar: jest.fn(),
  },
})); 