import app from './app.js';
import connectDB from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
app.listen(PORT,'0.0.0.0',()=>{
  console.log(`Server running or ${PORT}`)
})

connectDB();