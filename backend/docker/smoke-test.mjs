#!/usr/bin/env node
// Smoke-tests the three sandbox runtime images by actually running code
// through utils/dockerSandbox.js against them - the same orchestration
// code the real app uses, not a separate hand-rolled check. Exits
// non-zero on any failure so CI fails loudly rather than silently.
import { runInSandbox } from '../utils/dockerSandbox.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

function makeJobDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oj-smoke-'));
  fs.chmodSync(dir, 0o777);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
    fs.chmodSync(path.join(dir, name), 0o666);
  }
  return dir;
}

const tests = [
  {
    name: 'cpp',
    image: 'oj-cpp-runtime:ci',
    setup: () => makeJobDir({
      'main.cpp': '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b;return 0;}',
    }),
    compile: { cmd: ['g++', 'main.cpp', '-O2', '-o', 'a.out'] },
    run: { cmd: ['sh', '-c', 'echo "3 4" | ./a.out'] },
    expect: '7',
  },
  {
    name: 'c',
    image: 'oj-cpp-runtime:ci',
    setup: () => makeJobDir({
      'main.c': '#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d",a+b);return 0;}',
    }),
    compile: { cmd: ['gcc', 'main.c', '-O2', '-o', 'a.out'] },
    run: { cmd: ['sh', '-c', 'echo "3 4" | ./a.out'] },
    expect: '7',
  },
  {
    name: 'python',
    image: 'oj-python-runtime:ci',
    setup: () => makeJobDir({
      'main.py': 'a, b = map(int, input().split())\nprint(a + b)',
    }),
    compile: null,
    run: { cmd: ['sh', '-c', 'echo "3 4" | python3 main.py'] },
    expect: '7',
  },
  {
    name: 'java',
    image: 'oj-java-runtime:ci',
    setup: () => makeJobDir({
      'Main.java': 'import java.util.*;\npublic class Main { public static void main(String[] a) { Scanner sc = new Scanner(System.in); System.out.print(sc.nextInt() + sc.nextInt()); } }',
    }),
    compile: { cmd: ['javac', 'Main.java'] },
    run: { cmd: ['sh', '-c', 'echo "3 4" | java Main'] },
    expect: '7',
  },
];

let allPassed = true;

for (const t of tests) {
  const hostDir = t.setup();
  try {
    if (t.compile) {
      const compile = await runInSandbox({ image: t.image, cmd: t.compile.cmd, hostDir, timeoutMs: 20000 });
      if (compile.exitCode !== 0) {
        console.log(`[${t.name}] FAIL: compile exited ${compile.exitCode}\n${compile.stderr}`);
        allPassed = false;
        continue;
      }
    }
    const run = await runInSandbox({ image: t.image, cmd: t.run.cmd, hostDir, timeoutMs: 10000 });
    const got = run.stdout.trim();
    if (got === t.expect) {
      console.log(`[${t.name}] OK (image=${t.image}, output="${got}")`);
    } else {
      console.log(`[${t.name}] FAIL: expected "${t.expect}", got "${got}" (exit=${run.exitCode}, stderr=${run.stderr})`);
      allPassed = false;
    }
  } catch (err) {
    console.log(`[${t.name}] FAIL: ${JSON.stringify(err)}`);
    allPassed = false;
  } finally {
    fs.rmSync(hostDir, { recursive: true, force: true });
  }
}

if (!allPassed) {
  console.log('\nSANDBOX SMOKE TEST FAILED');
  process.exit(1);
}
console.log('\nAll sandbox images verified working');
