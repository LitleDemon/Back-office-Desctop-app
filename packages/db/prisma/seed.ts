import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы (Seed)...');

  // 1. Создаем города
  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
  for (const cityName of cities) {
    await prisma.city.upsert({
      where: { id: cityName.toLowerCase() },
      update: {},
      create: { id: cityName.toLowerCase(), name: cityName },
    });
  }
  console.log('✅ Города добавлены');

  // 2. Создаем роли
  const roles = [
    { code: 'ADMIN', name: 'Глобальный админ' },
    { code: 'STORE_ADMIN', name: 'Администратор точки' },
    { code: 'LOGIST', name: 'Логист' },
    { code: 'CASHIER', name: 'Кассир' },
    { code: 'ASSEMBLER', name: 'Сборщик' },
    { code: 'COURIER', name: 'Курьер' },
    { code: 'FINANCIER', name: 'Финансист' },
  ];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log('✅ Роли добавлены');

  // 3. Создаем тестовую точку (Склад в Москве)
  const testLocation = await prisma.location.upsert({
    where: { id: 'wh-moscow-1' },
    update: {},
    create: {
      id: 'wh-moscow-1',
      type: 'WAREHOUSE',
      name: 'Главный склад Москва',
      address: 'ул. Складская, д. 1',
      cityId: 'москва', // ID города мы задали как имя в нижнем регистре
    },
  });
  console.log('✅ Тестовый склад создан');

  // 4. Создаем тестовую категорию и товар
  const category = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: { id: 'cat-1', name: 'Молочные продукты' },
  });

  await prisma.product.upsert({
    where: { sku: 'MILK-001' },
    update: {},
    create: {
      sku: 'MILK-001',
      name: 'Молоко 3.2% 1л',
      price: 89.90,
      categoryId: category.id,
      locationId: testLocation.id,
    },
  });

    // 5. Создаем пользователей (Суперадмин, Кассир, Логист)
  const passwordHash = await bcrypt.hash('123456', 10);

  // Суперадмин
  await prisma.user.upsert({
    where: { email: 'admin@shop.ru' },
    update: {},
    create: {
      email: 'admin@shop.ru',
      passwordHash,
      fullName: 'Главный Администратор',
      isSuperAdmin: true,
    },
  });

  // Тестовый Кассир
  const cashierRole = await prisma.role.findUnique({ where: { code: 'CASHIER' } });
  await prisma.user.upsert({
    where: { email: 'cashier@shop.ru' },
    update: {},
    create: {
      email: 'cashier@shop.ru',
      passwordHash,
      fullName: 'Иван Кассиров',
      roles: { create: { roleId: cashierRole!.id } },
    },
  });

  // Тестовый Логист
  const logistRole = await prisma.role.findUnique({ where: { code: 'LOGIST' } });
  await prisma.user.upsert({
    where: { email: 'logist@shop.ru' },
    update: {},
    create: {
      email: 'logist@shop.ru',
      passwordHash,
      fullName: 'Петр Складов',
      roles: { create: { roleId: logistRole!.id } },
    },
  });

  console.log('✅ Тестовые пользователи добавлены (admin@shop.ru, cashier@shop.ru, logist@shop.ru)');
    // 6. Создаем клиентов
  await prisma.customer.upsert({
    where: { clientCode: '123456' },
    update: {},
    create: {
      clientCode: '123456',
      fullName: 'Иван Иванов',
      balance: 5000.00, // Дадим ему 5000 рублей
    },
  });

  await prisma.customer.upsert({
    where: { clientCode: '777' },
    update: {},
    create: {
      clientCode: '777',
      fullName: 'Анна Смирнова',
      balance: 150.00, // А этой даме всего 150 рублей
    },
  });

  console.log('✅ Тестовые клиенты добавлены (код 123456, код 777)');
  
  console.log('✅ Тестовый товар добавлен');

  console.log('🎉 База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });