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

export const executeJava = (filepath, input = "") => {
    const jobId = path.basename(filepath).split(".")[0];
    const classPath = path.join(outputPath, jobId);
    const inputPath = path.join(outputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        try {
            // Write input to temporary file
            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const command = process.platform === "win32"
                ? `javac "${filepath}" -d "${outputPath}" && cd "${outputPath}" && ${input ? `java ${jobId} < ${jobId}_input.txt` : `java ${jobId}`}`
                : `javac "${filepath}" -d "${outputPath}" && cd "${outputPath}" && ${input ? `java ${jobId} < ${jobId}_input.txt` : `java ${jobId}`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                // Clean up input file
                if (input && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }

                if (error) {
                    // Check if it's a compilation error
                    if (error.message.includes('javac')) {
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