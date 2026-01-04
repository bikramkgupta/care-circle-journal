import { Router, Response } from 'express';
import { prisma } from '@care-circle/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateDailySummary } from '../lib/gradient';

const router = Router();

router.use(authMiddleware);

router.post('/:profileId/daily', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const { date } = req.body; // YYYY-MM-DD
    
    // Verify membership
    const profile = await prisma.careProfile.findFirst({
      where: {
        id: profileId,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
    });
    
    if (!profile) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const entries = await prisma.entry.findMany({
      where: {
        careProfileId: profileId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No entries found for this day' });
    }
    
    const summary = await generateDailySummary(profile.name, date, entries);
    
    const aiSummary = await prisma.aiSummary.upsert({
      where: {
        careProfileId_periodType_periodStart_periodEnd: {
          careProfileId: profileId,
          periodType: 'DAILY',
          periodStart: startOfDay,
          periodEnd: startOfDay,
        },
      },
      update: {
        summaryText: summary.summaryText,
        insightsJson: summary.insightsJson,
        modelName: summary.modelName,
      },
      create: {
        careProfileId: profileId,
        periodType: 'DAILY',
        periodStart: startOfDay,
        periodEnd: startOfDay,
        summaryText: summary.summaryText,
        insightsJson: summary.insightsJson,
        modelName: summary.modelName,
      },
    });
    
    res.json(aiSummary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:profileId', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const { from, to, type } = req.query;
    
    const summaries = await prisma.aiSummary.findMany({
      where: {
        careProfileId: profileId,
        periodType: type ? (type as any) : undefined,
        periodStart: {
          gte: from ? new Date(from as string) : undefined,
        },
        periodEnd: {
          lte: to ? new Date(to as string) : undefined,
        },
      },
      orderBy: {
        periodStart: 'desc',
      },
    });
    
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
