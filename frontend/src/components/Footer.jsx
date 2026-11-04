import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#292929] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Информация */}
          <div>
            <h3 className="text-lg font-semibold">
              Интернет-магазин одежды
            </h3>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
              Одежда для повседневного гардероба.
              Удобные вещи и универсальные модели.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
              Навигация
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Главная
                </Link>
              </li>

              <li>
                <a href="/#categories" className="transition hover:text-white">
                  Категории
                </a>
              </li>

              <li>
                <a href="/#about" className="transition hover:text-white">
                  О магазине
                </a>
              </li>
            </ul>
          </div>

          {/* Аккаунт */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
              Личный кабинет
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Войти
                </Link>
              </li>

              <li>
                <Link to="/register" className="transition hover:text-white">
                  Регистрация
                </Link>
              </li>

              <li>
                <Link to="/profile" className="transition hover:text-white">
                  Профиль
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Нижняя часть */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Все права защищены.</p>

          <Link to="/" className="transition hover:text-white">
            На главную ↑
          </Link>
        </div>

      </div>
    </footer>
  );
}
