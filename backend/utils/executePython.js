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

const IMAGE = process.env.OJ_PYTHON_IMAGE || 'oj-python-runtime:latest';

export const executePython = async (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const jobDir = path.join(outputPath, jobId);

    // World-writable: the container runs as a non-root user (uid 1000) that
    // does not own this host directory, so it needs write permission to
    // produce any output at all. Verified this is required — without it,
    // even the container's own bind-mounted volume is not writable by the
    // sandboxed user, despite belonging to it inside the container.
    fs.mkdirSync(jobDir, { recursive: true, mode: 0o777 });
    fs.chmodSync(jobDir, 0o777);

    try {
        fs.copyFileSync(filepath, path.join(jobDir, 'main.py'));
        if (input) fs.writeFileSync(path.join(jobDir, 'input.txt'), input);

        const cmd = input ? ['sh', '-c', 'python3 main.py < input.txt'] : ['python3', 'main.py'];
        const run = await runInSandbox({
            image: IMAGE,
            cmd,
            hostDir: jobDir,
            timeoutMs: 8000,
            memoryMb: 128,
            cpus: 0.5,
        });

        if (run.timedOut) {
            throw { error: 'Time Limit Exceeded', stderr: run.stderr };
        }
        if (run.exitCode !== 0) {
            // No separate compile step in Python: a SyntaxError/IndentationError
            // means the interpreter never ran any user code, which is the
            // closest Python equivalent to a Compilation Error in the other
            // languages; anything else that failed during actual execution
            // (or was OOM-killed) is a genuine Runtime Error.
            if (run.stderr && /SyntaxError|IndentationError|TabError/.test(run.stderr)) {
                throw { error: 'Compilation Error', stderr: run.stderr };
            }
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
