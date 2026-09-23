// Explicit allow-list and size bound for anything that reaches the
// execution pipeline. Language and code are user-controlled input; without
// this, an unrecognized language falls through to executeCode.js's default
// case (which does throw, but only after generateFile.js has already
// written an arbitrary-extension file to disk), and there was previously
// no limit at all on submitted source size.
const ALLOWED_LANGUAGES = ['cpp', 'java', 'c', 'python'];
const MAX_SOURCE_BYTES = 64 * 1024; // 64KB - generous for a judge solution, small enough to block abuse

export function validateSubmissionInput(language, code) {
    if (typeof language !== 'string' || !ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
        return { valid: false, message: `Unsupported language: ${language}` };
    }
    if (typeof code !== 'string' || code.length === 0) {
        return { valid: false, message: 'Code is required' };
    }
    if (Buffer.byteLength(code, 'utf8') > MAX_SOURCE_BYTES) {
        return { valid: false, message: `Code exceeds the ${MAX_SOURCE_BYTES / 1024}KB size limit` };
    }
    return { valid: true };
}
