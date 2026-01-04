import bcrypt from 'bcryptjs';
import { EntryType, Prisma, Role } from '@prisma/client';
import { prisma } from '@care-circle/shared';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';
const DEMO_PROFILE_NAME = 'Demo: Alex';
const DEMO_LOCK_ID = 8675309;

type SeedOptions = {
  days?: number;
};

const toUtcDate = (base: Date, hour: number, minute: number) =>
  new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hour, minute, 0, 0));

export const seedDemoData = async ({ days = 30 }: SeedOptions = {}) => {
  const [lock] = await prisma.$queryRaw<{ pg_try_advisory_lock: boolean }[]>`
    SELECT pg_try_advisory_lock(${DEMO_LOCK_ID}) AS pg_try_advisory_lock
  `;

  if (!lock?.pg_try_advisory_lock) {
    console.log('ℹ️ Demo seed already running, skipping');
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: { name: 'Demo Caregiver', passwordHash },
      create: {
        email: DEMO_EMAIL,
        name: 'Demo Caregiver',
        passwordHash,
      },
    });

    const profile = await prisma.careProfile.upsert({
      where: {
        ownerId_name: {
          ownerId: user.id,
          name: DEMO_PROFILE_NAME,
        },
      },
      update: {
        dateOfBirth: new Date('2018-05-15'),
        notes: 'Alex is 6 years old and non-verbal. He loves music and outdoor play.',
      },
      create: {
        ownerId: user.id,
        name: DEMO_PROFILE_NAME,
        dateOfBirth: new Date('2018-05-15'),
        notes: 'Alex is 6 years old and non-verbal. He loves music and outdoor play.',
      },
    });

    await prisma.careProfileMember.upsert({
      where: {
        careProfileId_userId: {
          careProfileId: profile.id,
          userId: user.id,
        },
      },
      update: { role: Role.OWNER },
      create: {
        careProfileId: profile.id,
        userId: user.id,
        role: Role.OWNER,
      },
    });

    const existingEntries = await prisma.entry.count({
      where: { careProfileId: profile.id },
    });

    if (existingEntries > 0) {
      console.log(`ℹ️ Demo data already present (${existingEntries} entries). Skipping.`);
      return;
    }

    const today = new Date();
    const entries: Prisma.EntryCreateManyInput[] = [];

    for (let index = 0; index < days; index += 1) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - index);

      entries.push(
        {
          careProfileId: profile.id,
          authorId: user.id,
          type: EntryType.SLEEP,
          timestamp: toUtcDate(date, 7, 0),
          freeText: 'Slept through the night with no issues.',
          structuredPayload: { hours: 9, quality: 'good' },
          moodScore: 5,
        },
        {
          careProfileId: profile.id,
          authorId: user.id,
          type: EntryType.MEAL,
          timestamp: toUtcDate(date, 8, 30),
          freeText: 'Ate all of his oatmeal and some strawberries.',
          structuredPayload: { meal_type: 'breakfast', foods: ['oatmeal', 'strawberries'] },
        },
        {
          careProfileId: profile.id,
          authorId: user.id,
          type: EntryType.ACTIVITY,
          timestamp: toUtcDate(date, 10, 0),
          freeText: 'Played with blocks and listened to some jazz music.',
          structuredPayload: { label: 'Play time', duration_minutes: 60 },
          tags: { context: 'home' },
          moodScore: 4,
        }
      );

      if (index % 3 === 0) {
        entries.push({
          careProfileId: profile.id,
          authorId: user.id,
          type: EntryType.SYMPTOM,
          timestamp: toUtcDate(date, 15, 0),
          freeText: 'Alex seemed a bit anxious and was flapping his hands more than usual.',
          structuredPayload: { symptom: 'Stimming/Anxiety', severity: 4 },
          moodScore: 2,
        });
      }
    }

    await prisma.entry.createMany({ data: entries });
    console.log(`✅ Demo data seeded (${entries.length} entries).`);
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    throw error;
  } finally {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(${DEMO_LOCK_ID})`;
  }
};
