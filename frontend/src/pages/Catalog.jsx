
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

const categories = [
  "Все",
  "Футболки",
  "Джинсы",
  "Куртки",
  "Аксессуары",
];

const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const [searchParams, setSearchParams] = useSearchParams();

  // Выбранная категория
  const requestedCategory = searchParams.get("category");

  const category = categories.includes(requestedCategory)
    ? requestedCategory
    : "Все";

  // Доступные размеры из товаров
  const availableSizes = useMemo(() => {
    const sizes = new Set(
      products.flatMap((product) =>
        Array.isArray(product.sizes) ? product.sizes : []
      )
    );

    return [...sizes].sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);

      const orderA = indexA === -1 ? sizeOrder.length : indexA;
      const orderB = indexB === -1 ? sizeOrder.length : indexB;

      return orderA - orderB || String(a).localeCompare(String(b));
    });
  }, []);

  // Выбранный размер
  const requestedSize = searchParams.get("size");

  const selectedSize = availableSizes.includes(requestedSize)
    ? requestedSize
    : "";

  // Изменение категории
  const handleCategoryChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === "Все") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", value);
    }

    setSearchParams(nextParams);
  };

  // Изменение размера
  const handleSizeChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value) {
      nextParams.delete("size");
    } else {
      nextParams.set("size", value);
    }

    setSearchParams(nextParams);
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    setSearch("");
    setSort("default");
    setSearchParams({});
  };

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === "Все" ||
        product.category_name === category;

      const matchesSize =
        !selectedSize ||
        (Array.isArray(product.sizes) &&
          product.sizes.includes(selectedSize));

      return matchesSearch && matchesCategory && matchesSize;
    });

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [search, category, selectedSize, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "Все" ||
    selectedSize !== "" ||
    sort !== "default";

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">

        {/* Заголовок */}
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
            Коллекция одежды
          </p>

          <h1 className="text-4xl font-semibold text-[#292929] md:text-5xl">
            Каталог
          </h1>

          <p className="mt-4 text-sm text-gray-500">
            Найди одежду для своего повседневного гардероба.
          </p>
        </div>

        {/* Поиск и сортировка */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            aria-label="Поиск товаров"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] sm:max-w-md"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Сортировка товаров"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          >
            <option value="default">По умолчанию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>

        </div>

        {/* Фильтр категорий */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[#292929]">
            Категория
          </h2>

          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleCategoryChange(item)}
                aria-pressed={category === item}
                className={`rounded-full border px-5 py-2.5 text-sm transition ${
                  category === item
                    ? "border-[#292929] bg-[#292929] text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:border-[#292929]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Фильтр размеров */}
        <div className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-[#292929]">
            Размер
          </h2>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => handleSizeChange("")}
              aria-pressed={!selectedSize}
              className={`h-11 min-w-11 rounded-md border px-4 text-sm transition ${
                !selectedSize
                  ? "border-[#292929] bg-[#292929] text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-[#292929]"
              }`}
            >
              Все
            </button>

            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                aria-pressed={selectedSize === size}
                className={`h-11 min-w-11 rounded-md border px-4 text-sm font-medium transition ${
                  selectedSize === size
                    ? "border-[#292929] bg-[#292929] text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:border-[#292929]"
                }`}
              >
                {size}
              </button>
            ))}

          </div>
        </div>

        {/* Количество товаров и сброс фильтров */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Найдено товаров: {filteredProducts.length}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm text-[#9b8063] transition hover:text-[#292929] hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>

        {/* Товары */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white px-5 py-16 text-center">
            <h2 className="text-xl font-medium text-gray-800">
              Товары не найдены
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Попробуй изменить параметры поиска или выбрать другой размер.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 text-sm font-medium text-[#9b8063] hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
