import { execFile } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

/**
 * Low-level Docker container sandbox runner.
 *
 * Every submission runs in its own short-lived, disposable container with:
 *   - no network access (--network none)
 *   - hard memory and CPU limits (with swap disabled, so a memory limit
 *     can't be bypassed by swapping)
 *   - a process-count limit (blocks fork-bomb style abuse)
 *   - a read-only root filesystem — the only writable path is the one
 *     job-specific host directory we bind-mount in, plus a small tmpfs
 *     for /tmp (some runtimes, notably the JVM, need scratch space there)
 *   - no new privileges and all Linux capabilities dropped
 *   - a hard wall-clock timeout enforced from OUTSIDE the container
 *
 * IMPORTANT (learned by testing this against a real local image, not
 * assumed): `docker run -i` in the foreground, wrapped in a client-side
 * `timeout`, is NOT a reliable way to enforce a time limit — killing the
 * `docker run` CLI process does not necessarily stop the container on the
 * daemon side, so a submission stuck in an infinite loop could keep running
 * server-side indefinitely even after the request "timed out". This runner
 * instead starts the container detached (`docker run -d`), polls its state,
 * and explicitly `docker kill`s + `docker rm -f`s it if the deadline is
 * exceeded — verified to reliably enforce the timeout and leave no
 * containers behind.
 */

function generateContainerName() {
    return `oj-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * @param {object} opts
 * @param {string} opts.image - Docker image to run.
 * @param {string[]} opts.cmd - Command + args to run inside the container
 *   (no shell involved unless the image's own entrypoint uses one).
 * @param {string} opts.hostDir - Host directory bind-mounted read-write
 *   into the container at /sandbox. Must already contain anything the
 *   command needs (source file, input file) and is where compiled
 *   output/artifacts should be written.
 * @param {number} [opts.timeoutMs=10000] - Wall-clock limit before the
 *   container is force-killed.
 * @param {number} [opts.memoryMb=256] - Hard memory limit (swap disabled).
 * @param {number} [opts.cpus=1] - CPU share limit.
 * @param {number} [opts.pidsLimit=64] - Max processes/threads inside the
 *   container (fork-bomb protection).
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number|null, timedOut: boolean}>}
 */
export async function runInSandbox({
    image,
    cmd,
    hostDir,
    timeoutMs = 10000,
    memoryMb = 256,
    cpus = 1,
    pidsLimit = 64,
}) {
    const name = generateContainerName();

    const runArgs = [
        'run', '-d', '--name', name,
        '--network', 'none',
        '--memory', `${memoryMb}m`,
        '--memory-swap', `${memoryMb}m`, // disables swap (limit == memory limit)
        '--cpus', String(cpus),
        '--pids-limit', String(pidsLimit),
        '--read-only',
        '--tmpfs', '/tmp:rw,size=64m',
        '--security-opt', 'no-new-privileges',
        '--cap-drop', 'ALL',
        '-v', `${hostDir}:/sandbox:rw`,
        '-w', '/sandbox',
        image,
        ...cmd,
    ];

    try {
        await execFileAsync('docker', runArgs, { timeout: 15000 });
    } catch (err) {
        // The container object can exist even if the process inside it
        // failed to start (e.g. a bad image) — clean it up defensively
        // rather than leaking it, since we have its name regardless.
        try { await execFileAsync('docker', ['rm', '-f', name]); } catch (_) { /* best effort */ }
        throw { error: 'System Error', stderr: `Failed to start sandbox container: ${err.message}` };
    }

    const deadline = Date.now() + timeoutMs;
    let timedOut = false;

    // Poll container state instead of trusting a client-side timeout — see
    // the note above on why an attached/foreground approach isn't reliable.
    while (Date.now() < deadline) {
        let running = false;
        try {
            const { stdout } = await execFileAsync('docker', ['inspect', '-f', '{{.State.Running}}', name]);
            running = stdout.trim() === 'true';
        } catch (_) {
            break; // container already gone
        }
        if (!running) break;
        await new Promise(r => setTimeout(r, 100));
    }

    // Still running past the deadline -> hard-kill it.
    let stillRunning = false;
    try {
        const { stdout } = await execFileAsync('docker', ['inspect', '-f', '{{.State.Running}}', name]);
        stillRunning = stdout.trim() === 'true';
    } catch (_) { /* already gone */ }

    if (stillRunning) {
        timedOut = true;
        try { await execFileAsync('docker', ['kill', name]); } catch (_) { /* best effort */ }
    }

    let stdout = '', stderr = '', exitCode = null;
    try {
        const logs = await execFileAsync('docker', ['logs', name]);
        stdout = logs.stdout;
        stderr = logs.stderr;
    } catch (_) { /* container may have produced no logs */ }

    try {
        const { stdout: exitOut } = await execFileAsync('docker', ['inspect', '-f', '{{.State.ExitCode}}', name]);
        exitCode = parseInt(exitOut.trim(), 10);
    } catch (_) { /* ignore */ }

    // Always remove the container — never rely on --rm alone, since we may
    // have force-killed it out from under a graceful exit.
    try { await execFileAsync('docker', ['rm', '-f', name]); } catch (_) { /* best effort */ }

    return { stdout, stderr, exitCode, timedOut };
}
