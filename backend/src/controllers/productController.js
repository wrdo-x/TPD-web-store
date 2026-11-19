const db = require("../db/knex");
const fs = require("fs");
const path = require("path");

// Хелпер для формирования полного URL картинки (Вариант Б)
const getFullImageUrl = (req, url) => {
  if (!url) return null;
  return `${req.protocol}://${req.get("host")}${url}`;
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = db("products")
      .join("categories", "products.category_id", "categories.id")
      .select(
        "products.*",
        "categories.name as category_name",
        "categories.slug as category_slug",
      );

    if (category) {
      query = query.where("categories.slug", category);
    }
    if (search) {
      query = query.where("products.name", "ilike", `%${search}%`);
    }

    const countQuery = query.clone().clearSelect().count("* as total").first();
    const { total } = await countQuery;

    const products = await query
      .limit(limit)
      .offset(offset)
      .orderBy("products.created_at", "desc");

    for (let product of products) {
      const image = await db("product_images")
        .where({ product_id: product.id })
        .orderBy("sort_order", "asc")
        .first();

      // Применяем хелпер для формирования полного URL
      product.image = getFullImageUrl(req, image ? image.url : null);
    }

    res.json({
      items: products,
      total: parseInt(total),
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера при получении товаров" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db("products")
      .join("categories", "products.category_id", "categories.id")
      .select("products.*", "categories.name as category_name")
      .where("products.id", id)
      .first();

    if (!product) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    const sizes = await db("product_sizes").where({ product_id: id });
    const images = await db("product_images")
      .where({ product_id: id })
      .orderBy("sort_order", "asc");

    res.json({
      ...product,
      sizes,
      // Формируем полные URL для массива картинок
      images: images.map((img) => getFullImageUrl(req, img.url)),
      // Добавляем основную картинку для удобства
      image: images.length > 0 ? getFullImageUrl(req, images[0].url) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;

    if (!name || !price || !category_id) {
      // Если файл уже загружен, но валидация не прошла — удаляем его
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res
        .status(400)
        .json({ error: "Название, цена и категория обязательны" });
    }

    const [newProduct] = await db("products")
      .insert({
        name,
        description,
        price,
        category_id: Number(category_id),
      })
      .returning("*");

    // Сохраняем изображение, если оно есть
    if (req.file) {
      const imageUrl = `/uploads/products/${req.file.filename}`;

      await db("product_images").insert({
        product_id: newProduct.id,
        url: imageUrl,
        sort_order: 0,
      });

      // Применяем хелпер для возврата полного URL
      newProduct.image = getFullImageUrl(req, imageUrl);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    // Удаляем файл при ошибке БД
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: "Ошибка при создании товара" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // (Опционально) Здесь можно сначала получить список картинок из БД
    // и удалить физические файлы с диска с помощью fs.unlink,
    // чтобы не копить мусор. Но для начала можно оставить и так.

    const deleted = await db("products").where({ id }).del();

    if (!deleted) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json({ message: "Товар успешно удален" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении товара" });
  }
};
