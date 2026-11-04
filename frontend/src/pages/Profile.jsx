import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Card from "../components/ui/Card";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        setUser(res.data);
        setName(res.data.name || "");
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.patch("/users/me", {
        name,
        phone,
        address,
      });

      setUser(res.data);
      setMessage("Профиль успешно обновлен!");

      localStorage.setItem("user", JSON.stringify(res.data));
      window.location.reload();
    } catch {
      setMessage("Ошибка при сохранении");
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 pb-12">
      <Card className="p-8">
        <div className="flex items-center space-x-6 mb-8 border-b pb-6">
          <div className="avatar-circle">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.name || "Пользователь"}
            </h2>

            <p className="text-gray-500">
              {user.email}
            </p>

            <span className="inline-block mt-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium uppercase">
              Роль: {user.role}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Личные данные
        </h3>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <Input
            label="Имя"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Телефон"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
          />

          <Textarea
            label="Адрес доставки"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="3"
            placeholder="Город, улица, дом, квартира"
          />

          <Button type="submit" variant="primary" className="mt-4">
            Сохранить изменения
          </Button>
        </form>
      </Card>
    </div>
  );
}
