import { PrismaClient } from '@prisma/client';

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