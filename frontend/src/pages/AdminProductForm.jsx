import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
};

export default function AdminProductForm() {
  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Получаем категории из списка товаров
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
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
          throw new Error("Некорректный ответ сервера");
        }

        // Формируем список уникальных категорий
        const categoryMap = new Map();

        items.forEach((product) => {
          if (
            product.category_id != null &&
            product.category_name
          ) {
            categoryMap.set(String(product.category_id), {
              id: String(product.category_id),
              name: product.category_name,
            });
          }
        });

        const loadedCategories = Array.from(
          categoryMap.values()
        );

        setCategories(loadedCategories);

        if (loadedCategories.length > 0) {
          setForm((current) => ({
            ...current,
            category_id:
              current.category_id || loadedCategories[0].id,
          }));
        } else {
          setCategoriesError(
            "Не удалось определить категории. В каталоге пока нет товаров."
          );
        }
      } catch (requestError) {
        if (!isMounted) return;

        setCategoriesError(
          requestError.response?.data?.error ||
            "Не удалось загрузить категории. Проверьте подключение к серверу."
        );
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Изменение полей формы
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Отправка формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(form.price);

    if (!form.name.trim()) {
      setError("Введите название товара.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Введите корректную цену больше нуля.");
      return;
    }

    if (!form.category_id) {
      setError("Выберите категорию товара.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/products", {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category_id: Number(form.category_id),
      });

      setSuccess("Товар успешно добавлен!");

      setForm((current) => ({
        ...initialForm,
        category_id: current.category_id,
      }));
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Необходимо авторизоваться заново.");
      } else if (status === 403) {
        setError(
          "У вас недостаточно прав для добавления товаров."
        );
      } else {
        setError(
          requestError.response?.data?.error ||
            "Не удалось добавить товар. Попробуйте ещё раз."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e9e5de] bg-white p-6 shadow-sm sm:p-8">

      {/* Заголовок */}
      <div className="mb-8">
        <Link
          to="/admin/products"
          className="text-sm text-[#8f795f] transition hover:text-[#292929]"
        >
          ← Вернуться к товарам
        </Link>

        <h2 className="mt-5 text-2xl font-semibold text-[#292929]">
          Добавить товар
        </h2>

        <p className="mt-2 text-sm text-[#858078]">
          Заполните информацию о новом товаре.
        </p>
      </div>

      {/* Уведомления */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Название */}
        <div>
          <label
            htmlFor="product-name"
            className="mb-2 block text-sm font-medium text-[#292929]"
          >
            Название товара *
          </label>

          <input
            id="product-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Например, Футболка белая"
            maxLength={150}
            required
            className="w-full rounded-lg border border-[#e5e0d8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] focus:ring-2 focus:ring-[#a18b72]/10"
          />
        </div>

        {/* Описание */}
        <div>
          <label
            htmlFor="product-description"
            className="mb-2 block text-sm font-medium text-[#292929]"
          >
            Описание товара
          </label>

          <textarea
            id="product-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Расскажите о товаре..."
            rows={5}
            className="w-full resize-y rounded-lg border border-[#e5e0d8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] focus:ring-2 focus:ring-[#a18b72]/10"
          />
        </div>

        {/* Цена */}
        <div>
          <label
            htmlFor="product-price"
            className="mb-2 block text-sm font-medium text-[#292929]"
          >
            Цена (₽) *
          </label>

          <input
            id="product-price"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="1500"
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-lg border border-[#e5e0d8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] focus:ring-2 focus:ring-[#a18b72]/10"
          />
        </div>

        {/* Категория */}
        <div>
          <label
            htmlFor="product-category"
            className="mb-2 block text-sm font-medium text-[#292929]"
          >
            Категория *
          </label>

          {isLoadingCategories ? (
            <p className="text-sm text-[#858078]">
              Загружаем категории...
            </p>
          ) : categoriesError ? (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {categoriesError}
            </p>
          ) : (
            <select
              id="product-category"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[#e5e0d8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a18b72] focus:ring-2 focus:ring-[#a18b72]/10"
            >
              <option value="" disabled>
                Выберите категорию
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex flex-col gap-3 border-t border-[#eeeae4] pt-6 sm:flex-row">

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCategories ||
              categories.length === 0
            }
            className="rounded-lg bg-[#292929] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#45413c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Добавление..."
              : "Добавить товар"}
          </button>

          <Link
            to="/admin/products"
            className="rounded-lg border border-[#e5e0d8] px-6 py-3 text-center text-sm font-medium text-[#625e57] transition hover:bg-[#f8f7f4]"
          >
            Отмена
          </Link>

        </div>
      </form>
    </div>
  );
}
