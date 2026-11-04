
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/profile");
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Не удалось создать аккаунт. Попробуйте ещё раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-[#dedbd5] bg-white px-4 py-3 text-sm text-[#292929] outline-none transition placeholder:text-[#aaa49a] focus:border-[#a18b72] focus:ring-2 focus:ring-[#a18b72]/10";

  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-[#f8f7f4] px-5 py-14">

      <div className="w-full max-w-[460px] rounded-xl border border-[#e9e5de] bg-white px-7 py-9 shadow-sm sm:px-10 sm:py-11">

        {/* Заголовок */}
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#a18b72]">
            Личный кабинет
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#292929]">
            Создать аккаунт
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#858078]">
            Зарегистрируйтесь, чтобы пользоваться возможностями магазина.
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Имя */}
          <div>
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-medium text-[#393630]"
            >
              Имя
            </label>

            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-medium text-[#393630]"
            >
              Электронная почта
            </label>

            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className={inputClass}
            />
          </div>

          {/* Пароль */}
          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm font-medium text-[#393630]"
            >
              Пароль
            </label>

            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className={`${inputClass} pr-20`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#918777] hover:text-[#292929]"
              >
                {showPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
          </div>

          {/* Повтор пароля */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-medium text-[#393630]"
            >
              Повторите пароль
            </label>

            <div className="relative">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                className={`${inputClass} pr-20`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#918777] hover:text-[#292929]"
              >
                {showConfirmPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
          </div>

          {/* Кнопка регистрации */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full rounded-md bg-[#292929] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#45413c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
          </button>

        </form>

        {/* Переход ко входу */}
        <div className="mt-8 border-t border-[#eeeae4] pt-6 text-center">
          <p className="text-sm text-[#858078]">
            Уже есть аккаунт?
            {" "}
            <Link
              to="/login"
              className="font-medium text-[#292929] underline underline-offset-4 transition hover:text-[#a18b72]"
            >
              Войти
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
