"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@care-circle/shared");
const auth_1 = require("../middleware/auth");
const shared_2 = require("@care-circle/shared");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/:profileId', async (req, res) => {
    try {
        const { profileId } = req.params;
        const { from, to, type } = req.query;
        // Verify membership
        const member = await shared_1.prisma.careProfileMember.findFirst({
            where: {
                careProfileId: profileId,
                userId: req.userId,
            },
        });
        if (!member) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const entries = await shared_1.prisma.entry.findMany({
            where: {
                careProfileId: profileId,
                type: type ? type : undefined,
                timestamp: {
                    gte: from ? new Date(from) : undefined,
                    lte: to ? new Date(to) : undefined,
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/:profileId', async (req, res) => {
    try {
        const { profileId } = req.params;
        const data = shared_2.EntrySchema.parse(req.body);
        // Verify membership and role (GUEST cannot create)
        const member = await shared_1.prisma.careProfileMember.findFirst({
            where: {
                careProfileId: profileId,
                userId: req.userId,
            },
        });
        if (!member || member.role === 'GUEST') {
            return res.status(403).json({ error: 'Access denied or insufficient permissions' });
        }
        const entry = await shared_1.prisma.entry.create({
            data: {
                ...data,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                careProfileId: profileId,
                authorId: req.userId,
            },
        });
        res.status(201).json(entry);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=entries.js.map