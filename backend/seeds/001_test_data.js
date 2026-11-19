const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  // 1. ЖЕСТКАЯ ОЧИСТКА (сбрасывает счетчики ID обратно на 1)
  await knex.raw(
    "TRUNCATE TABLE users, categories, products, product_sizes, product_images, carts, cart_items, orders, order_items, password_resets RESTART IDENTITY CASCADE",
  );

  // 2. Пользователи
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  await knex("users").insert([
    {
      email: "admin@shop.ru",
      password_hash: adminHash,
      name: "Администратор",
      role: "admin",
    },
    {
      email: "user@shop.ru",
      password_hash: userHash,
      name: "Иван Иванов",
      phone: "+79990000000",
      address: "Москва, ул. Ленина, 1",
      role: "user",
    },
  ]);

  // 3. Категории
  const categories = await knex("categories")
    .insert([
      { name: "Футболки", slug: "t-shirts" },
      { name: "Джинсы", slug: "jeans" },
      { name: "Куртки", slug: "jackets" },
    ])
    .returning("id");

  const catId1 = categories[0].id;
  const catId2 = categories[1].id;
  const catId3 = categories[2].id;

  // 4. Товары
  const products = await knex("products")
    .insert([
      {
        name: "Футболка белая",
        description: "Хлопок 100%, базовая модель",
        price: 1500,
        category_id: catId1,
      },
      {
        name: "Футболка чёрная",
        description: "Хлопок 100%, оверсайз",
        price: 1700,
        category_id: catId1,
      },
      {
        name: "Джинсы синие",
        description: "Классический крой, деним",
        price: 3500,
        category_id: catId2,
      },
      {
        name: "Куртка зимняя",
        description: "Утеплитель 300г, водонепроницаемая",
        price: 7000,
        category_id: catId3,
      },
    ])
    .returning("id");

  const prodId1 = products[0].id;
  const prodId2 = products[1].id;
  const prodId3 = products[2].id;
  const prodId4 = products[3].id;

  // 5. Размеры
  await knex("product_sizes").insert([
    { product_id: prodId1, size: "S", stock: 5 },
    { product_id: prodId1, size: "M", stock: 10 },
    { product_id: prodId1, size: "L", stock: 3 },
    { product_id: prodId2, size: "M", stock: 7 },
    { product_id: prodId2, size: "L", stock: 2 },
    { product_id: prodId3, size: "30", stock: 4 },
    { product_id: prodId3, size: "32", stock: 6 },
    { product_id: prodId4, size: "M", stock: 2 },
    { product_id: prodId4, size: "L", stock: 1 },
  ]);

  // 6. Изображения (по 2 штуки на товар)
  await knex("product_images").insert([
    // Белая футболка
    { product_id: prodId1, url: "/uploads/white-1.jpg", sort_order: 0 },
    { product_id: prodId1, url: "/uploads/white-2.jpg", sort_order: 1 },
    // Черная футболка
    { product_id: prodId2, url: "/uploads/black-1.jpg", sort_order: 0 },
    { product_id: prodId2, url: "/uploads/black-2.jpg", sort_order: 1 },
    // Джинсы
    { product_id: prodId3, url: "/uploads/jeans-1.jpg", sort_order: 0 },
    { product_id: prodId3, url: "/uploads/jeans-2.jpg", sort_order: 1 },
    // Куртка
    { product_id: prodId4, url: "/uploads/jacket-1.jpg", sort_order: 0 },
    { product_id: prodId4, url: "/uploads/jacket-2.jpg", sort_order: 1 },
  ]);

  console.log("✅ Тестовые данные успешно добавлены! ID сброшены на 1.");
};
