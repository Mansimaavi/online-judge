import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// Properly get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to store all generated code files
const dirCodes = path.join(__dirname, '..', 'codes');  // /oj/codes 

// Create the directory if it doesn't exist
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Utility responsible for creating unique temporary source-code files on disk.
 *
 * @param {string} language - The language/extension of the code file (e.g., 'cpp')
 * @param {string} content - The source code text
 * @returns {string} - The full file path of the newly created code file
 */
export const generateFile = (language, content) => {
    const jobID = uuid(); // generate unique filename

    if (language === 'java') {
        // javac requires the source file name to match the public class name.
        // Every problem's Java boilerplate declares `public class Main`, which
        // is incompatible with a UUID-named .java file. Instead, isolate each
        // submission in its own UUID-named directory containing Main.java —
        // still UUID-scoped per submission, just at the directory level.
        const jobDir = path.join(dirCodes, jobID);
        fs.mkdirSync(jobDir, { recursive: true });
        const filePath = path.join(jobDir, 'Main.java');
        fs.writeFileSync(filePath, content);
        return filePath;
    }

    // Map language to proper file extension
    const extensionMap = {
        'cpp': 'cpp',
        'c': 'c'
    };

    const extension = extensionMap[language] || language;
    const filename = `${jobID}.${extension}`;
    const filePath = path.join(dirCodes, filename);  //oj/codes/32145.cpp
    fs.writeFileSync(filePath, content); // write the code into the file
    return filePath;
};
