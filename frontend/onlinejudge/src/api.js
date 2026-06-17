import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8080'; // Update if needed

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------ AUTH ------------------------
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Logout failed',
    };
  }
};

// ------------------------ PROBLEMS ------------------------
export const fetchProblems = async () => {
  try {
    const response = await axiosInstance.get('/api/problems');
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Failed to fetch problems',
    };
  }
};

export const fetchProblemByNumber = async (problemNumber) => {
  if (!problemNumber) return { error: 'Problem number is missing' };

  try {
    const response = await axiosInstance.get(`/api/problems/${problemNumber}`);
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Failed to fetch problem',
    };
  }
};

// ------------------------ COMPILER ------------------------
export const runCode = async ({ code, language = 'cpp', problemNumber, input = '' }) => {
  if (!code) return { error: 'Code is required to run' };

  try {
    const response = await axiosInstance.post('/api/compiler/run', { 
      code, 
      language, 
      problemNumber,
      input 
    });
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.error || 'Code execution failed',
    };
  }
};

// ------------------------ SUBMISSIONS ------------------------
export const submitCode = async ({ code, language = 'cpp', problemNumber }) => {
  if (!code || !problemNumber) {
    return { error: 'Code and problem number are required for submission' };
  }

  try {
    // Always use the authenticated submissions endpoint for logged-in users
    const response = await axiosInstance.post('/api/submissions/', {
      code,
      language,
      problemNumber,
    });
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.error || 'Code submission failed',
    };
  }
};

export const fetchSubmissions = async () => {
  try {
    const response = await axiosInstance.get('/api/submissions');
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Failed to fetch submissions',
    };
  }
};

export const fetchSubmissionById = async (submissionId) => {
  try {
    const response = await axiosInstance.get(`/api/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || 'Failed to fetch submission',
    };
  }
};

// ------------------------ ADMIN ------------------------
export const fetchUserCount = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/count');
    return response.data.count;
  } catch (error) {
    return 0;
  }
};

export const updateProblem = async (problemNumber, payload) => {
  try {
    const response = await axiosInstance.put(`/api/problems/${problemNumber}`, payload);
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.error || 'Error updating problem.'
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    if (response.data && response.data.success && response.data.user) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const fetchLeaderboard = async () => {
  try {
    const response = await axiosInstance.get('/api/submissions/leaderboard');
    return response.data.leaderboard;
  } catch (error) {
    return [];
  }
};
