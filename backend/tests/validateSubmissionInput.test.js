import { describe, it, expect } from 'vitest';
import { validateSubmissionInput } from '../utils/validateSubmissionInput.js';

describe('validateSubmissionInput', () => {
  it('accepts a valid cpp/java/c/python submission', () => {
    for (const lang of ['cpp', 'java', 'c', 'python']) {
      expect(validateSubmissionInput(lang, 'print("hi")').valid).toBe(true);
    }
  });

  it('is case-insensitive on language', () => {
    expect(validateSubmissionInput('CPP', 'int main(){}').valid).toBe(true);
    expect(validateSubmissionInput('Python', 'pass').valid).toBe(true);
  });

  it('rejects an unsupported language', () => {
    const result = validateSubmissionInput('ruby', 'puts 1');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Unsupported language/);
  });

  it('rejects a non-string language', () => {
    expect(validateSubmissionInput(null, 'code').valid).toBe(false);
    expect(validateSubmissionInput(undefined, 'code').valid).toBe(false);
    expect(validateSubmissionInput(123, 'code').valid).toBe(false);
  });

  it('rejects empty or missing code', () => {
    expect(validateSubmissionInput('cpp', '').valid).toBe(false);
    expect(validateSubmissionInput('cpp', null).valid).toBe(false);
    expect(validateSubmissionInput('cpp', undefined).valid).toBe(false);
  });

  it('rejects code over the 64KB size limit', () => {
    const tooBig = 'a'.repeat(64 * 1024 + 1);
    const result = validateSubmissionInput('cpp', tooBig);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/size limit/);
  });

  it('accepts code right at the size limit', () => {
    const atLimit = 'a'.repeat(64 * 1024);
    expect(validateSubmissionInput('cpp', atLimit).valid).toBe(true);
  });
});
