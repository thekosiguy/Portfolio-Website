/**
 * Vitest setup file for portfolio quality improvements testing
 * Configures JSDOM environment and global test utilities
 */

import { beforeEach, afterEach } from 'vitest';

// Mock localStorage factory
export const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

// Set up a basic HTML structure before each test
beforeEach(() => {
  // Reset document body
  document.body.innerHTML = '';
  
  // Reset viewport size to default
  global.innerWidth = 1024;
  global.innerHeight = 768;
  
  // Mock localStorage for global context
  const localStorageMock = createLocalStorageMock();
  global.localStorage = localStorageMock;
  
  // Mock window.matchMedia for reduced motion tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 0);
  };
  
  global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
  
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = '';
});

// Global test utilities
global.setViewportWidth = (width) => {
  global.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

global.setViewportHeight = (height) => {
  global.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

// Helper to load HTML content for testing
global.loadHTML = (html) => {
  document.body.innerHTML = html;
};

// Helper to get computed styles
global.getComputedStyleValue = (element, property) => {
  return window.getComputedStyle(element).getPropertyValue(property);
};
