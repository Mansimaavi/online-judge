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
// job. Every submission leaves temp files on disk otherwise.
function cleanup(...paths) {
    for (const p of paths) {
        if (p && fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (_) { /* best-effort cleanup */ }
        }
    }
}

export const executeC = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const command = process.platform === "win32"
                ? `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId}.exe < ${jobId}_input.txt` : `./${jobId}.exe`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                cleanup(filepath, outPath, inputPath);

                if (error) {
                    if (error.message.includes('gcc')) {
                        return reject({ error: 'Compilation Error', stderr });
                    }
                    return reject({ error: 'Runtime Error', stderr });
                }
                if (stderr) return reject({ stderr });
                return resolve(stdout);
            });
        } catch (err) {
            cleanup(filepath, outPath, inputPath);
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};
