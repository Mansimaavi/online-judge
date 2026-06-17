import submitService from '../services/submitService.js';

async function submitSolution(req, res) {
  const { problemNumber, code, language } = req.body;

  if (!problemNumber || !code) {
    return res.status(400).json({ error: 'Problem number and code are required.' });
  }

  try {
    const result = await submitService.validateSubmission(problemNumber, code, language || 'cpp');

    if (result.status === 'Accepted') {
      return res.status(200).json({
        result: 'Accepted',
        message: result.message,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.executionTime,
        testResults: result.testResults
      });
    } else {
      return res.status(200).json({
        result: 'Wrong Answer',
        message: result.message,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.executionTime,
        testResults: result.testResults,
        failedTestCases: result.testResults.filter(test => !test.passed)
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      result: 'Error',
      message: 'Compilation or runtime error occurred'
    });
  }
}

export default { submitSolution }; // export this function
