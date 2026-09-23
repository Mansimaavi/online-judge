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

const IMAGE = process.env.OJ_CPP_IMAGE || 'oj-cpp-runtime:latest';

export const executeCpp = async (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const jobDir = path.join(outputPath, jobId);

    // World-writable: the container runs as a non-root user that does not
    // own this host directory, so it needs write permission to produce a
    // compiled binary at all (verified this is required, not optional).
    fs.mkdirSync(jobDir, { recursive: true, mode: 0o777 });
    fs.chmodSync(jobDir, 0o777);

    try {
        fs.copyFileSync(filepath, path.join(jobDir, 'main.cpp'));
        if (input) fs.writeFileSync(path.join(jobDir, 'input.txt'), input);

        // Compile step, isolated with its own resource limits — compiling
        // untrusted C++ (template metaprogramming, huge translation units)
        // is itself a resource-abuse vector, separate from running it.
        const compile = await runInSandbox({
            image: IMAGE,
            cmd: ['g++', 'main.cpp', '-O2', '-o', 'a.out'],
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

        // Run step — tighter limits than compilation, this is the untrusted
        // program actually executing.
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
