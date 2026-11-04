
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";

export default function Product() {
  const { id } = useParams();

  const [selectedSize, setSelectedSize] = useState("");
  const [message, setMessage] = useState("");

  const product = products.find(
    (item) => String(item.id) === id
  );

  if (!product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f7f4] px-5">
        <h1 className="text-3xl font-semibold text-[#292929]">
          Товар не найден
        </h1>

        <Link
          to="/catalog"
          className="mt-6 bg-[#292929] px-6 py-3 text-white"
        >
          Вернуться в каталог
        </Link>
      </main>
    );
  }

  const formattedPrice = new Intl.NumberFormat("ru-RU").format(
    Number(product.price)
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage("Сначала выберите размер.");
      return;
    }

    let cart;

    try {
      cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.size === selectedSize
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity =
        (Number(cart[existingIndex].quantity) || 1) + 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setMessage("Товар добавлен в корзину!");
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* Навигация */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-black">
            Главная
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-black">
            Каталог
          </Link>
          <span>/</span>
          <span className="text-[#292929]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">

          {/* Изображение товара */}
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#e9e4dc]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <span className="text-7xl font-light text-[#a99a87]">
                  {String(product.id).padStart(2, "0")}
                </span>
                <span className="mt-4 text-xs uppercase tracking-widest text-[#898174]">
                  Фото товара
                </span>
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="flex flex-col justify-center py-4">

            <span className="text-xs uppercase tracking-widest text-[#a18b72]">
              {product.category_name}
            </span>

            <h1 className="mt-4 text-3xl font-semibold text-[#292929] md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-5 text-2xl font-semibold text-[#292929]">
              {formattedPrice} ₽
            </p>

            <div className="my-8 border-t border-[#e3dfd8]" />

            {/* Описание */}
            <h2 className="text-sm font-semibold text-[#292929]">
              Описание
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-500">
              {product.description || "Описание товара пока отсутствует."}
            </p>

            {/* Материал */}
            {product.material && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-[#292929]">
                  Материал
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {product.material}
                </p>
              </div>
            )}

            {/* Выбор размера */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-[#292929]">
                Выберите размер
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setMessage("");
                    }}
                    aria-pressed={selectedSize === size}
                    className={`h-12 min-w-12 border px-4 text-sm transition ${
                      selectedSize === size
                        ? "border-[#292929] bg-[#292929] text-white"
                        : "border-[#d8d3cb] bg-white text-[#292929] hover:border-[#292929]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Наличие */}
            <p
              className={`mt-7 text-sm ${
                product.inStock ? "text-green-700" : "text-red-600"
              }`}
            >
              {product.inStock ? "✓ В наличии" : "Нет в наличии"}
            </p>

            {/* Добавление в корзину */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="mt-7 w-full bg-[#292929] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#444] disabled:opacity-50"
            >
              Добавить в корзину
            </button>

            {message && (
              <p role="status" className="mt-4 text-sm text-[#8a755c]">
                {message}
              </p>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
