import app from './app.js';
import connectDB from './database/db.js';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket.js';

dotenv.config();

// Fail fast rather than silently issuing unsigned/invalid tokens at runtime.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in the environment variables');
  process.exit(1);
}

if (process.env.EXECUTION_BACKEND === 'host') {
  console.warn('='.repeat(70));
  console.warn('WARNING: EXECUTION_BACKEND=host — running the UNSANDBOXED demo');
  console.warn('code execution fallback. Submitted code runs directly on this');
  console.warn('host process with no container isolation, network restriction,');
  console.warn('or resource limits. This is intended ONLY for hosting a live');
  console.warn('demo on a platform without Docker access. Do not use this in');
  console.warn('production - unset EXECUTION_BACKEND to use the real Docker');
  console.warn('sandbox (utils/dockerSandbox.js).');
  console.warn('='.repeat(70));
}

const PORT = process.env.PORT || 8080;
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();