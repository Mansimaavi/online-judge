import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProblemByNumber, runCode, submitCode } from "../../api";
import Editor from "@monaco-editor/react";

const languageOptions = [
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
];

const defaultCodeByLanguage = {
  cpp: `#include <iostream>\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}`,
  c: `#include <stdio.h>\nint main() {\n  printf("Hello World!");\n  return 0;\n}`,
};

const getDefaultCode = (problem, language) => {
  if (problem && problem.defaultCode && problem.defaultCode[language]) {
    return problem.defaultCode[language];
  }
  return defaultCodeByLanguage[language];
};

// Full Screen Code Editor Modal Component
const FullScreenEditor = ({ isOpen, onClose, code, setCode, language, problem, onRun, onSubmit, loading, output, submissionResult }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-2xl w-full h-full max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-indigo-300">Full Screen Editor</h2>
            <span className="text-sm text-gray-400">- {problem?.title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-slate-800 rounded-lg transition"
          >
            ×
          </button>
        </div>

        {/* Editor and Controls */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setCode(getDefaultCode(problem, e.target.value))}
                className="bg-slate-700 text-white rounded px-3 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onRun}
                disabled={loading}
                className={`px-4 py-2 rounded font-bold transition text-sm ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {loading ? "Running..." : "Run"}
              </button>
              <button
                onClick={onSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded font-bold transition text-sm ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: true },
                  fontSize: 16,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  glyphMargin: false,
                  contextmenu: true,
                  mouseWheelZoom: true,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  selectOnLineNumbers: true,
                  renderLineHighlight: "all",
                  theme: "vs-dark",
                  padding: { top: 10, bottom: 10 },
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible'
                  }
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="w-1/3 bg-slate-800 border-l border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-indigo-300">Output</h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {output && (
                  <pre className="text-gray-200 font-mono whitespace-pre-wrap text-sm bg-slate-900 p-3 rounded border border-slate-700">
                    {output}
                  </pre>
                )}
                
                {submissionResult && (
                  <div className={`mt-4 p-3 rounded border ${
                    submissionResult.result === 'Accepted' 
                      ? 'bg-green-900/20 border-green-500' 
                      : 'bg-red-900/20 border-red-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-lg ${
                        submissionResult.result === 'Accepted' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submissionResult.result === 'Accepted' ? '✅' : '❌'}
                      </span>
                      <h3 className={`text-lg font-bold ${
                        submissionResult.result === 'Accepted' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submissionResult.result}
                      </h3>
                    </div>
                    <div className="text-gray-200 space-y-1 text-sm">
                      <p>📊 {submissionResult.passedTests}/{submissionResult.totalTests} test cases passed</p>
                      <p>⏱️ Execution Time: {submissionResult.executionTime}ms</p>
                      {submissionResult.message && <p>💬 {submissionResult.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProblemView = ({ user }) => {
  const { problemNumber } = useParams();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(defaultCodeByLanguage.cpp);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showAllTestCases, setShowAllTestCases] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    constraints: false,
    sample: false,
    testCases: false
  });

  useEffect(() => {
    const loadProblem = async () => {
      const data = await fetchProblemByNumber(problemNumber);
      if (data.error) {
        setError(data.error);
      } else {
        setProblem(data);
        setCode(getDefaultCode(data, language));
      }
    };
    loadProblem();
    // eslint-disable-next-line
  }, [problemNumber]);

  useEffect(() => {
    setCode(getDefaultCode(problem, language));
    setOutput("");
    setSubmissionResult(null);
    // eslint-disable-next-line
  }, [language]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRun = async () => {
    setOutput("⏳ Running your code against test cases...");
    setLoading(true);
    const response = await runCode({ language, code, problemNumber });
    setLoading(false);
    
    if (response.error) {
      setOutput(`❌ Error: ${response.error}`);
      setSubmissionResult(null);
    } else {
      // Handle the new response format with test case validation
      const {
        result,
        executionTime,
        passedTests,
        totalTests,
        message,
        testResults,
        output
      } = response;
      
      setSubmissionResult({
        result,
        passedTests,
        totalTests,
        executionTime,
        message,
        testResults
      });

      if (result === 'Accepted') {
        setOutput(`✅ ${result}\n${passedTests}/${totalTests} test cases passed\n⏱️ Execution Time: ${executionTime}ms\n${message || ""}`);
      } else if (result === 'Error') {
        setOutput(`❌ ${result}\n${message}\n${response.error || ""}`);
      } else {
        setOutput(`❌ ${result}\n${passedTests}/${totalTests} test cases passed\n⏱️ Execution Time: ${executionTime}ms\n${message || ""}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("🔒 Please log in to submit your solution.");
      return;
    }

    setOutput("📤 Submitting your code...");
    setLoading(true);
    const response = await submitCode({ language, code, problemNumber });

    setLoading(false);

    if (response.error) {
      setOutput(`❌ Submission Failed: ${response.error}`);
      setSubmissionResult(null);
    } else {
      const {
        result,
        executionTime,
        passedTests,
        totalTests,
        message,
        testResults,
        failedTestCases
      } = response;
      
      setSubmissionResult({
        result,
        passedTests,
        totalTests,
        executionTime,
        message,
        testResults,
        failedTestCases
      });

      if (result === 'Accepted') {
        setOutput(`✅ ${result}\n${passedTests}/${totalTests} test cases passed\n⏱️ Execution Time: ${executionTime}ms\n${message || ""}`);
      } else if (result === 'Error') {
        setOutput(`❌ ${result}\n${message}\n${response.error || ""}`);
      } else {
        setOutput(`❌ ${result}\n${passedTests}/${totalTests} test cases passed\n⏱️ Execution Time: ${executionTime}ms\n${message || ""}`);
      }
    }
  };

  const displayedTestCases = showAllTestCases 
    ? problem?.testCases 
    : problem?.testCases?.slice(0, 2);

  if (error)
    return (
      <div className="text-red-500 text-center mt-8 font-semibold text-lg">
        {error}
      </div>
    );

  if (!problem)
    return (
      <div className="text-center py-8 text-gray-400 font-medium">Loading...</div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-400">
              {problem.title}
            </h1>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              problem.difficulty === 'Easy' ? 'bg-green-600 text-green-100' :
              problem.difficulty === 'Medium' ? 'bg-yellow-600 text-yellow-100' :
              'bg-red-600 text-red-100'
            }`}>
              {problem.difficulty}
            </span>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Full Screen
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Description and Constraints */}
          <div className="space-y-4">
            {/* Description */}
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
              <button
                onClick={() => toggleSection('description')}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800 transition"
              >
                <h2 className="text-lg font-bold text-indigo-300">Description</h2>
                <span className="text-indigo-400">{expandedSections.description ? '−' : '+'}</span>
              </button>
              {expandedSections.description && (
                <div className="px-4 pb-4">
                  <p className="text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                    {problem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Constraints */}
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
              <button
                onClick={() => toggleSection('constraints')}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800 transition"
              >
                <h2 className="text-lg font-bold text-indigo-300">Constraints</h2>
                <span className="text-indigo-400">{expandedSections.constraints ? '−' : '+'}</span>
              </button>
              {expandedSections.constraints && (
                <div className="px-4 pb-4">
                  <ul className="space-y-1">
                    {problem.constraints?.map((constraint, idx) => (
                      <li key={idx} className="text-gray-200 text-sm">
                        • {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sample Input/Output */}
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
              <button
                onClick={() => toggleSection('sample')}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800 transition"
              >
                <h2 className="text-lg font-bold text-indigo-300">Sample</h2>
                <span className="text-indigo-400">{expandedSections.sample ? '−' : '+'}</span>
              </button>
              {expandedSections.sample && (
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-indigo-200 text-sm">Input:</span>
                      <p className="text-gray-300 mt-1 text-sm font-mono">{JSON.stringify(problem.sampleInput)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-200 text-sm">Output:</span>
                      <p className="text-gray-300 mt-1 text-sm font-mono">{JSON.stringify(problem.sampleOutput)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

                          {/* Right Column - Code Editor, Test Cases, and Submit */}
        <div className="space-y-4">
          {/* Code Editor - Language Buttons on Top */}
          <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex gap-2">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      language === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsFullScreen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-bold transition text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Full
              </button>
            </div>
            <div className="p-4">
              <div className="border border-indigo-700 rounded-lg overflow-hidden shadow-inner">
                <Editor
                  height="350px"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    contextmenu: true,
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    selectOnLineNumbers: true,
                    renderLineHighlight: "all",
                    theme: "vs-dark",
                    padding: { top: 8, bottom: 8 },
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible'
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRun}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-bold transition text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {loading ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-bold transition text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 text-white"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <div className={`p-3 rounded-lg border ${
              submissionResult.result === 'Accepted' 
                ? 'bg-green-900/20 border-green-500' 
                : 'bg-red-900/20 border-red-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${
                  submissionResult.result === 'Accepted' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {submissionResult.result === 'Accepted' ? '✅' : '❌'}
                </span>
                <h3 className={`text-lg font-bold ${
                  submissionResult.result === 'Accepted' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {submissionResult.result}
                </h3>
              </div>
              <div className="text-gray-200 space-y-1 text-sm">
                <p>📊 {submissionResult.passedTests}/{submissionResult.totalTests} test cases passed</p>
                <p>⏱️ Execution Time: {submissionResult.executionTime}ms</p>
                {submissionResult.message && <p>💬 {submissionResult.message}</p>}
              </div>
            </div>
          )}

          {/* Test Cases - Positioned Below Code */}
          <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
            <button
              onClick={() => toggleSection('testCases')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-indigo-300">Test Cases</h2>
                {problem.testCases?.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTestCases(!showAllTestCases);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                  >
                    {showAllTestCases ? 'Show Less' : `Show All (${problem.testCases.length})`}
                  </button>
                )}
              </div>
              <span className="text-indigo-400">{expandedSections.testCases ? '−' : '+'}</span>
            </button>
            {expandedSections.testCases && (
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  {displayedTestCases?.map((tc, idx) => {
                    const testResult = submissionResult?.testResults?.find(result => result.testCaseIndex === idx + 1);
                    const isPassed = testResult?.passed;
                    const hasError = testResult?.error;
                    
                    return (
                      <div key={idx} className={`border rounded p-3 shadow-sm ${
                        submissionResult 
                          ? isPassed 
                            ? 'bg-green-900/20 border-green-500' 
                            : 'bg-red-900/20 border-red-500'
                          : 'bg-slate-800 border-indigo-900'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-indigo-400 font-semibold text-sm">Test Case {idx + 1}</span>
                          {submissionResult && (
                            <span className={`text-xs px-2 py-1 rounded font-bold ${
                              isPassed 
                                ? 'bg-green-600 text-green-100' 
                                : 'bg-red-600 text-red-100'
                            }`}>
                              {isPassed ? 'PASS' : hasError ? 'ERROR' : 'FAIL'}
                            </span>
                          )}
                          {testResult?.executionTime && (
                            <span className="text-xs text-gray-400">
                              ⏱️ {testResult.executionTime}ms
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="font-semibold text-indigo-200">Input:</span>
                            <pre className="text-gray-300 mt-1 font-mono whitespace-pre-wrap">{tc.input}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-indigo-200">Expected:</span>
                            <pre className="text-gray-300 mt-1 font-mono whitespace-pre-wrap">{tc.output}</pre>
                          </div>
                          
                          {submissionResult && !isPassed && (
                            <div>
                              <span className="font-semibold text-red-200">Your Output:</span>
                              {hasError ? (
                                <p className="text-red-300 mt-1 font-mono">{testResult.error}</p>
                              ) : (
                                <p className="text-red-300 mt-1 font-mono">{testResult.actualOutput}</p>
                              )}
                            </div>
                          )}
                          
                          {submissionResult && isPassed && (
                            <div>
                              <span className="font-semibold text-green-200">Your Output:</span>
                              <p className="text-green-300 mt-1 font-mono">{testResult.actualOutput}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

            {/* Output */}
            {output && (
              <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800">
                <h3 className="text-lg font-semibold p-4 text-indigo-300 border-b border-slate-800">Output</h3>
                <pre className="p-4 text-gray-200 font-mono whitespace-pre-wrap text-sm">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Editor Modal */}
      <FullScreenEditor
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        code={code}
        setCode={setCode}
        language={language}
        problem={problem}
        onRun={handleRun}
        onSubmit={handleSubmit}
        loading={loading}
        output={output}
        submissionResult={submissionResult}
      />
    </>
  );
};

export default ProblemView;
