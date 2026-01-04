import { Router, Response } from 'express';
import { prisma } from '@care-circle/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { EntrySchema } from '@care-circle/shared';

const router = Router();

router.use(authMiddleware);

router.get('/:profileId', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const { from, to, type } = req.query;
    
    // Verify membership
    const member = await prisma.careProfileMember.findFirst({
      where: {
        careProfileId: profileId,
        userId: req.userId,
      },
    });
    
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const entries = await prisma.entry.findMany({
      where: {
        careProfileId: profileId,
        type: type ? (type as any) : undefined,
        timestamp: {
          gte: from ? new Date(from as string) : undefined,
          lte: to ? new Date(to as string) : undefined,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        author: {
          select: { name: true }
        },
        mediaAssets: true,
      },
    });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:profileId', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const data = EntrySchema.parse(req.body);
    
    // Verify membership and role (GUEST cannot create)
    const member = await prisma.careProfileMember.findFirst({
      where: {
        careProfileId: profileId,
        userId: req.userId,
      },
    });
    
    if (!member || member.role === 'GUEST') {
      return res.status(403).json({ error: 'Access denied or insufficient permissions' });
    }
    
    const entry = await prisma.entry.create({
      data: {
        ...data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        careProfileId: profileId,
        authorId: req.userId!,
      },
    });
    
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
