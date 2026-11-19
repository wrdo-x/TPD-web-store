import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [message, setMessage] = useState("");

  // Загрузка товара с бэкенда
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setError("");
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Товар не найден");
        } else {
          setError("Ошибка при загрузке товара");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f4]">
        <p className="text-sm text-[#858078]">Загрузка товара...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f7f4] px-5">
        <h1 className="text-3xl font-semibold text-[#292929]">
          {error || "Товар не найден"}
        </h1>
        <Link to="/catalog" className="mt-6 bg-[#292929] px-6 py-3 text-white">
          Вернуться в каталог
        </Link>
      </main>
    );
  }

  const formattedPrice = new Intl.NumberFormat("ru-RU").format(
    Number(product.price),
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage("Сначала выберите размер.");
      return;
    }

    let cart;
    try {
      cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.size === selectedSize,
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity =
        (Number(cart[existingIndex].quantity) || 1) + 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image, // Сохраняем картинку в корзину
        size: selectedSize,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setMessage("Товар добавлен в корзину!");
  };

  // Товар считается в наличии, если у него есть хотя бы один размер
  const inStock = Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
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

            <h2 className="text-sm font-semibold text-[#292929]">Описание</h2>
            <p className="mt-3 text-sm leading-7 text-gray-500">
              {product.description || "Описание товара пока отсутствует."}
            </p>

            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-[#292929]">
                  Выберите размер
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setMessage("");
                      }}
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
            )}

            <p
              className={`mt-7 text-sm ${inStock ? "text-green-700" : "text-red-600"}`}
            >
              {inStock ? "✓ В наличии" : "Нет в наличии"}
            </p>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="mt-7 w-full bg-[#292929] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#444] disabled:opacity-50"
            >
              Добавить в корзину
            </button>

            {message && (
              <p className="mt-4 text-sm text-[#8a755c]">{message}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
