import { PrismaClient } from '@prisma/client';

// Создаем единственный экземпляр клиента на все приложение
export const prisma = new PrismaClient();