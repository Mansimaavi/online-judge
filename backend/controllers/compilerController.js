// controllers/compilerController.js
import Problem from '../models/problem.js';
import { generateFile } from '../utils/generateFile.js';
import { executeCode } from '../utils/executeCode.js';

// Function to integrate user code with boilerplate
function integrateUserCodeWithBoilerplate(userCode, boilerplate, language) {
  if (!boilerplate) {
    return userCode; // Fallback to original code if no boilerplate
  }
  
  // Replace the placeholder with user's code
  return boilerplate.replace('{{USER_CODE}}', userCode);
}

// Function to run user code directly (for testing/debugging)
export const runCode = async (req, res) => {
  const { code, language = 'cpp', input = '', problemNumber } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Log the received problemNumber for debugging
  console.log('runCode called with problemNumber:', problemNumber);

  try {
    // If problemNumber is provided, validate against all test cases
    if (problemNumber) {
      const submitService = (await import('../services/submitService.js')).default;
      const result = await submitService.validateSubmission(problemNumber, code, language);
      
      return res.status(200).json({
        result: result.status,
        message: result.message,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.executionTime,
        testResults: result.testResults,
        output: result.status === 'Accepted' ? 'All test cases passed!' : 'Some test cases failed'
      });
    } else {
      // If no problemNumber, return an error (enforce test case validation)
      return res.status(400).json({ error: 'Problem number is required to run code against test cases.' });
    }
  } catch (err) {
    return res.status(500).json({ 
      error: err.stderr || err.error || 'Code execution failed',
      details: err.message 
    });
  }
};

// Function to test boilerplate compilation (for admin/testing)
export const compileBoilerplate = async (req, res) => {
  const { id } = req.params;
  const { input = '', language = 'cpp' } = req.body;

  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const boilerplate = problem.boilerplate?.[language];
    if (!boilerplate) {
      return res.status(400).json({ success: false, error: `No boilerplate found for language: ${language}` });
    }

    const filepath = generateFile(language, boilerplate);
    const output = await executeCode(language, filepath, input);

    return res.status(200).json({ success: true, output });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      error: err.stderr || err.error || 'Boilerplate compilation failed',
      details: err.message 
    });
  }
};
