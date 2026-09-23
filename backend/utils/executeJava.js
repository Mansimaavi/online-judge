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

const IMAGE = process.env.OJ_JAVA_IMAGE || 'oj-java-runtime:latest';

export const executeJava = async (filepath, input = "") => {
    // filepath is .../codes/<jobId>/Main.java (see generateFile.js: javac
    // requires the source file name to match the public class name, so
    // each Java submission lives in its own UUID-named directory).
    const jobId = path.basename(path.dirname(filepath));
    const jobDir = path.join(outputPath, jobId);

    fs.mkdirSync(jobDir, { recursive: true, mode: 0o777 });
    fs.chmodSync(jobDir, 0o777);

    try {
        fs.copyFileSync(filepath, path.join(jobDir, 'Main.java'));
        if (input) fs.writeFileSync(path.join(jobDir, 'input.txt'), input);

        const compile = await runInSandbox({
            image: IMAGE,
            cmd: ['javac', 'Main.java'],
            hostDir: jobDir,
            timeoutMs: 15000, // JVM compiler startup is slower than gcc/g++
            memoryMb: 384,
            cpus: 1,
        });

        if (compile.timedOut) {
            throw { error: 'Compilation Error', stderr: 'Compilation timed out' };
        }
        if (compile.exitCode !== 0) {
            throw { error: 'Compilation Error', stderr: compile.stderr };
        }

        const cmd = input ? ['sh', '-c', 'java -cp . Main < input.txt'] : ['java', '-cp', '.', 'Main'];
        const run = await runInSandbox({
            image: IMAGE,
            cmd,
            hostDir: jobDir,
            timeoutMs: 8000, // JVM startup overhead needs more headroom than a native binary
            memoryMb: 256,
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
        // The source lives in its own directory (codes/<jobId>/) separate
        // from jobDir (outputs/<jobId>/) — clean up both.
        try { fs.rmSync(path.dirname(filepath), { recursive: true, force: true }); } catch (_) { /* best-effort cleanup */ }
        try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch (_) { /* best-effort cleanup */ }
    }
};
