const db = require("../db/knex");
const fs = require("fs");

// Хелпер для формирования полного URL картинки
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

    // Для каждого товара подтягиваем картинку и размеры
    for (let product of products) {
      const image = await db("product_images")
        .where({ product_id: product.id })
        .orderBy("sort_order", "asc")
        .first();

      product.image = getFullImageUrl(req, image ? image.url : null);

      // Получаем размеры (ОБЯЗАТЕЛЬНО для фильтра в каталоге)
      const sizesData = await db("product_sizes")
        .where({ product_id: product.id })
        .select("size"); // Убедись, что колонка называется 'size'

      product.sizes = sizesData.map((s) => s.size);
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

    const sizesData = await db("product_sizes").where({ product_id: id });
    const images = await db("product_images")
      .where({ product_id: id })
      .orderBy("sort_order", "asc");

    res.json({
      ...product,
      sizes: sizesData.map((s) => s.size),
      images: images.map((img) => getFullImageUrl(req, img.url)),
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

    // Проверка на наличие файлов (req.files - это массив, если используется .array())
    if (!name || !price || !category_id) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => fs.unlink(file.path, () => {}));
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

    // Сохраняем изображения
    if (req.files && req.files.length > 0) {
      const imagesToInsert = req.files.map((file, index) => ({
        product_id: newProduct.id,
        url: `/uploads/products/${file.filename}`,
        sort_order: index,
      }));

      await db("product_images").insert(imagesToInsert);

      newProduct.image = getFullImageUrl(req, imagesToInsert[0].url);
      newProduct.images = imagesToInsert.map((img) =>
        getFullImageUrl(req, img.url),
      );
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => fs.unlink(file.path, () => {}));
    }
    res.status(500).json({ error: "Ошибка при создании товара" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db("products").where({ id }).del();
    if (!deleted) return res.status(404).json({ error: "Товар не найден" });
    res.json({ message: "Товар успешно удален" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении товара" });
  }
};
