import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Wrap the Prisma client so every query automatically retries on connection errors
  // (Neon free-tier auto-suspends after inactivity; the first query after
  // wakeup fails with "Can't reach database server" while the instance resumes).
  return new Proxy(baseClient, {
    get(target: any, prop: string) {
      const value = target[prop];

      // Only proxy model accessors (e.g. prisma.user, prisma.idea, etc.)
      if (
        typeof value === 'object' &&
        value !== null &&
        !prop.startsWith('$') &&
        !prop.startsWith('_')
      ) {
        return new Proxy(value, {
          get(modelTarget: any, method: string) {
            const fn = modelTarget[method];
            if (typeof fn !== 'function') return fn;

            return async (...args: any[]) => {
              const maxRetries = 15; // Increased retries for slower wakeups
              const delayMs = 1000;  // Ultra-low delay for fastest response
              let lastError: any;

              for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                  return await fn.apply(modelTarget, args);
                } catch (error: any) {
                  lastError = error;
                  const errorMsg = error?.message || "";
                  const errorCode = error?.code || error?.errorCode || "";
                  
                  const isConnectionError =
                    errorMsg.includes("Can't reach database server") ||
                    errorMsg.includes("Connection refused") ||
                    errorMsg.includes("Timed out fetching a connection") ||
                    errorCode === 'P1001' ||
                    errorCode === 'P1002' ||
                    errorCode === 'P1003' ||
                    errorCode === 'P1008' ||
                    errorCode === 'P1017';

                  if (isConnectionError && attempt < maxRetries) {
                    console.warn(
                      `[DB] Connection attempt ${attempt}/${maxRetries} failed (Neon waking up). Error: ${errorCode || errorMsg.substring(0, 50)}... Retrying in ${delayMs / 1000}s...`
                    );
                    await new Promise((r) => setTimeout(r, delayMs));
                  } else {
                    throw error;
                  }
                }
              }
              throw lastError;
            };
          },
        });
      }

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },
  }) as PrismaClient;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
