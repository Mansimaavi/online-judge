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

            const command = process.platform === "win32"  // g++ /oj/codes/133563.cpp -o /oj/outputs/132563.exe && cd outputs 132563.exe<132563_input.txt
                ? `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `.\\${jobId}.exe < ${jobId}_input.txt` : `.\\${jobId}.exe`}`
                : `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && ${input ? `./${jobId} < ${jobId}_input.txt` : `./${jobId}`}`;

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {  // using child process execute the terminal command within 10 secs 
                // Clean up input file
                if (input && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }

                if (error) {
                    // Check if it's a compilation error
                    if (error.message.includes('g++')) {
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
