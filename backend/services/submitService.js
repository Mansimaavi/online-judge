import Problem from '../models/problem.js';
import { generateFile } from "../utils/generateFile.js";
import { executeCode } from "../utils/executeCode.js";

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
  const problem = await Problem.findOne({ problemNumber });
  if (!problem) {
    throw new Error('Problem not found');
  }

  const testCases = problem.testCases; // get the total testcases for this problem from DB 
  const results = [];  // no results yet 
  let passedTests = 0;  // no testcases passed yet 
  let totalExecutionTime = 0; // no exectime yet 

  // Validate each test case individually
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
      
      const testResult = {
        testCaseIndex: i + 1, // 0 based index 
        input: input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        passed: isCorrect,
        executionTime: executionTime
      };
      
      results.push(testResult);
      
      if (isCorrect) {
        passedTests++;
      }
      
    } catch (error) {
      // Handle compilation or runtime errors
      const testResult = {
        testCaseIndex: i + 1,
        input: input,
        expectedOutput: expectedOutput,
        actualOutput: null,
        passed: false,
        error: error.error || error.message || 'Runtime error',
        executionTime: 0
      };
      
      results.push(testResult);
    }
  }

  const allPassed = passedTests === testCases.length;
  
  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    passedTests: passedTests,
    totalTests: testCases.length,
    executionTime: totalExecutionTime,
    testResults: results,
    message: allPassed 
      ? 'All test cases passed successfully!' 
      : `${passedTests}/${testCases.length} test cases passed. Check the failed test cases for details.`
  };
}

export default { validateSubmission };  // exports this function this function has runcodewithinputs and integrateboilerplateandusercode
