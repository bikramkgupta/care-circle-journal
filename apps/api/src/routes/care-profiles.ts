import { Router, Response } from 'express';
import { prisma } from '@care-circle/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { CareProfileSchema } from '@care-circle/shared';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const profiles = await prisma.careProfile.findMany({
      where: {
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, dateOfBirth, notes } = CareProfileSchema.parse(req.body);
    
    const profile = await prisma.careProfile.create({
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        notes,
        ownerId: req.userId!,
        members: {
          create: {
            userId: req.userId!,
            role: 'OWNER',
          },
        },
      },
    });
    
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.careProfile.findFirst({
      where: {
        id: req.params.id,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
