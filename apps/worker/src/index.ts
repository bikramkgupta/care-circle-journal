import cron from 'node-cron';
import http from 'http';
import * as dotenv from 'dotenv';
import { prisma } from '@care-circle/shared';

dotenv.config();

console.log('🚀 Worker started');

// Health check HTTP server (required for App Platform)
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'worker'
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`📡 Health check server listening on port ${PORT}`);
});

// Daily Summary Job - runs at 1 AM every day
cron.schedule('0 1 * * *', async () => {
  console.log('⏳ Running daily summary job...');
  
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const profiles = await prisma.careProfile.findMany();
    
    for (const profile of profiles) {
      console.log(`  Processing profile: ${profile.name}`);
      
      // Get entries for yesterday
      const startOfDay = new Date(dateStr);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      const entries = await prisma.entry.findMany({
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
  } catch (error) {
    console.error('❌ Daily summary job failed:', error);
  }
});

// Weekly Summary Job - runs every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  console.log('⏳ Running weekly summary job...');
  
  try {
    const profiles = await prisma.careProfile.findMany();
    
    for (const profile of profiles) {
      console.log(`  Processing weekly summary for: ${profile.name}`);
      // Weekly summary logic would go here
    }
    
    console.log('✅ Weekly summary job completed');
  } catch (error) {
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
