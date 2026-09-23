import { executeCpp } from "./executeCpp.js";
import { executeJava } from "./executeJava.js";
import { executeC } from "./executeC.js";
import { executePython } from "./executePython.js";

export const executeCode = (language, filepath, input = "") => {
    switch (language.toLowerCase()) {
        case 'cpp':
            return executeCpp(filepath, input);
        case 'java':
            return executeJava(filepath, input);
        case 'c':
            return executeC(filepath, input);
        case 'python':
            return executePython(filepath, input);
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
}; 