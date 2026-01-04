import { Router, Response } from 'express';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@care-circle/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { s3Client, BUCKET_NAME } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authMiddleware);

router.post('/presign', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId, entryId, type, mimeType, extension } = req.body;
    
    // Verify membership
    const member = await prisma.careProfileMember.findFirst({
      where: {
        careProfileId: profileId,
        userId: req.userId,
      },
    });
    
    if (!member || member.role === 'GUEST') {
      return res.status(403).json({ error: 'Access denied or insufficient permissions' });
    }
    
    const mediaId = uuidv4();
    const spacesKey = `care-profiles/${profileId}/entries/${entryId}/${mediaId}.${extension}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: spacesKey,
      ContentType: mimeType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        careProfileId: profileId,
        entryId: entryId,
        type: type as any,
        spacesKey: spacesKey,
        mimeType: mimeType,
      },
    });
    
    res.json({
      uploadUrl,
      mediaId,
      spacesKey,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:mediaId/url', async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.params;
    
    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      include: {
        careProfile: {
          include: {
            members: {
              where: { userId: req.userId }
            }
          }
        }
      }
    });
    
    if (!mediaAsset || mediaAsset.careProfile.members.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: mediaAsset.spacesKey,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
