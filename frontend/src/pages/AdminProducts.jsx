import { useEffect, useState } from "react";
import api from "../api";

// Форматирование цены
function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Получение товаров с Backend
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await api.get("/products", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        if (!isMounted) return;

        const items = response.data?.items;

        if (!Array.isArray(items)) {
          throw new Error("Некорректный формат ответа сервера");
        }

        setProducts(items);
        setError("");
      } catch (requestError) {
        if (!isMounted) return;

        setError(
          requestError.response?.data?.error ||
            "Не удалось загрузить товары. Проверьте подключение к серверу."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  // Повторная загрузка
  const handleRetry = () => {
    setError("");
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Удаление товара
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Вы действительно хотите удалить товар «${product.name}»?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");

    try {
      await api.delete(`/products/${product.id}`);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (deleteError) {
      const status = deleteError.response?.status;

      if (status === 401) {
        setError("Необходимо авторизоваться заново.");
      } else if (status === 403) {
        setError("У вас недостаточно прав для удаления товаров.");
      } else {
        setError(
          deleteError.response?.data?.error ||
            "Не удалось удалить товар. Попробуйте ещё раз."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-[#e9e5de] bg-white p-6 shadow-sm sm:p-8">

      {/* Заголовок */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#292929]">
            Товары
          </h2>

          <p className="mt-2 text-sm text-[#858078]">
            Управление ассортиментом интернет-магазина.
          </p>
        </div>

        {!isLoading && (
          <span className="text-sm text-[#858078]">
            Всего товаров: {products.length}
          </span>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Загрузка */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#858078]">
          Загружаем товары...
        </div>
      ) : products.length === 0 && !error ? (

        /* Пустой список */
        <div className="py-12 text-center">
          <p className="text-lg font-medium text-[#292929]">
            Товаров пока нет
          </p>

          <p className="mt-2 text-sm text-[#858078]">
            Добавленные товары появятся здесь.
          </p>
        </div>

      ) : (

        /* Таблица */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">

            <thead>
              <tr className="border-b border-[#eeeae4] text-xs uppercase tracking-wider text-[#a18b72]">
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">Товар</th>
                <th className="px-4 py-4">Категория</th>
                <th className="px-4 py-4">Цена</th>
                <th className="px-4 py-4 text-right">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#f0ede8] transition hover:bg-[#faf9f7]"
                >
                  <td className="px-4 py-4 text-sm text-[#858078]">
                    {product.id}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f3eee7] text-xs text-[#a18b72]">
                          Фото
                        </div>
                      )}

                      <span className="text-sm font-medium text-[#292929]">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-[#625e57]">
                    {product.category_name || "Без категории"}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-[#292929]">
                    {formatPrice(product.price)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Удалить ${product.name}`}
                    >
                      {deletingId === product.id
                        ? "Удаление..."
                        : "Удалить"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* Повторная загрузка при ошибке */}
      {!isLoading && error && (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 rounded-lg bg-[#292929] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#45413c]"
        >
          Повторить загрузку
        </button>
      )}
    </div>
  );
}
