import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from '@shopeconomy/db';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({ logger: true });

// Разрешаем CORS (чтобы позже сайт и десктоп могли делать запросы)
app.register(cors, { origin: true });

// 1. Проверка работоспособности сервера (Health-check)
app.get('/health', async () => {
  return { status: 'ok', message: 'API is running' };
});

// 2. Проверка связи с Базой Данных
app.get('/health/db', async (request, reply) => {
  try {
    const count = await prisma.city.count();
    return { status: 'ok', message: 'Database connected', citiesCount: count };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ status: 'error', message: 'Database connection failed' });
  }
});

  // 3. Получение списка всех товаров (Каталог)
  app.get('/products', async (request, reply) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true, // Подтягиваем название категории
        },
      });
      return products;
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: 'Ошибка при получении товаров' });
    }
  });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    // Слушаем на 0.0.0.0, чтобы сервер был доступен с других устройств в локальной сети (твои телефоны и второй ПК)
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();