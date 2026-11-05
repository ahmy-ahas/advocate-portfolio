import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to a random string of at least 32 characters (see .env.example).');
  process.exit(1);
}

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const { run: seedData } = await import('./scripts/seed.js');
    await seedData({ disconnectAfter: false });
  }

  createApp().listen(port, () => console.log(`API listening on port ${port}`));
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
