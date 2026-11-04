import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="w-32 hidden md:block"></div>

          <nav className="flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Главная
            </Link>
          </nav>

          <div className="flex items-center justify-end space-x-4 w-auto md:w-32">
            {token ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition hidden md:block"
                >
                  {user.name || "Профиль"}
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-sm transition"
                >
                  Вход
                </Link>
                <Link to="/register">
                  <Button variant="primary">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
