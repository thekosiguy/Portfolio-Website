# Testing Setup for Portfolio Quality Improvements

This document describes the testing infrastructure for the portfolio quality improvements project.

## Testing Framework

- **Vitest**: Modern, fast unit testing framework with ESM support
- **fast-check**: Property-based testing library for JavaScript
- **JSDOM**: JavaScript implementation of web standards for Node.js testing

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests
Unit tests verify specific examples, edge cases, and error conditions. They are located in the `test/` directory.

Example:
```javascript
test('applies mobile styles at 320px viewport', () => {
  setViewportWidth(320);
  const grid = document.querySelector('.home-grid');
  expect(getComputedStyle(grid).gridTemplateColumns).toBe('1fr');
});
```

### Property-Based Tests
Property-based tests verify universal properties across all inputs using fast-check. Each property test should include a comment referencing the design property.

Example:
```javascript
// Feature: portfolio-quality-improvements, Property 1: Text Readability Without Horizontal Scroll
test('text remains readable without horizontal scroll at any viewport width', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 320, max: 3840 }),
      (viewportWidth) => {
        setViewportWidth(viewportWidth);
        const body = document.body;
        return body.scrollWidth <= body.clientWidth;
      }
    ),
    { numRuns: 100 }
  );
});
```

## Test Utilities

The following global utilities are available in all tests (defined in `test/setup.js`):

- `setViewportWidth(width)`: Set the viewport width for responsive testing
- `setViewportHeight(height)`: Set the viewport height
- `loadHTML(html)`: Load HTML content into the document body
- `getComputedStyleValue(element, property)`: Get computed style value

## Build Scripts

### CSS Minification
```bash
npm run build:css
```
Processes `my-portfolio/css/styles.css` with autoprefixer and cssnano, outputs to `my-portfolio/css/styles.min.css`.

### JavaScript Minification
```bash
npm run build:js
```
Minifies `my-portfolio/js/script.js` with Terser, outputs to `my-portfolio/js/script.min.js`.

### Image Optimization
```bash
npm run build:images
```
Converts images to WebP format and generates responsive variants (320w, 720w, 1440w).

### Full Build
```bash
npm run build
```
Runs all build tasks: CSS minification, JS minification, and image optimization.

## Browser Compatibility

The build process targets:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

Autoprefixer automatically adds vendor prefixes as needed for these browsers.

## Coverage Reports

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`. Open `coverage/index.html` in a browser to view detailed coverage information.

## Writing New Tests

1. Create a new test file in the `test/` directory with `.test.js` extension
2. Import necessary utilities from vitest and fast-check
3. Write unit tests for specific scenarios
4. Write property tests for universal properties
5. Reference the design document property number in comments

Example test file structure:
```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
  });
  
  test('unit test description', () => {
    // Test specific scenario
  });
  
  test('property test description', () => {
    // Feature: portfolio-quality-improvements, Property X: Property Name
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (value) => {
          // Test universal property
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Next Steps

After the development environment is set up:
1. Implement responsive layout system (Task 2)
2. Write property tests for responsive behavior
3. Implement cross-browser compatibility enhancements (Task 3)
4. Continue with remaining tasks as outlined in the implementation plan
