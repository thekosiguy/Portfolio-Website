/**
 * Unit tests for contact form validation
 * Tests Requirements 8.1, 8.2, 8.3, 8.4, 8.7, 8.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Contact Form Validation', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the contact.html file
    const html = fs.readFileSync(
      path.resolve(__dirname, '../my-portfolio/contact.html'),
      'utf-8'
    );

    // Load the script.js file
    const scriptContent = fs.readFileSync(
      path.resolve(__dirname, '../my-portfolio/js/script.js'),
      'utf-8'
    );

    // Create a new JSDOM instance
    dom = new JSDOM(html, {
      runScripts: 'outside-only',
      resources: 'usable',
    });

    document = dom.window.document;
    window = dom.window;

    // Make global functions available
    window.eval(scriptContent);

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  describe('Required Field Validation (Requirement 8.1)', () => {
    it('should display error message when required name field is empty', () => {
      const nameField = document.querySelector('#name');
      const form = document.querySelector('.contact-form');

      // Trigger blur event on empty field
      nameField.value = '';
      nameField.dispatchEvent(new window.Event('blur'));

      // Check for error state
      expect(nameField.classList.contains('is-invalid')).toBe(true);
      expect(nameField.getAttribute('aria-invalid')).toBe('true');

      // Check for error message
      const errorElement = nameField.closest('.form-field').querySelector('.field-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toBe('This field is required');
    });

    it('should display error message when required email field is empty', () => {
      const emailField = document.querySelector('#email');

      emailField.value = '';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(true);
      const errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('This field is required');
    });

    it('should display error message when required message field is empty', () => {
      const messageField = document.querySelector('#message');

      messageField.value = '';
      messageField.dispatchEvent(new window.Event('blur'));

      expect(messageField.classList.contains('is-invalid')).toBe(true);
      const errorElement = messageField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('This field is required');
    });

    it('should remove error when required field is filled', () => {
      const nameField = document.querySelector('#name');

      // First make it invalid
      nameField.value = '';
      nameField.dispatchEvent(new window.Event('blur'));
      expect(nameField.classList.contains('is-invalid')).toBe(true);

      // Then fill it
      nameField.value = 'John Doe';
      nameField.dispatchEvent(new window.Event('blur'));

      expect(nameField.classList.contains('is-invalid')).toBe(false);
      expect(nameField.hasAttribute('aria-invalid')).toBe(false);
      const errorElement = nameField.closest('.form-field').querySelector('.field-error');
      expect(errorElement).toBeFalsy();
    });
  });

  describe('Email Format Validation (Requirement 8.2)', () => {
    it('should display error for invalid email format - missing @', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'invalidemail.com';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(true);
      const errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('Please enter a valid email address');
    });

    it('should display error for invalid email format - missing domain', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'user@';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(true);
      const errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('Please enter a valid email address');
    });

    it('should display error for invalid email format - missing extension', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'user@domain';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(true);
      const errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('Please enter a valid email address');
    });

    it('should accept valid email format', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'user@example.com';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(false);
      const errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement).toBeFalsy();
    });

    it('should accept valid email with subdomain', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'user@mail.example.com';
      emailField.dispatchEvent(new window.Event('blur'));

      expect(emailField.classList.contains('is-invalid')).toBe(false);
    });
  });

  describe('Inline Validation Timing (Requirement 8.3)', () => {
    it('should display validation feedback on blur event', () => {
      const nameField = document.querySelector('#name');

      nameField.value = '';
      const startTime = Date.now();
      nameField.dispatchEvent(new window.Event('blur'));
      const endTime = Date.now();

      // Check that error appears
      expect(nameField.classList.contains('is-invalid')).toBe(true);

      // Validation should be nearly instantaneous (well under 100ms)
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should re-validate on input if field was previously invalid', () => {
      const emailField = document.querySelector('#email');

      // Make field invalid
      emailField.value = 'invalid';
      emailField.dispatchEvent(new window.Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);

      // Fix the value and trigger input event
      emailField.value = 'valid@example.com';
      emailField.dispatchEvent(new window.Event('input'));

      // Should now be valid
      expect(emailField.classList.contains('is-invalid')).toBe(false);
    });
  });

  describe('Form Submission Prevention (Requirements 8.4, 8.8)', () => {
    it('should prevent form submission when fields are invalid', () => {
      const form = document.querySelector('.contact-form');
      const nameField = document.querySelector('#name');
      const emailField = document.querySelector('#email');
      const messageField = document.querySelector('#message');

      // Leave fields empty
      nameField.value = '';
      emailField.value = '';
      messageField.value = '';

      // Try to submit
      const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      // Should prevent default submission
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should allow form submission when all fields are valid', () => {
      const form = document.querySelector('.contact-form');
      const nameField = document.querySelector('#name');
      const emailField = document.querySelector('#email');
      const messageField = document.querySelector('#message');

      // Fill all fields with valid data
      nameField.value = 'John Doe';
      emailField.value = 'john@example.com';
      messageField.value = 'This is a test message';

      // Try to submit
      const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      // Should NOT prevent default (allow submission)
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should focus first invalid field on submission attempt', () => {
      const form = document.querySelector('.contact-form');
      const nameField = document.querySelector('#name');
      const emailField = document.querySelector('#email');
      const messageField = document.querySelector('#message');

      // Make name field invalid (first field)
      nameField.value = '';
      emailField.value = 'valid@example.com';
      messageField.value = 'Valid message';

      // Mock focus method
      const focusSpy = vi.spyOn(nameField, 'focus');

      // Try to submit
      const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      // Should focus the first invalid field
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Accessible Error Messaging (Requirement 8.7)', () => {
    it('should add ARIA attributes to error messages', () => {
      const nameField = document.querySelector('#name');

      nameField.value = '';
      nameField.dispatchEvent(new window.Event('blur'));

      const errorElement = nameField.closest('.form-field').querySelector('.field-error');

      // Check ARIA attributes
      expect(errorElement.getAttribute('role')).toBe('alert');
      expect(errorElement.getAttribute('aria-live')).toBe('polite');
      expect(errorElement.id).toBe('error-name');
    });

    it('should link error message to field with aria-describedby', () => {
      const emailField = document.querySelector('#email');

      emailField.value = 'invalid';
      emailField.dispatchEvent(new window.Event('blur'));

      // Check that field references error message
      expect(emailField.getAttribute('aria-describedby')).toBe('error-email');
    });

    it('should set aria-invalid attribute on invalid fields', () => {
      const messageField = document.querySelector('#message');

      messageField.value = '';
      messageField.dispatchEvent(new window.Event('blur'));

      expect(messageField.getAttribute('aria-invalid')).toBe('true');
    });

    it('should remove ARIA attributes when field becomes valid', () => {
      const nameField = document.querySelector('#name');

      // Make invalid
      nameField.value = '';
      nameField.dispatchEvent(new window.Event('blur'));
      expect(nameField.getAttribute('aria-invalid')).toBe('true');

      // Make valid
      nameField.value = 'John Doe';
      nameField.dispatchEvent(new window.Event('blur'));

      expect(nameField.hasAttribute('aria-invalid')).toBe(false);
      expect(nameField.hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace when validating required fields', () => {
      const nameField = document.querySelector('#name');

      // Field with only whitespace should be invalid
      nameField.value = '   ';
      nameField.dispatchEvent(new window.Event('blur'));

      expect(nameField.classList.contains('is-invalid')).toBe(true);
    });

    it('should handle multiple validation errors on same field', () => {
      const emailField = document.querySelector('#email');

      // Empty email (required error)
      emailField.value = '';
      emailField.dispatchEvent(new window.Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);
      let errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('This field is required');

      // Invalid format error
      emailField.value = 'invalid';
      emailField.dispatchEvent(new window.Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);
      errorElement = emailField.closest('.form-field').querySelector('.field-error');
      expect(errorElement.textContent).toBe('Please enter a valid email address');
    });

    it('should not validate non-required fields if they are empty', () => {
      // This test verifies that email format validation only runs if there's a value
      const emailField = document.querySelector('#email');
      
      // Remove required attribute temporarily for this test
      emailField.removeAttribute('required');
      
      emailField.value = '';
      emailField.dispatchEvent(new window.Event('blur'));

      // Should be valid (empty is ok for non-required)
      expect(emailField.classList.contains('is-invalid')).toBe(false);
      
      // Restore required attribute
      emailField.setAttribute('required', '');
    });
  });
});
