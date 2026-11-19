import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
};

const productsUrl = "/admin/products";

// Форма добавления товара
export default function AdminProductForm() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Загрузка категорий с Backend
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await api.get("/products", {
          params: {
            page: 1,
            limit: 100,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const items = response.data?.items;

        if (!Array.isArray(items)) {
          throw new Error("Некорректный ответ сервера.");
        }

        // Получаем категории из существующих товаров
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
            "Категории не найдены. Для добавления товара необходимо наличие категорий в базе данных."
          );
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;

        setCategoriesError(
          requestError.response?.data?.error ||
            requestError.message ||
            "Не удалось загрузить категории. Проверьте подключение к серверу."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      controller.abort();
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

  // Выбор фотографии
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Выберите изображение в формате JPG, PNG или WEBP."
      );
      event.target.value = "";
      return;
    }

    const maxSize = 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Размер фотографии не должен превышать 1 МБ."
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageFile(file);
        setImagePreview(reader.result);
        setImageName(file.name);
      } else {
        setImageFile(null);
        setImagePreview("");
        setError("Не удалось прочитать фотографию.");
      }
    };

    reader.onerror = () => {
      setImageFile(null);
      setImagePreview("");
      setError("Ошибка при загрузке фотографии.");
    };

    reader.readAsDataURL(file);
  };

  // Удаление выбранной фотографии
  const handleRemoveImage = () => {
    setImagePreview("");
    setImageName("");
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category_id: Number(form.category_id),
    };

    const hasImage = Boolean(imageFile);

    setIsSubmitting(true);

    try {
      // Отправляем данные товара на Backend
      await api.post("/products", productData);

      if (hasImage) {
        setSuccess(
          "Товар успешно добавлен! Фотография пока не сохранена на сервере, поскольку загрузка изображений ещё не реализована на Backend."
        );
      } else {
        setSuccess("Товар успешно добавлен!");
      }

      // Очищаем форму
      setForm((current) => ({
        ...initialForm,
        category_id: current.category_id,
      }));

      handleRemoveImage();
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
          to={productsUrl}
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

      {/* Информация о фотографиях */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Фотографию можно выбрать и посмотреть перед добавлением.
        Сохранение изображения на сервер пока не подключено.
      </div>

      {/* Ошибка */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Успешное добавление */}
      {success && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}

          <p className="mt-3">
            <Link
              to={productsUrl}
              className="font-medium underline"
            >
              Посмотреть список товаров
            </Link>
          </p>
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

        {/* Фотография */}
        <div>
          <label
            htmlFor="product-image"
            className="mb-2 block text-sm font-medium text-[#292929]"
          >
            Фотография товара
          </label>

          <div className="rounded-xl border border-dashed border-[#cfc5b8] bg-[#faf9f7] p-5">

            {imagePreview ? (
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">

                <img
                  src={imagePreview}
                  alt="Предпросмотр товара"
                  className="h-40 w-40 rounded-lg border border-[#e9e5de] bg-white object-cover"
                />

                <div>
                  <p className="max-w-xs break-all text-sm font-medium text-[#292929]">
                    {imageName}
                  </p>

                  <p className="mt-1 text-xs text-[#858078]">
                    Фотография выбрана
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Удалить фотографию
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center py-5 text-center">

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0eae1] text-2xl text-[#8f795f]">
                  +
                </div>

                <p className="text-sm font-medium text-[#292929]">
                  Добавьте фотографию товара
                </p>

                <p className="mt-2 text-xs text-[#858078]">
                  JPG, PNG или WEBP. Максимальный размер — 1 МБ.
                </p>

              </div>
            )}

            <input
              ref={fileInputRef}
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="mt-4 block w-full text-sm text-[#625e57] file:mr-4 file:rounded-lg file:border-0 file:bg-[#292929] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#45413c]"
            />

          </div>
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
            <p role="alert" className="text-sm text-red-600">
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
                <option
                  key={category.id}
                  value={category.id}
                >
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
            to={productsUrl}
            className="rounded-lg border border-[#e5e0d8] px-6 py-3 text-center text-sm font-medium text-[#625e57] transition hover:bg-[#f8f7f4]"
          >
            Отмена
          </Link>

        </div>
      </form>
    </div>
  );
}
