"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const http_1 = __importDefault(require("http"));
const dotenv = __importStar(require("dotenv"));
const shared_1 = require("@care-circle/shared");
dotenv.config();
console.log('🚀 Worker started');
// Health check HTTP server (required for App Platform)
const PORT = process.env.PORT || 8080;
const server = http_1.default.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'worker'
        }));
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});
server.listen(PORT, () => {
    console.log(`📡 Health check server listening on port ${PORT}`);
});
// Daily Summary Job - runs at 1 AM every day
node_cron_1.default.schedule('0 1 * * *', async () => {
    console.log('⏳ Running daily summary job...');
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        const profiles = await shared_1.prisma.careProfile.findMany();
        for (const profile of profiles) {
            console.log(`  Processing profile: ${profile.name}`);
            // Get entries for yesterday
            const startOfDay = new Date(dateStr);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(dateStr);
            endOfDay.setUTCHours(23, 59, 59, 999);
            const entries = await shared_1.prisma.entry.findMany({
                where: {
                    careProfileId: profile.id,
                    timestamp: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            if (entries.length === 0) {
                console.log(`    No entries found for ${profile.name} on ${dateStr}`);
                continue;
            }
            console.log(`    Found ${entries.length} entries for ${profile.name}`);
            // In production, call the internal API or use shared Gradient logic
            // For now, we'll just log that we would generate a summary
            // The actual summary generation happens via the API endpoint
            console.log(`    Would generate summary for ${profile.name} on ${dateStr}`);
        }
        console.log('✅ Daily summary job completed');
    }
    catch (error) {
        console.error('❌ Daily summary job failed:', error);
    }
});
// Weekly Summary Job - runs every Sunday at 2 AM
node_cron_1.default.schedule('0 2 * * 0', async () => {
    console.log('⏳ Running weekly summary job...');
    try {
        const profiles = await shared_1.prisma.careProfile.findMany();
        for (const profile of profiles) {
            console.log(`  Processing weekly summary for: ${profile.name}`);
            // Weekly summary logic would go here
        }
        console.log('✅ Weekly summary job completed');
    }
    catch (error) {
        console.error('❌ Weekly summary job failed:', error);
    }
});
// Keep process alive
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map