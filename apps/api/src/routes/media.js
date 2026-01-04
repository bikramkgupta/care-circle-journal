"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const shared_1 = require("@care-circle/shared");
const auth_1 = require("../middleware/auth");
const storage_1 = require("../lib/storage");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post('/presign', async (req, res) => {
    try {
        const { profileId, entryId, type, mimeType, extension } = req.body;
        // Verify membership
        const member = await shared_1.prisma.careProfileMember.findFirst({
            where: {
                careProfileId: profileId,
                userId: req.userId,
            },
        });
        if (!member || member.role === 'GUEST') {
            return res.status(403).json({ error: 'Access denied or insufficient permissions' });
        }
        const mediaId = (0, uuid_1.v4)();
        const spacesKey = `care-profiles/${profileId}/entries/${entryId}/${mediaId}.${extension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: storage_1.BUCKET_NAME,
            Key: spacesKey,
            ContentType: mimeType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(storage_1.s3Client, command, { expiresIn: 3600 });
        const mediaAsset = await shared_1.prisma.mediaAsset.create({
            data: {
                id: mediaId,
                careProfileId: profileId,
                entryId: entryId,
                type: type,
                spacesKey: spacesKey,
                mimeType: mimeType,
            },
        });
        res.json({
            uploadUrl,
            mediaId,
            spacesKey,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/:mediaId/url', async (req, res) => {
    try {
        const { mediaId } = req.params;
        const mediaAsset = await shared_1.prisma.mediaAsset.findUnique({
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
        const command = new client_s3_1.GetObjectCommand({
            Bucket: storage_1.BUCKET_NAME,
            Key: mediaAsset.spacesKey,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(storage_1.s3Client, command, { expiresIn: 3600 });
        res.json({ url });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=media.js.map