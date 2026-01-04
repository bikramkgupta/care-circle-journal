"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@care-circle/shared");
const auth_1 = require("../middleware/auth");
const shared_2 = require("@care-circle/shared");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', async (req, res) => {
    try {
        const profiles = await shared_1.prisma.careProfile.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, dateOfBirth, notes } = shared_2.CareProfileSchema.parse(req.body);
        const profile = await shared_1.prisma.careProfile.create({
            data: {
                name,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                notes,
                ownerId: req.userId,
                members: {
                    create: {
                        userId: req.userId,
                        role: 'OWNER',
                    },
                },
            },
        });
        res.status(201).json(profile);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const profile = await shared_1.prisma.careProfile.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=care-profiles.js.map