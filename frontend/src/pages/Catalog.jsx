import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import api from "../api";

const categories = ["Все", "Футболки", "Джинсы", "Куртки", "Аксессуары"];

const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const PRODUCTS_PER_PAGE = 8;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function Catalog() {
  const [dbProducts, setDbProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Запрашиваем все товары
        const response = await api.get("/products?limit=100");
        setDbProducts(response.data.items || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить товары. Проверьте подключение.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const requestedCategory = searchParams.get("category");
  const category = categories.includes(requestedCategory)
    ? requestedCategory
    : "Все";

  const availableSizes = useMemo(() => {
    const sizes = new Set();
    dbProducts.forEach((product) => {
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach((s) => sizes.add(s));
      }
    });
    return [...sizes].sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);
      const orderA = indexA === -1 ? sizeOrder.length : indexA;
      const orderB = indexB === -1 ? sizeOrder.length : indexB;
      return orderA - orderB || String(a).localeCompare(String(b));
    });
  }, [dbProducts]);

  const requestedSize = searchParams.get("size");
  const selectedSize = availableSizes.includes(requestedSize)
    ? requestedSize
    : "";

  const requestedPage = Number(searchParams.get("page") || 1);
  const validRequestedPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const handleCategoryChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === "Все") nextParams.delete("category");
    else nextParams.set("category", value);
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handleSizeChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value) nextParams.delete("size");
    else nextParams.set("size", value);
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    if (searchParams.has("page")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("page");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSortChange = (value) => {
    setSort(value);
    if (searchParams.has("page")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("page");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSort("default");
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let result = dbProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesCategory =
        category === "Все" || product.category_name === category;
      const matchesSize =
        !selectedSize ||
        (Array.isArray(product.sizes) && product.sizes.includes(selectedSize));
      return matchesSearch && matchesCategory && matchesSize;
    });

    if (sort === "price-asc")
      result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc")
      result.sort((a, b) => Number(b.price) - Number(a.price));

    return result;
  }, [dbProducts, search, category, selectedSize, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const currentPage = Math.min(validRequestedPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    if (page === 1) nextParams.delete("page");
    else nextParams.set("page", String(page));
    setSearchParams(nextParams);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "Все" ||
    selectedSize !== "" ||
    sort !== "default";
  const paginationItems = getPaginationItems(currentPage, totalPages);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f4] px-5">
        <p className="text-sm text-[#858078]">Загружаем каталог...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f7f4] px-5">
        <h2 className="text-xl font-medium text-[#292929]">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#292929] px-6 py-3 text-sm text-white transition hover:bg-[#45413c]"
        >
          Обновить
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
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

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] sm:max-w-md"
          />
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          >
            <option value="default">По умолчанию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </div>

        <div className="mb-8 max-w-sm">
          <label className="mb-3 block text-sm font-semibold text-[#292929]">
            Категория
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#292929] outline-none focus:border-[#a18b72]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {availableSizes.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-semibold text-[#292929]">
              Размер
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSizeChange("")}
                className={`h-11 min-w-11 rounded-md border px-4 text-sm transition ${!selectedSize ? "border-[#292929] bg-[#292929] text-white" : "border-gray-300 bg-white text-gray-600 hover:border-[#292929]"}`}
              >
                Все
              </button>
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`h-11 min-w-11 rounded-md border px-4 text-sm font-medium transition ${selectedSize === size ? "border-[#292929] bg-[#292929] text-white" : "border-gray-300 bg-white text-gray-600 hover:border-[#292929]"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white px-5 py-16 text-center">
            <h2 className="text-xl font-medium text-gray-800">
              Товары не найдены
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Попробуй изменить параметры поиска.
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

        {totalPages > 1 && (
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#625e57] transition hover:border-[#292929] disabled:opacity-40"
            >
              Назад
            </button>
            {paginationItems.map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  className={`h-10 min-w-10 rounded-lg border px-3 text-sm transition ${currentPage === item ? "border-[#292929] bg-[#292929] text-white" : "border-gray-200 bg-white text-[#625e57] hover:border-[#292929]"}`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#625e57] transition hover:border-[#292929] disabled:opacity-40"
            >
              Вперёд
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
