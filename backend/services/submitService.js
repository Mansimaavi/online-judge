import Problem from '../models/problem.js';
import { generateFile } from "../utils/generateFile.js";
import { executeCode } from "../utils/executeCode.js";
import { validateSubmissionInput } from "../utils/validateSubmissionInput.js";

// Function to integrate user code with boilerplate
function integrateUserCodeWithBoilerplate(userCode, boilerplate, language) {
  if (!boilerplate) {
    return userCode; // Fallback to original code if no boilerplate
  }
  
  // Replace the placeholder with user's code
  return boilerplate.replace('{{USER_CODE}}', userCode);
}

async function runCodeOnInput(language, code, input, problem) {  // this is called and run against each input 
  // Get the boilerplate for this problem and language
  const boilerplate = problem.boilerplate?.get(language);
  
  // Integrate user code with boilerplate
  const completeCode = integrateUserCodeWithBoilerplate(code, boilerplate, language); //this is where integrateusrcode is called in runcode 
  
  const filepath = generateFile(language, completeCode); // put this code in some /oj/codes/52774.cpp
  
  const startTime = Date.now();
  const output = await executeCode(language, filepath, input); // this is also an async 
  const executionTime = Date.now() - startTime;
  
  return {
    output: output.trim(),
    executionTime
  };
}

async function validateSubmission(problemNumber, code, language = 'cpp') {  // async what the user had written on frontend as code 
  const inputCheck = validateSubmissionInput(language, code);
  if (!inputCheck.valid) {
    throw { error: 'System Error', message: inputCheck.message };
  }

  const problem = await Problem.findOne({ problemNumber });
  if (!problem) {
    throw new Error('Problem not found');
  }

  const testCases = problem.testCases; // get the total testcases for this problem from DB 
  const results = [];  // no results yet 
  let totalExecutionTime = 0; // no exectime yet 

  // Overall status defaults to Accepted and is only downgraded when a test
  // case actually fails. Priority/first-failure order matches standard
  // judge behavior: stop at the first failing test case rather than running
  // all 5 regardless, both because a compile failure is deterministic
  // (identical code will fail identically on every remaining test, so
  // there's no reason to recompile it 4 more times) and because reporting
  // "failed on test N" is the conventional judge UX.
  let status = 'Accepted';
  let message = 'All test cases passed successfully!';

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const input = testCase.input;
    const expectedOutput = testCase.output;

    try {
      const { output: actualOutput, executionTime } = await runCodeOnInput(language, code, input, problem); // await the runcodeonthistestcase if equal 
      totalExecutionTime += executionTime; 

      // Compare outputs (normalize whitespace)
      const normalizedActual = actualOutput.replace(/\s+/g, ' ').trim();
      const normalizedExpected = expectedOutput.replace(/\s+/g, ' ').trim();
      const isCorrect = normalizedActual === normalizedExpected;

      results.push({
        testCaseIndex: i + 1,
        input,
        expectedOutput,
        actualOutput,
        passed: isCorrect,
        executionTime,
      });

      if (!isCorrect) {
        status = 'Wrong Answer';
        message = `Wrong Answer on test case ${i + 1}. ${i}/${testCases.length} test cases passed.`;
        break;
      }
    } catch (error) {
      // error.error is set by the execution layer to one of: Compilation
      // Error, Runtime Error, Time Limit Exceeded, System Error.
      const errorType = error.error || 'Runtime Error';

      results.push({
        testCaseIndex: i + 1,
        input,
        expectedOutput,
        actualOutput: null,
        passed: false,
        error: error.stderr || error.message || errorType,
        executionTime: 0,
      });

      status = errorType;
      message = errorType === 'Compilation Error'
        ? `Compilation Error: ${error.stderr || 'code failed to compile'}`
        : `${errorType} on test case ${i + 1}. ${i}/${testCases.length} test cases passed.`;
      break;
    }
  }

  const passedTests = results.filter(r => r.passed).length;

  return {
    status,
    passedTests,
    totalTests: testCases.length,
    executionTime: totalExecutionTime,
    testResults: results,
    message,
  };
}

export default { validateSubmission };  // exports this function this function has runcodewithinputs and integrateboilerplateandusercode
