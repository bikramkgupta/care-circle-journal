import * as dotenv from 'dotenv';
import { prisma } from '@care-circle/shared';
import { seedDemoData } from '../src/lib/demo-seed';

dotenv.config();

const days = Number(process.env.DEMO_SEED_DAYS) || 30;

seedDemoData({ days })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
