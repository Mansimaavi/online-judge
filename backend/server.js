import app from './app.js';
import connectDB from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Fail fast rather than silently issuing unsigned/invalid tokens at runtime.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in the environment variables');
  process.exit(1);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();