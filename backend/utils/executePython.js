import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to store outputs
const outputPath = path.join(__dirname, '..', "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Removes the generated source file and input file for a job.
function cleanup(...paths) {
    for (const p of paths) {
        if (p && fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (_) { /* best-effort cleanup */ }
        }
    }
}

export const executePython = (filepath, input = "") => {
    // Python has no separate compile step — the interpreter parses and runs
    // in one pass, so there's no analog to g++/gcc/javac's compile phase.
    const jobId = path.basename(filepath).split(".")[0];
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const command = input
                ? `python3 "${filepath}" < "${inputPath}"`
                : `python3 "${filepath}"`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                cleanup(filepath, inputPath);

                if (error) {
                    // A SyntaxError/IndentationError means the interpreter never
                    // even started running the user's code — the closest Python
                    // equivalent to a Compilation Error in the other languages.
                    // Anything else that raised during actual execution (or was
                    // killed on timeout) is a genuine Runtime Error.
                    if (stderr && /SyntaxError|IndentationError|TabError/.test(stderr)) {
                        return reject({ error: 'Compilation Error', stderr });
                    }
                    return reject({ error: 'Runtime Error', stderr });
                }
                // A non-zero exit (handled above as `error`) is the correct
                // failure signal; stderr alone (e.g. a library printing a
                // warning) does not mean the run failed.
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};
