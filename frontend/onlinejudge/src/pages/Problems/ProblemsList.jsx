import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../../api";

const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("number"); // number or difficulty

  useEffect(() => {
    const loadProblems = async () => {
      const data = await fetchProblems();
      if (data.error) {
        setError(data.error);
      } else {
        setProblems(data);
      }
    };
    loadProblems();
  }, []);

  // Sorting logic
  const sortedProblems = [...problems].sort((a, b) => {
    if (sortBy === "number") {
      return a.problemNumber - b.problemNumber;
    }
    if (sortBy === "difficulty") {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    return 0;
  });

  if (error) {
    return (
      <div className="text-red-600 text-center mt-12 font-semibold text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-indigo-600">Problems</h1>
        <select
          className="bg-gray-900 text-white rounded-md px-4 py-2 border border-gray-700 hover:border-indigo-500 transition"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="number">Sort by Number</option>
          <option value="difficulty">Sort by Difficulty</option>
        </select>
      </div>

      <ul className="divide-y divide-gray-700">
        {sortedProblems.map((problem, index) => (
          <li
            key={problem.problemNumber}
            className="py-4 hover:bg-gray-800 rounded-md transition"
          >
            <Link
              to={`/problems/${problem.problemNumber}`}
              className="flex justify-between items-center text-white hover:text-indigo-400"
            >
              <span className="text-lg font-medium">
                {index + 1}. {problem.title}
              </span>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 rounded-md text-sm font-semibold ${
                    problem.difficulty === "Easy"
                      ? "bg-green-600 text-green-100"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-500 text-yellow-100"
                      : "bg-red-600 text-red-100"
                  }`}
                >
                  {problem.difficulty}
                </span>
                <div className="flex space-x-2">
                  {problem.topics?.map((topic, i) => (
                    <span
                      key={i}
                      className="bg-indigo-700 text-indigo-200 px-2 py-0.5 rounded-full text-xs font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsList;
