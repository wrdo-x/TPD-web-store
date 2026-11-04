import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Завершаем локальную сессию,
      // даже если сервер недоступен.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e4de] bg-[#f7f6f2]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Навигация */}
        <nav
          aria-label="Основная навигация"
          className="flex items-center gap-7"
        >
          <Link
            to="/"
            className="text-sm font-medium tracking-wide text-[#242321] transition-colors hover:text-[#918777]"
          >
            Главная
          </Link>

          <Link
            to="/catalog"
            className="text-sm font-medium tracking-wide text-[#242321] transition-colors hover:text-[#918777]"
          >
            Каталог
          </Link>
        </nav>

        {/* Авторизация */}
        <div className="flex items-center gap-5">
          {token ? (
            <>
              <Link
                to="/profile"
                className="hidden text-sm text-[#242321] transition-colors hover:text-[#918777] sm:block"
              >
                {user.name || "Профиль"}
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-[#242321] transition-colors hover:text-[#918777]"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-[#242321] transition-colors hover:text-[#918777]"
              >
                Войти
              </Link>

              <Link
                to="/register"
                className="border border-[#242321] bg-[#242321] px-5 py-2.5 text-sm text-white transition-colors hover:bg-transparent hover:text-[#242321]"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
