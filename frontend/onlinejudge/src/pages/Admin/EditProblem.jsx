import React, { useState } from 'react';
import axios from 'axios';

const allowedCategories = [
  "Array", "String", "Math", "Basic Math", "Dynamic Programming", "Tree", "Graph",
  "Greedy", "Stack", "Queue", "Hash Table", "Heap",
  "Binary Search", "Binary Tree", "Binary Search Tree",
  "Binary Indexed Tree", "Segment Tree", "Trie",
  "Union Find", "Disjoint Set", "Recursion", "Hashing"
];

const EditProblem = ({ problem, onClose }) => {
  const [form, setForm] = useState({
    ...problem,
    constraints: problem.constraints.join('\n'),
    sampleOutput: problem.sampleOutput.join('\n'),
    tags: problem.tags.join(','),
    companiesAskedIn: problem.companiesAskedIn.join(','),
    defaultCode: JSON.stringify(problem.defaultCode || {}, null, 2),
    boilerplate: JSON.stringify(problem.boilerplate || {}, null, 2),
    testCases: JSON.stringify(problem.testCases || [], null, 2)
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const payload = {
        problemNumber: Number(form.problemNumber),
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        category: form.category,
        constraints: form.constraints.split('\n').map(s => s.trim()).filter(Boolean),
        sampleInput: form.sampleInput,
        sampleOutput: form.sampleOutput.split('\n').map(s => s.trim()).filter(Boolean),
        defaultCode: form.defaultCode ? JSON.parse(form.defaultCode) : {},
        boilerplate: form.boilerplate ? JSON.parse(form.boilerplate) : {},
        testCases: form.testCases ? JSON.parse(form.testCases) : [],
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        companiesAskedIn: form.companiesAskedIn.split(',').map(s => s.trim()).filter(Boolean),
        author: form.author || 'admin',
      };
      await axios.put(`/api/problems/${problem.problemNumber}`, payload, { withCredentials: true });
      setMessage('Problem updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeIn border border-indigo-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded px-4 py-1 text-sm font-semibold shadow transition-colors"
        >
          Close
        </button>
        <h2 className="text-3xl mb-6 font-bold text-indigo-700 text-center">Edit Problem</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Problem Number</label>
              <input name="problemNumber" value={form.problemNumber} onChange={handleChange} required type="number" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" disabled />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select</option>
                {allowedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Constraints <span className="text-xs text-gray-400">(one per line)</span></label>
              <textarea name="constraints" value={form.constraints} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Sample Input</label>
              <textarea name="sampleInput" value={form.sampleInput} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Sample Output <span className="text-xs text-gray-400">(one per line)</span></label>
              <textarea name="sampleOutput" value={form.sampleOutput} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Default Code <span className="text-xs text-gray-400">(JSON, language: code)</span></label>
              <textarea name="defaultCode" value={form.defaultCode} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs" placeholder='{"python": "print(123)"}' />
              <span className="text-xs text-gray-400">e.g. {'{"python": "print(123)"}'}</span>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Boilerplate <span className="text-xs text-gray-400">(JSON, language: code)</span></label>
              <textarea name="boilerplate" value={form.boilerplate} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs" placeholder='{"python": "def foo(): pass"}' />
              <span className="text-xs text-gray-400">e.g. {'{"python": "def foo(): pass"}'}</span>
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Test Cases <span className="text-xs text-gray-400">(JSON array)</span></label>
              <textarea name="testCases" value={form.testCases} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs" placeholder='[{"input": 1, "output": 2}]' />
              <span className="text-xs text-gray-400">e.g. [{'{' + '"input": 1, "output": 2' + '}'}]</span>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Tags <span className="text-xs text-gray-400">(comma separated)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Companies Asked In <span className="text-xs text-gray-400">(comma separated)</span></label>
              <input name="companiesAskedIn" value={form.companiesAskedIn} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Author</label>
              <input name="author" value={form.author} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='admin' />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded py-2 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="loader border-2 border-t-2 border-t-white border-indigo-200 rounded-full w-4 h-4 animate-spin"></span>}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {message && <div className="text-green-600 mt-4 font-semibold text-center">{message}</div>}
        {error && <div className="text-red-600 mt-4 font-semibold text-center">{error}</div>}
      </div>
    </div>
  );
};

export default EditProblem; 