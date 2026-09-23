/**
 * ============================================================================
 * DEMO-ONLY FALLBACK — NOT THE PRODUCTION EXECUTION PATH
 * ============================================================================
 *
 * This module runs submitted code directly via child_process on the host,
 * the same way the project worked before Docker sandboxing was added. It
 * exists ONLY because some free hosting tiers (used for a live demo of this
 * project) don't expose a Docker daemon to the app, so the real sandbox in
 * dockerSandbox.js cannot run there at all.
 *
 * This path has NONE of the isolation the Docker sandbox provides:
 *   - no network isolation — submitted code can make outbound requests
 *   - no memory/CPU limits — a submission can exhaust host resources
 *   - no filesystem isolation — code runs with the same user/permissions
 *     as the Node process itself
 *   - only a wall-clock timeout (via child_process's own `timeout` option)
 *
 * It is used ONLY when explicitly opted into via the EXECUTION_BACKEND
 * environment variable, and utils/executeCode.js defaults to the real
 * Docker sandbox in every other case — see that file for the switch.
 * server.js also logs a prominent warning at boot if this fallback is
 * active, so it's never silently running in a context that assumes real
 * sandboxing (e.g. the actual EC2 production deployment this project is
 * meant for).
 *
 * Do not extend this file's use beyond the specific free-hosting demo it
 * was built for.
 * ============================================================================
 */
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

function cleanup(...paths) {
    for (const p of paths) {
        if (p && fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (_) { /* best-effort cleanup */ }
        }
    }
}

// A process killed by the exec `timeout` option reports error.killed with
// signal SIGTERM (on POSIX). Checked first so a timeout is reported as
// Time Limit Exceeded rather than falling through to a generic error type.
function isTimeoutKill(error) {
    return !!(error && (error.killed || error.signal === 'SIGTERM'));
}

export const executeCppHost = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            if (input) fs.writeFileSync(inputPath, input);

            const command = process.platform === "win32"
                ? `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId}.exe < ${jobId}_input.txt` : `./${jobId}.exe`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                cleanup(filepath, outPath, inputPath);
                if (error) {
                    if (isTimeoutKill(error)) return reject({ error: 'Time Limit Exceeded', stderr });
                    if (error.message.includes('g++')) return reject({ error: 'Compilation Error', stderr });
                    return reject({ error: 'Runtime Error', stderr });
                }
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, outPath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};

export const executeCHost = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            if (input) fs.writeFileSync(inputPath, input);

            const command = process.platform === "win32"
                ? `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId}.exe < ${jobId}_input.txt` : `./${jobId}.exe`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                cleanup(filepath, outPath, inputPath);
                if (error) {
                    if (isTimeoutKill(error)) return reject({ error: 'Time Limit Exceeded', stderr });
                    if (error.message.includes('gcc')) return reject({ error: 'Compilation Error', stderr });
                    return reject({ error: 'Runtime Error', stderr });
                }
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, outPath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};

export const executeJavaHost = (filepath, input = "") => {
    // filepath is .../codes/<jobId>/Main.java (see generateFile.js).
    const jobId = path.basename(path.dirname(filepath));
    const jobOutputDir = path.join(outputPath, jobId);
    const inputPath = path.join(jobOutputDir, `input.txt`);
    const sourceDir = path.dirname(filepath);

    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(jobOutputDir, { recursive: true });
            if (input) fs.writeFileSync(inputPath, input);

            const runCmd = input ? `java -cp "${jobOutputDir}" Main < "${inputPath}"` : `java -cp "${jobOutputDir}" Main`;
            const command = `javac "${filepath}" -d "${jobOutputDir}" && ${runCmd}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                fs.rm(jobOutputDir, { recursive: true, force: true }, () => {});
                fs.rm(sourceDir, { recursive: true, force: true }, () => {});
                if (error) {
                    if (isTimeoutKill(error)) return reject({ error: 'Time Limit Exceeded', stderr });
                    if (error.message.includes('javac')) return reject({ error: 'Compilation Error', stderr });
                    return reject({ error: 'Runtime Error', stderr });
                }
                return resolve(stdout);
            });
        } catch (err) {
            fs.rm(jobOutputDir, { recursive: true, force: true }, () => {});
            fs.rm(sourceDir, { recursive: true, force: true }, () => {});
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};

export const executePythonHost = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            if (input) fs.writeFileSync(inputPath, input);

            const command = input ? `python3 "${filepath}" < "${inputPath}"` : `python3 "${filepath}"`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                cleanup(filepath, inputPath);
                if (error) {
                    if (isTimeoutKill(error)) return reject({ error: 'Time Limit Exceeded', stderr });
                    if (stderr && /SyntaxError|IndentationError|TabError/.test(stderr)) {
                        return reject({ error: 'Compilation Error', stderr });
                    }
                    return reject({ error: 'Runtime Error', stderr });
                }
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};
