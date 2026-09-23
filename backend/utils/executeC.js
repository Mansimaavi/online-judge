import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runInSandbox } from "./dockerSandbox.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Shares the same image as C++ (the official gcc image ships both gcc and
// g++), so no separate docker/c.Dockerfile is needed.
const IMAGE = process.env.OJ_CPP_IMAGE || 'oj-cpp-runtime:latest';

export const executeC = async (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const jobDir = path.join(outputPath, jobId);

    fs.mkdirSync(jobDir, { recursive: true, mode: 0o777 });
    fs.chmodSync(jobDir, 0o777);

    try {
        fs.copyFileSync(filepath, path.join(jobDir, 'main.c'));
        if (input) fs.writeFileSync(path.join(jobDir, 'input.txt'), input);

        const compile = await runInSandbox({
            image: IMAGE,
            cmd: ['gcc', 'main.c', '-O2', '-o', 'a.out'],
            hostDir: jobDir,
            timeoutMs: 10000,
            memoryMb: 256,
            cpus: 1,
        });

        if (compile.timedOut) {
            throw { error: 'Compilation Error', stderr: 'Compilation timed out' };
        }
        if (compile.exitCode !== 0) {
            throw { error: 'Compilation Error', stderr: compile.stderr };
        }

        const cmd = input ? ['sh', '-c', './a.out < input.txt'] : ['./a.out'];
        const run = await runInSandbox({
            image: IMAGE,
            cmd,
            hostDir: jobDir,
            timeoutMs: 5000,
            memoryMb: 128,
            cpus: 0.5,
        });

        if (run.timedOut) {
            throw { error: 'Time Limit Exceeded', stderr: run.stderr };
        }
        if (run.exitCode !== 0) {
            throw { error: 'Runtime Error', stderr: run.stderr };
        }

        return run.stdout;
    } finally {
        if (fs.existsSync(filepath)) {
            try { fs.unlinkSync(filepath); } catch (_) { /* best-effort cleanup */ }
        }
        try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch (_) { /* best-effort cleanup */ }
    }
};
