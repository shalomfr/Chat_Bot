import { prisma } from "./prisma";

/**
 * Retry wrapper for database operations to handle transient connection errors
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns The result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error.message?.includes('closed the connection') ||
        error.message?.includes('P1017') ||
        error.message?.includes('P1001') ||
        error.message?.includes('P1002') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('Connection terminated');

      if (isConnectionError && i < maxRetries - 1) {
        console.log(`Database retry ${i + 1}/${maxRetries} after connection error`);
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prisma.$connect();
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}
