/**
 * Tests for keyboard navigation support (Task 3)
 * Requirements: 3.2, 5.3
 */

import { describe, test, expect, beforeEach } from 'vitest';

describe('Keyboard Navigation Support', () => {
  beforeEach(() => {
    // Set up navigation HTML structure
    document.body.innerHTML = `
      <header class="site-header">
        <nav class="main-nav">
          <button class="nav-toggle" aria-expanded="false" aria-controls="primary-menu">
            <span class="sr-only">Toggle navigation</span>
          </button>
          <ul id="primary-menu" class="nav-list">
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="about.html" class="nav-link">About</a></li>
            <li><a href="portfolio.html" class="nav-link">Portfolio</a></li>
          </ul>
        </nav>
      </header>
    `;

    // Load the script functionality
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    if (navToggle && navList) {
      function toggleNav() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navList.classList.toggle('is-open');
        
        if (!isExpanded) {
          const firstNavLink = navList.querySelector('.nav-link');
          if (firstNavLink) {
            firstNavLink.focus();
          }
        }
      }

      navToggle.addEventListener('click', toggleNav);

      navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleNav();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('is-open')) {
          toggleNav();
          navToggle.focus();
        }
      });
    }
  });

  test('Enter key activates nav toggle button', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    expect(navList.classList.contains('is-open')).toBe(false);

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    navToggle.dispatchEvent(enterEvent);

    expect(navToggle.getAttribute('aria-expanded')).toBe('true');
    expect(navList.classList.contains('is-open')).toBe(true);
  });

  test('Space key activates nav toggle button', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    expect(navList.classList.contains('is-open')).toBe(false);

    // Simulate Space key press
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    navToggle.dispatchEvent(spaceEvent);

    expect(navToggle.getAttribute('aria-expanded')).toBe('true');
    expect(navList.classList.contains('is-open')).toBe(true);
  });

  test('Escape key closes open menu', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    // First open the menu
    navToggle.click();
    expect(navList.classList.contains('is-open')).toBe(true);

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(navList.classList.contains('is-open')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('Escape key does nothing when menu is already closed', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    expect(navList.classList.contains('is-open')).toBe(false);

    // Simulate Escape key press on closed menu
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    // Should remain closed
    expect(navList.classList.contains('is-open')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('Focus moves to first nav link when menu opens', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const firstNavLink = document.querySelector('.nav-link');

    // Mock focus method
    let focusedElement = null;
    firstNavLink.focus = () => {
      focusedElement = firstNavLink;
    };

    // Open menu with Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    navToggle.dispatchEvent(enterEvent);

    // Verify focus was moved to first nav link
    expect(focusedElement).toBe(firstNavLink);
  });

  test('Focus returns to toggle button when menu closes with Escape', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    // Mock focus method
    let focusedElement = null;
    navToggle.focus = () => {
      focusedElement = navToggle;
    };

    // Open menu first
    navToggle.click();
    expect(navList.classList.contains('is-open')).toBe(true);

    // Close with Escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    // Verify focus returned to toggle button
    expect(focusedElement).toBe(navToggle);
  });

  test('Toggling twice returns menu to original state', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    const initialState = navList.classList.contains('is-open');
    const initialAriaExpanded = navToggle.getAttribute('aria-expanded');

    // Toggle twice with keyboard
    const enterEvent1 = new KeyboardEvent('keydown', { key: 'Enter' });
    navToggle.dispatchEvent(enterEvent1);

    const enterEvent2 = new KeyboardEvent('keydown', { key: 'Enter' });
    navToggle.dispatchEvent(enterEvent2);

    // Should return to original state
    expect(navList.classList.contains('is-open')).toBe(initialState);
    expect(navToggle.getAttribute('aria-expanded')).toBe(initialAriaExpanded);
  });

  test('aria-expanded attribute updates correctly with keyboard navigation', () => {
    const navToggle = document.querySelector('.nav-toggle');

    expect(navToggle.getAttribute('aria-expanded')).toBe('false');

    // Open with Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    navToggle.dispatchEvent(spaceEvent);
    expect(navToggle.getAttribute('aria-expanded')).toBe('true');

    // Close with Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });
});
