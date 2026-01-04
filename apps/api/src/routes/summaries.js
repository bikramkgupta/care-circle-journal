"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@care-circle/shared");
const auth_1 = require("../middleware/auth");
const gradient_1 = require("../lib/gradient");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post('/:profileId/daily', async (req, res) => {
    try {
        const { profileId } = req.params;
        const { date } = req.body; // YYYY-MM-DD
        // Verify membership
        const profile = await shared_1.prisma.careProfile.findFirst({
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
        const entries = await shared_1.prisma.entry.findMany({
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
        const summary = await (0, gradient_1.generateDailySummary)(profile.name, date, entries);
        const aiSummary = await shared_1.prisma.aiSummary.upsert({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:profileId', async (req, res) => {
    try {
        const { profileId } = req.params;
        const { from, to, type } = req.query;
        const summaries = await shared_1.prisma.aiSummary.findMany({
            where: {
                careProfileId: profileId,
                periodType: type ? type : undefined,
                periodStart: {
                    gte: from ? new Date(from) : undefined,
                },
                periodEnd: {
                    lte: to ? new Date(to) : undefined,
                },
            },
            orderBy: {
                periodStart: 'desc',
            },
        });
        res.json(summaries);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=summaries.js.map