import { PrismaClient, EntryType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // 1. Create or get demo user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo Caregiver',
      passwordHash,
    },
  });
  
  console.log('✅ Demo user ensured');

  // 2. Create or get Care Profile
  const profile = await prisma.careProfile.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: 'Demo: Alex',
      },
    },
    update: {},
    create: {
      ownerId: user.id,
      name: 'Demo: Alex',
      dateOfBirth: new Date('2018-05-15'),
      notes: 'Alex is 6 years old and non-verbal. He loves music and outdoor play.',
      members: {
        create: {
          userId: user.id,
          role: Role.OWNER,
        },
      },
    },
  });

  console.log('✅ Care Profile "Demo: Alex" ensured');

  // 3. Generate 30 days of entries
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Sleep
    await prisma.entry.create({
      data: {
        careProfileId: profile.id,
        authorId: user.id,
        type: EntryType.SLEEP,
        timestamp: new Date(date.setUTCHours(7, 0, 0, 0)),
        freeText: 'Slept through the night with no issues.',
        structuredPayload: { hours: 9, quality: 'good' },
        moodScore: 5,
      }
    });

    // Breakfast
    await prisma.entry.create({
      data: {
        careProfileId: profile.id,
        authorId: user.id,
        type: EntryType.MEAL,
        timestamp: new Date(date.setUTCHours(8, 30, 0, 0)),
        freeText: 'Ate all of his oatmeal and some strawberries.',
        structuredPayload: { meal_type: 'breakfast', foods: ['oatmeal', 'strawberries'] },
      }
    });

    // Morning Activity
    await prisma.entry.create({
      data: {
        careProfileId: profile.id,
        authorId: user.id,
        type: EntryType.ACTIVITY,
        timestamp: new Date(date.setUTCHours(10, 0, 0, 0)),
        freeText: 'Played with blocks and listened to some jazz music.',
        structuredPayload: { label: 'Play time', duration_minutes: 60 },
        tags: { context: 'home' },
        moodScore: 4,
      }
    });

    // Afternoon symptom (randomly)
    if (Math.random() > 0.5) {
      await prisma.entry.create({
        data: {
          careProfileId: profile.id,
          authorId: user.id,
          type: EntryType.SYMPTOM,
          timestamp: new Date(date.setUTCHours(15, 0, 0, 0)),
          freeText: 'Alex seemed a bit anxious and was flapping his hands more than usual.',
          structuredPayload: { symptom: 'Stimming/Anxiety', severity: 4 },
          moodScore: 2,
        }
      });
    }
  }

  console.log('✅ 30 days of entries generated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
