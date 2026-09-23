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
    // filepath is .../codes/<jobId>/Main.java (see generateFile.js). The
    // job id is the UUID-named parent directory, not the file's own base
    // name (which is always "Main" since that's the required public class).
    const jobId = path.basename(path.dirname(filepath));

    // Compile+run in a job-specific output directory so concurrent
    // submissions never collide on the same Main.class file.
    const jobOutputDir = path.join(outputPath, jobId);
    const inputPath = path.join(jobOutputDir, `input.txt`);

    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(jobOutputDir, { recursive: true });

            if (input) {
                fs.writeFileSync(inputPath, input);
            }

            const runCmd = input ? `java -cp "${jobOutputDir}" Main < "${inputPath}"` : `java -cp "${jobOutputDir}" Main`;
            const command = `javac "${filepath}" -d "${jobOutputDir}" && ${runCmd}`;

            const sourceDir = path.dirname(filepath); // codes/<jobId>/

            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                fs.rm(jobOutputDir, { recursive: true, force: true }, () => {});
                fs.rm(sourceDir, { recursive: true, force: true }, () => {});

                if (error) {
                    if (error.message.includes('javac')) {
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
            fs.rm(jobOutputDir, { recursive: true, force: true }, () => {});
            fs.rm(path.dirname(filepath), { recursive: true, force: true }, () => {});
            reject({ error: 'File operation error', stderr: err.message });
        }
    });
};
