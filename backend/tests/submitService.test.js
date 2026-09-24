import { describe, it, expect, vi, beforeEach } from 'vitest';
import Problem from '../models/problem.js';

// Mock the execution layer so this test runs anywhere (no compilers, no
// Docker, no database needed) while still exercising the real
// verdict-selection logic in submitService.js.
vi.mock('../utils/generateFile.js', () => ({
  generateFile: vi.fn(() => '/tmp/fake-file.cpp'),
}));

const executeCodeMock = vi.fn();
vi.mock('../utils/executeCode.js', () => ({
  executeCode: (...args) => executeCodeMock(...args),
}));

const { validateSubmission } = (await import('../services/submitService.js')).default;

function makeProblem(testCases) {
  // A real (unsaved) Mongoose document, so `.boilerplate.get(lang)`
  // behaves exactly as it does with a document loaded from the database.
  return new Problem({
    problemNumber: 1,
    title: 'Test',
    description: 'd',
    difficulty: 'Easy',
    category: 'Array',
    boilerplate: { cpp: '{{USER_CODE}}' },
    defaultCode: { cpp: 'x' },
    sampleInput: 'i',
    sampleOutput: ['o'],
    testCases,
    author: 'admin',
  });
}

beforeEach(() => {
  executeCodeMock.mockReset();
  vi.restoreAllMocks();
});

describe('validateSubmission', () => {
  it('returns Accepted when every test case passes', async () => {
    vi.spyOn(Problem, "findOne").mockResolvedValue(makeProblem([
      { input: '1', output: '2' },
      { input: '3', output: '4' },
    ]));
    executeCodeMock.mockResolvedValueOnce('2\n').mockResolvedValueOnce('4\n');

    const result = await validateSubmission(1, 'code', 'cpp');

    expect(result.status).toBe('Accepted');
    expect(result.passedTests).toBe(2);
    expect(result.totalTests).toBe(2);
    expect(executeCodeMock).toHaveBeenCalledTimes(2);
  });

  it('stops at the first Wrong Answer instead of running every test case', async () => {
    vi.spyOn(Problem, "findOne").mockResolvedValue(makeProblem([
      { input: '1', output: '2' },
      { input: '3', output: '4' },
      { input: '5', output: '6' },
    ]));
    executeCodeMock
      .mockResolvedValueOnce('2\n')   // test 1: correct
      .mockResolvedValueOnce('WRONG\n'); // test 2: wrong

    const result = await validateSubmission(1, 'code', 'cpp');

    expect(result.status).toBe('Wrong Answer');
    expect(result.passedTests).toBe(1);
    expect(result.totalTests).toBe(3); // declared total, even though only 2 ran
    // Third test case never executed - this is the "no reason to keep
    // running against code already known to fail" optimization.
    expect(executeCodeMock).toHaveBeenCalledTimes(2);
  });

  it('propagates Compilation Error from the execution layer without retrying other test cases', async () => {
    vi.spyOn(Problem, "findOne").mockResolvedValue(makeProblem([
      { input: '1', output: '2' },
      { input: '3', output: '4' },
    ]));
    executeCodeMock.mockRejectedValueOnce({ error: 'Compilation Error', stderr: 'syntax error' });

    const result = await validateSubmission(1, 'code', 'cpp');

    expect(result.status).toBe('Compilation Error');
    expect(result.passedTests).toBe(0);
    expect(executeCodeMock).toHaveBeenCalledTimes(1); // no point compiling broken code 5 times
  });

  it('propagates Time Limit Exceeded distinctly from a generic Runtime Error', async () => {
    vi.spyOn(Problem, "findOne").mockResolvedValue(makeProblem([{ input: '1', output: '2' }]));
    executeCodeMock.mockRejectedValueOnce({ error: 'Time Limit Exceeded', stderr: '' });

    const result = await validateSubmission(1, 'code', 'cpp');

    expect(result.status).toBe('Time Limit Exceeded');
  });

  it('rejects before touching the database at all when input validation fails', async () => {
    const findOneSpy = vi.spyOn(Problem, 'findOne');
    await expect(validateSubmission(1, 'x'.repeat(70000), 'cpp')).rejects.toMatchObject({
      error: 'System Error',
    });
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  it('throws when the problem does not exist', async () => {
    vi.spyOn(Problem, "findOne").mockResolvedValue(null);
    await expect(validateSubmission(999, 'code', 'cpp')).rejects.toThrow('Problem not found');
  });
});
