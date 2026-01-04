import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { prisma } from '@care-circle/shared';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
app.use('/auth', authRoutes);

import careProfileRoutes from './routes/care-profiles';
app.use('/care-profiles', careProfileRoutes);

import entryRoutes from './routes/entries';
app.use('/entries', entryRoutes);

import mediaRoutes from './routes/media';
app.use('/media', mediaRoutes);

import summaryRoutes from './routes/summaries';
app.use('/summaries', summaryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'CareCircle Journal API' });
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

main();
