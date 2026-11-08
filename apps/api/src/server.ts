import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from '@shopeconomy/db';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'KJOIKPHGIU#Uyu793igh*uf3gdo3us9h8o32Y7g3hk*YThLhghKGik7@O)#937$(G2ij2hDg';

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

    // 4. Авторизация (Логин)
  app.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ message: 'Введите email и пароль' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      return reply.status(401).send({ message: 'Неверный email или пароль' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({ message: 'Неверный email или пароль' });
    }

    // Генерируем JWT токен (действует 24 часа)
    const token = jwt.sign(
      { userId: user.id, isSuperAdmin: user.isSuperAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSuperAdmin: user.isSuperAdmin,
        roles: user.roles.map(r => r.role.code)
      }
    };
  });
  
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