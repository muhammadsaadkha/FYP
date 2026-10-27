import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET?.trim()) {
  console.error('FATAL: JWT_SECRET is not set in backend/.env');
  process.exit(1);
}

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

