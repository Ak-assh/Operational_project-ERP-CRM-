import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './prisma/client.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Operational Portal API running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
