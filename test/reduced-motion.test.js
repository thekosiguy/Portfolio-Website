/**
 * Tests for reduced motion support
 * Validates Requirement 9.3: Animation Performance and Accessibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Reduced Motion Support', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Read the HTML and JS files
    const htmlPath = path.join(process.cwd(), 'my-portfolio', 'index.html');
    const jsPath = path.join(process.cwd(), 'my-portfolio', 'js', 'script.js');
    const cssPath = path.join(process.cwd(), 'my-portfolio', 'css', 'styles.css');
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Create JSDOM instance
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      beforeParse(window) {
        // Mock IntersectionObserver
        window.IntersectionObserver = class IntersectionObserver {
          constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.observedElements = [];
          }
          observe(element) {
            this.observedElements.push(element);
          }
          unobserve(element) {
            const index = this.observedElements.indexOf(element);
            if (index > -1) {
              this.observedElements.splice(index, 1);
            }
          }
          disconnect() {
            this.observedElements = [];
          }
        };
      }
    });

    document = dom.window.document;
    window = dom.window;

    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);

    // Add script to document
    const scriptElement = document.createElement('script');
    scriptElement.textContent = jsContent;
    document.body.appendChild(scriptElement);
  });

  it('should skip scroll animations when user prefers reduced motion', () => {
    // Mock matchMedia to return true for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Add some elements that would normally animate
    const section = document.createElement('section');
    section.className = 'section';
    document.body.appendChild(section);

    const card = document.createElement('div');
    card.className = 'home-card';
    document.body.appendChild(card);

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Wait for script execution
    return new Promise((resolve) => {
      setTimeout(() => {
        // Elements should have is-visible class immediately (no animation)
        expect(section.classList.contains('is-visible')).toBe(true);
        expect(card.classList.contains('is-visible')).toBe(true);

        // Elements should NOT have reveal-on-scroll class (animations skipped)
        expect(section.classList.contains('reveal-on-scroll')).toBe(false);
        expect(card.classList.contains('reveal-on-scroll')).toBe(false);

        resolve();
      }, 100);
    });
  });

  it('should use IntersectionObserver when user does not prefer reduced motion', () => {
    // Mock matchMedia to return false for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Add some elements that would normally animate
    const section = document.createElement('section');
    section.className = 'section';
    document.body.appendChild(section);

    const card = document.createElement('div');
    card.className = 'home-card';
    document.body.appendChild(card);

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Wait for script execution
    return new Promise((resolve) => {
      setTimeout(() => {
        // Elements should have reveal-on-scroll class (animations enabled)
        expect(section.classList.contains('reveal-on-scroll')).toBe(true);
        expect(card.classList.contains('reveal-on-scroll')).toBe(true);

        // Elements should NOT have is-visible class yet (waiting for intersection)
        expect(section.classList.contains('is-visible')).toBe(false);
        expect(card.classList.contains('is-visible')).toBe(false);

        resolve();
      }, 100);
    });
  });

  it('should have CSS rules to disable hero animations with reduced motion', () => {
    // Check if the CSS contains the prefers-reduced-motion media query
    const cssPath = path.join(process.cwd(), 'my-portfolio', 'css', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Verify the media query exists
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    
    // Verify hero elements have animation disabled
    expect(cssContent).toMatch(/prefers-reduced-motion.*hero-kicker.*animation:\s*none/s);
    
    // Verify reveal-on-scroll has transition disabled
    expect(cssContent).toMatch(/prefers-reduced-motion.*reveal-on-scroll.*transition:\s*none/s);
  });

  it('should show all elements immediately with reduced motion (no IntersectionObserver)', () => {
    // Mock matchMedia to return true for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Track IntersectionObserver creation
    let observerCreated = false;
    const OriginalObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends OriginalObserver {
      constructor(...args) {
        super(...args);
        observerCreated = true;
      }
    };

    // Add multiple elements
    const elements = [
      'section',
      'home-card',
      'project-card',
      'service-card',
      'testimonial-card'
    ];

    elements.forEach(className => {
      const el = document.createElement('div');
      el.className = className;
      document.body.appendChild(el);
    });

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Wait for script execution
    return new Promise((resolve) => {
      setTimeout(() => {
        // IntersectionObserver should NOT be created
        expect(observerCreated).toBe(false);

        // All elements should be visible immediately
        elements.forEach(className => {
          const el = document.querySelector(`.${className}`);
          expect(el.classList.contains('is-visible')).toBe(true);
        });

        resolve();
      }, 100);
    });
  });
});
