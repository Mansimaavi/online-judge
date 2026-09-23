import { executeCpp } from "./executeCpp.js";
import { executeJava } from "./executeJava.js";
import { executeC } from "./executeC.js";
import { executePython } from "./executePython.js";
import { executeCppHost, executeJavaHost, executeCHost, executePythonHost } from "./hostFallbackExecutor.js";

// Defaults to the real Docker sandbox (dockerSandbox.js via executeCpp.js
// etc.) in every case. The unsandboxed host fallback only runs when
// EXECUTION_BACKEND is explicitly set to 'host' — see
// hostFallbackExecutor.js's module header for why this exists and why it
// must never be the default.
const USE_HOST_FALLBACK = process.env.EXECUTION_BACKEND === 'host';

export const executeCode = (language, filepath, input = "") => {
    switch (language.toLowerCase()) {
        case 'cpp':
            return USE_HOST_FALLBACK ? executeCppHost(filepath, input) : executeCpp(filepath, input);
        case 'java':
            return USE_HOST_FALLBACK ? executeJavaHost(filepath, input) : executeJava(filepath, input);
        case 'c':
            return USE_HOST_FALLBACK ? executeCHost(filepath, input) : executeC(filepath, input);
        case 'python':
            return USE_HOST_FALLBACK ? executePythonHost(filepath, input) : executePython(filepath, input);
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
}; 