import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../api";
import AdminProducts from "./AdminProducts";
import AdminProductForm from "./AdminProductForm";

const navigationItems = [
  { label: "Обзор", to: "/admin", icon: "▦" },
  { label: "Товары", to: "/admin/products", icon: "◇" },
  { label: "Добавить товар", to: "/admin/products/new", icon: "+" },
];

// Боковая навигация
function AdminNavigation() {
  const { pathname } = useLocation();

  return (
    <aside className="h-fit rounded-xl border border-[#e9e5de] bg-white p-4 shadow-sm">
      <div className="border-b border-[#eeeae4] px-3 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a18b72]">
          Shop admin
        </p>

        <p className="mt-1 text-sm font-medium text-[#292929]">
          Управление магазином
        </p>
      </div>

      <nav
        aria-label="Навигация администратора"
        className="mt-4 space-y-1"
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                isActive
                  ? "bg-[#292929] font-medium text-white"
                  : "text-[#625e57] hover:bg-[#f8f7f4] hover:text-[#292929]"
              }`}
            >
              <span
                aria-hidden="true"
                className="w-5 text-center text-base"
              >
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// Карточка действия
function AdminActionCard({
  title,
  description,
  to,
  actionLabel,
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-48 flex-col rounded-xl border border-[#e9e5de] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b8a3] hover:shadow-md"
    >
      <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3eee7] text-xl text-[#8f795f]">
        {title === "Товары" ? "◇" : "+"}
      </span>

      <h3 className="text-lg font-semibold text-[#292929]">
        {title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-[#858078]">
        {description}
      </p>

      <span className="mt-5 text-sm font-medium text-[#8f795f] transition group-hover:text-[#292929]">
        {actionLabel} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

// Панель администратора
export default function AdminPanel() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Проверка авторизации и прав администратора
  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/users/me");

        if (!isMounted) return;

        if (response.data.role !== "admin") {
          navigate("/", { replace: true });
          return;
        }

        setAdmin(response.data);
        setStatus("ready");
        setError("");
      } catch (requestError) {
        if (!isMounted) return;

        if (requestError.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        setError(
          requestError.response?.data?.error ||
            "Не удалось проверить права доступа. Проверьте подключение к серверу."
        );

        setStatus("error");
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate, retryCount]);

  // Состояние загрузки
  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f4] px-5">
        <p className="text-sm text-[#858078]">
          Проверяем права доступа...
        </p>
      </main>
    );
  }

  // Ошибка авторизации или подключения
  if (status === "error") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f4] px-5 py-12">
        <div className="w-full max-w-md rounded-xl border border-[#e9e5de] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[#292929]">
            Не удалось открыть панель
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm leading-6 text-[#858078]"
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setError("");
              setStatus("loading");
              setRetryCount((count) => count + 1);
            }}
            className="mt-6 rounded-md bg-[#292929] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#45413c]"
          >
            Повторить попытку
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">

        {/* Заголовок */}
        <header className="mb-9">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#a18b72]">
            Администрирование
          </p>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#292929] md:text-4xl">
                Панель администратора
              </h1>

              <p className="mt-3 text-sm text-[#858078]">
                Управление товарами и содержимым интернет-магазина.
              </p>
            </div>

            <p className="text-sm text-[#625e57]">
              Вы вошли как{" "}
              <span className="font-medium text-[#292929]">
                {admin?.name || admin?.email}
              </span>
            </p>
          </div>
        </header>

        {/* Основная сетка */}
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          <AdminNavigation />

          <section aria-label="Содержимое панели администратора">

            {/* Список товаров */}
            {pathname === "/admin/products" ? (
              <AdminProducts />

            ) : pathname === "/admin/products/new" ? (

              /* Добавление товара */
              <AdminProductForm />

            ) : (

              /* Главная страница */
              <>
                <div className="mb-6 rounded-xl border border-[#e9e5de] bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-xl font-semibold text-[#292929]">
                    Добро пожаловать в панель управления
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#858078]">
                    Здесь вы сможете управлять ассортиментом магазина:
                    просматривать список товаров и добавлять новые позиции
                    в каталог.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <AdminActionCard
                    title="Товары"
                    description="Просматривайте ассортимент магазина и удаляйте неактуальные позиции."
                    to="/admin/products"
                    actionLabel="Перейти к товарам"
                  />

                  <AdminActionCard
                    title="Добавить товар"
                    description="Создавайте новые карточки товаров и добавляйте их в каталог."
                    to="/admin/products/new"
                    actionLabel="Создать товар"
                  />

                </div>
              </>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}
