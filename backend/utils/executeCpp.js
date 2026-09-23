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

// Removes the generated source file, compiled binary, and input file for a
// job. Every submission leaves temp files on disk otherwise, which is a
// resource/privacy leak on a long-running server.
function cleanup(...paths) {
    for (const p of paths) {
        if (p && fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (_) { /* best-effort cleanup */ }
        }
    }
}

export const executeCpp = (filepath, input = "") => {  /// the input is taken from the code folder // this has come from generate file--> /oj/code/132563.cpp
    const jobId = path.basename(filepath).split(".")[0];  // job id 132563
    const outPath = path.join(outputPath, `${jobId}.exe`);  // /oj/outputs/132563.exe
    const inputPath = path.join(outputPath, `${jobId}_input.txt`); // /oj/outputs/132563_input.txt

    return new Promise((resolve, reject) => {
        try {
            // Write input to temporary file
            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const command = process.platform === "win32"
                ? `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId}.exe < ${jobId}_input.txt` : `./${jobId}.exe`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {  // using child process execute the terminal command within 10 secs 
                cleanup(filepath, outPath, inputPath);

                if (error) {
                    // Check if it's a compilation error
                    if (error.message.includes('g++')) {
                        return reject({ error: 'Compilation Error', stderr });
                    }
                    return reject({ error: 'Runtime Error', stderr });
                }
                // A non-zero exit (captured above as `error`) is the correct
                // signal for compile/runtime failure. Non-fatal compiler warnings
                // (e.g. gcc/g++ implicit-declaration or unused-variable warnings)
                // are written to stderr even on a successful, zero-exit compile —
                // treating any stderr output as a failure was wrongly rejecting
                // otherwise-correct submissions.
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, outPath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};
