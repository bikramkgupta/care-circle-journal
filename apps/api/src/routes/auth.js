"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_1 = require("@care-circle/shared");
const shared_2 = require("@care-circle/shared");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = shared_2.SignupSchema.parse(req.body);
        const existingUser = await shared_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await shared_1.prisma.user.create({
            data: { email, passwordHash, name },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name },
            token,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = shared_2.LoginSchema.parse(req.body);
        const user = await shared_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.json({
            user: { id: user.id, email: user.email, name: user.name },
            token,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map