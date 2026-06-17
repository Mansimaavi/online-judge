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

export const executeC = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            // Write input to temporary file
            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const command = process.platform === "win32"
                ? `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `gcc "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId} < ${jobId}_input.txt` : `./${jobId}`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                // Clean up input file
                if (input && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }

                if (error) {
                    // Check if it's a compilation error
                    if (error.message.includes('gcc')) {
                        return reject({ error: 'Compilation Error', stderr });
                    }
                    return reject({ error: 'Runtime Error', stderr });
                }
                if (stderr) return reject({ stderr });
                return resolve(stdout);
            });
        } catch (err) {
            // Clean up input file on error
            if (input && fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
}; 