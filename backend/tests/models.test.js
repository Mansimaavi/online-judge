import { describe, it, expect } from 'vitest';
import Problem from '../models/problem.js';
import User from '../models/user.js';
import Submission from '../models/submission.js';
import mongoose from 'mongoose';

describe('Problem schema', () => {
  const validProblem = {
    problemNumber: 1,
    title: 'Test Problem',
    description: 'A description',
    difficulty: 'Easy',
    category: 'Array',
    defaultCode: { cpp: 'x', java: 'x', c: 'x', python: 'x' },
    boilerplate: { cpp: 'x', java: 'x', c: 'x', python: 'x' },
    sampleInput: 'in',
    sampleOutput: ['out'],
    testCases: [{ input: 'a', output: 'b' }],
    author: 'admin',
  };

  it('accepts a well-formed problem', () => {
    const doc = new Problem(validProblem);
    expect(doc.validateSync()).toBeUndefined();
  });

  it('auto-casts a bare sampleOutput string into a single-element array', () => {
    // Verified against real Mongoose behavior: for a [Mixed] array field,
    // a bare scalar is cast to a one-element array rather than rejected.
    // This matters because a raw MongoDB insert that bypasses Mongoose
    // entirely (e.g. a direct driver insert) does NOT get this casting,
    // so data written that way must already match the array shape -
    // this is exactly what was fixed by hand while seeding problems.json.
    const doc = new Problem({ ...validProblem, sampleOutput: 'out' });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.sampleOutput).toEqual(['out']);
  });

  it('rejects a category outside the allowed enum', () => {
    const doc = new Problem({ ...validProblem, category: 'Not A Real Category' });
    expect(doc.validateSync()).toBeDefined();
  });

  it('requires problemNumber and title', () => {
    const { problemNumber, ...withoutNumber } = validProblem;
    expect(new Problem(withoutNumber).validateSync()).toBeDefined();

    const { title, ...withoutTitle } = validProblem;
    expect(new Problem(withoutTitle).validateSync()).toBeDefined();
  });
});

describe('User schema', () => {
  const validUser = {
    username: 'valid_user',
    firstName: 'First',
    lastName: 'Last',
    email: 'user@example.com',
    password: 'hashedpw',
  };

  it('accepts a well-formed user and defaults role to user', () => {
    const doc = new User(validUser);
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.role).toBe('user');
  });

  it('rejects an invalid email format', () => {
    const doc = new User({ ...validUser, email: 'not-an-email' });
    expect(doc.validateSync()).toBeDefined();
  });

  it('rejects a username with disallowed characters', () => {
    const doc = new User({ ...validUser, username: 'has spaces!' });
    expect(doc.validateSync()).toBeDefined();
  });

  it('rejects a role outside user/admin', () => {
    const doc = new User({ ...validUser, role: 'superuser' });
    expect(doc.validateSync()).toBeDefined();
  });

  it('rejects a password under 6 characters', () => {
    const doc = new User({ ...validUser, password: '123' });
    expect(doc.validateSync()).toBeDefined();
  });
});

describe('Submission schema', () => {
  const validSubmission = {
    user: new mongoose.Types.ObjectId(),
    problem: new mongoose.Types.ObjectId(),
    problemNumber: 1,
    code: 'int main(){}',
    language: 'cpp',
    status: 'Accepted',
  };

  it('accepts a well-formed submission', () => {
    expect(new Submission(validSubmission).validateSync()).toBeUndefined();
  });

  it('accepts every real verdict the execution layer can report', () => {
    // Every one of these must be accepted, or a real submission with that
    // verdict fails to save - this is exactly the bug found and fixed
    // (System Error was missing from the enum) while wiring up the
    // Docker sandbox's error classification.
    const verdicts = ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded', 'System Error'];
    for (const status of verdicts) {
      const doc = new Submission({ ...validSubmission, status });
      expect(doc.validateSync(), `status "${status}" should be valid`).toBeUndefined();
    }
  });

  it('rejects a language outside cpp/java/c/python', () => {
    const doc = new Submission({ ...validSubmission, language: 'ruby' });
    expect(doc.validateSync()).toBeDefined();
  });

  it('rejects a status not in the verdict enum', () => {
    const doc = new Submission({ ...validSubmission, status: 'Maybe' });
    expect(doc.validateSync()).toBeDefined();
  });
});
