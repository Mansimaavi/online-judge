import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateFile } from '../utils/generateFile.js';

const createdPaths = [];

afterEach(() => {
  // Clean up everything this test file created, regardless of pass/fail.
  while (createdPaths.length) {
    const p = createdPaths.pop();
    try {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
      else fs.unlinkSync(p);
    } catch (_) { /* already gone */ }
  }
});

describe('generateFile', () => {
  it('creates a .cpp file with the given content', () => {
    const filepath = generateFile('cpp', '#include <iostream>');
    createdPaths.push(filepath);

    expect(filepath.endsWith('.cpp')).toBe(true);
    expect(fs.readFileSync(filepath, 'utf-8')).toBe('#include <iostream>');
  });

  it('creates a .c file with the given content', () => {
    const filepath = generateFile('c', '#include <stdio.h>');
    createdPaths.push(filepath);

    expect(filepath.endsWith('.c')).toBe(true);
    expect(fs.readFileSync(filepath, 'utf-8')).toBe('#include <stdio.h>');
  });

  it('creates a .py file with the given content', () => {
    const filepath = generateFile('python', 'print(1)');
    createdPaths.push(filepath);

    expect(filepath.endsWith('.py')).toBe(true);
    expect(fs.readFileSync(filepath, 'utf-8')).toBe('print(1)');
  });

  it('java: writes Main.java inside a UUID-named directory, not <uuid>.java', () => {
    // Regression test for a real bug: javac requires the source file name
    // to match the public class name. Every Java boilerplate declares
    // `public class Main`, which is incompatible with a UUID-named file -
    // this must stay a UUID-named *directory* containing Main.java.
    const filepath = generateFile('java', 'public class Main {}');
    createdPaths.push(path.dirname(filepath));

    expect(path.basename(filepath)).toBe('Main.java');
    expect(path.basename(path.dirname(filepath))).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(fs.readFileSync(filepath, 'utf-8')).toBe('public class Main {}');
  });

  it('generates a different UUID-based path on every call', () => {
    const a = generateFile('cpp', 'x');
    const b = generateFile('cpp', 'x');
    createdPaths.push(a, b);
    expect(a).not.toBe(b);
  });
});
