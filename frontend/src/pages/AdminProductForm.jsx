import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const initialForm = { name: "", description: "", price: "", category_id: "" };
const productsUrl = "/admin/products";

export default function AdminProductForm() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Теперь храним массивы для нескольких фото
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const loadCategories = async () => {
      try {
        const response = await api.get("/products", {
          params: { page: 1, limit: 100 },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const items = response.data?.items;
        if (!Array.isArray(items))
          throw new Error("Некорректный ответ сервера.");

        const categoryMap = new Map();
        items.forEach((product) => {
          if (product.category_id != null && product.category_name) {
            categoryMap.set(String(product.category_id), {
              id: String(product.category_id),
              name: product.category_name,
            });
          }
        });

        const loadedCategories = Array.from(categoryMap.values());
        setCategories(loadedCategories);

        if (loadedCategories.length > 0) {
          setForm((current) => ({
            ...current,
            category_id: current.category_id || loadedCategories[0].id,
          }));
        } else {
          setCategoriesError("Категории не найдены.");
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setCategoriesError(
          requestError.message || "Не удалось загрузить категории.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingCategories(false);
      }
    };
    loadCategories();
    return () => controller.abort();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Обработка выбора нескольких фото
  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const validFiles = [];
    const newPreviews = [];

    // Проверяем лимит (макс 5 файлов)
    if (files.length > 5) {
      setError("Можно загрузить не более 5 фотографий за раз.");
      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Файл ${file.name} имеет недопустимый формат.`);
        continue;
      }
      if (file.size > 1024 * 1024) {
        setError(`Файл ${file.name} превышает 1 МБ.`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImageFiles(validFiles);
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    // Освобождаем память браузера
    URL.revokeObjectURL(newPreviews[index]);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);
    if (!form.name.trim()) return setError("Введите название товара.");
    if (!Number.isFinite(price) || price <= 0)
      return setError("Введите корректную цену больше нуля.");
    if (!form.category_id) return setError("Выберите категорию товара.");

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", String(price));
    formData.append("category_id", String(Number(form.category_id)));

    // Добавляем все файлы под одним ключом "images" (как в роутере)
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    setIsSubmitting(true);

    try {
      await api.post("/products", formData);
      setSuccess("Товар успешно добавлен!");
      setForm((current) => ({
        ...initialForm,
        category_id: current.category_id,
      }));

      // Очищаем картинки
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Не удалось добавить товар.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e9e5de] bg-white p-6 shadow-sm sm:p-8">
      {/* ... Блок заголовка и ошибок оставляем как было ... */}
      <div className="mb-8">
        <Link
          to={productsUrl}
          className="text-sm text-[#8f795f] hover:text-[#292929]"
        >
          ← Вернуться к товарам
        </Link>
        <h2 className="mt-5 text-2xl font-semibold text-[#292929]">
          Добавить товар
        </h2>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... Поля name, description оставляем как было ... */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#292929]">
            Название товара *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#e5e0d8] px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#292929]">
            Описание
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full resize-y rounded-lg border border-[#e5e0d8] px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          />
        </div>

        {/* БЛОК ЗАГРУЗКИ НЕСКОЛЬКИХ ФОТО */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#292929]">
            Фотографии товара (до 5 шт.)
          </label>
          <div className="rounded-xl border border-dashed border-[#cfc5b8] bg-[#faf9f7] p-5">
            {/* Превью выбранных картинок */}
            {imagePreviews.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Превью ${index + 1}`}
                      className="h-32 w-full rounded-lg border border-[#e9e5de] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Инпут для выбора файлов */}
            <input
              ref={fileInputRef}
              type="file"
              multiple // <-- РАЗРЕШАЕМ ВЫБОР НЕСКОЛЬКИХ ФАЙЛОВ
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImagesChange}
              className="block w-full text-sm text-[#625e57] file:mr-4 file:rounded-lg file:border-0 file:bg-[#292929] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#45413c]"
            />
            <p className="mt-2 text-xs text-[#858078]">
              JPG, PNG или WEBP. Максимум 5 файлов по 1 МБ.
            </p>
          </div>
        </div>

        {/* ... Поля price, category оставляем как было ... */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#292929]">
            Цена (₽) *
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#e5e0d8] px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#292929]">
            Категория *
          </label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#e5e0d8] px-4 py-3 text-sm outline-none focus:border-[#a18b72]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#eeeae4] pt-6 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#292929] px-6 py-3 text-sm font-medium text-white hover:bg-[#45413c] disabled:opacity-50"
          >
            {isSubmitting ? "Добавление..." : "Добавить товар"}
          </button>
          <Link
            to={productsUrl}
            className="rounded-lg border border-[#e5e0d8] px-6 py-3 text-center text-sm font-medium text-[#625e57] hover:bg-[#f8f7f4]"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
