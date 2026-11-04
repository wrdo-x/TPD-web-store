
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<Home />} />

            {/* Каталог товаров */}
            <Route path="/catalog" element={<Catalog />} />

            {/* Страница отдельного товара */}
            <Route path="/product/:id" element={<Product />} />

            {/* Авторизация */}
            <Route path="/login" element={<Login />} />

            {/* Регистрация */}
            <Route path="/register" element={<Register />} />

            {/* Личный кабинет */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
