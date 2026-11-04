
import { Link } from "react-router-dom";

const categories = [
  {
    number: "01",
    title: "Верхняя одежда",
    description: "Куртки, пальто и жилеты",
    color: "bg-[#e8e1d8]",
    filter: "Куртки",
  },
  {
    number: "02",
    title: "Футболки",
    description: "Базовые модели на каждый день",
    color: "bg-[#dfe3df]",
    filter: "Футболки",
  },
  {
    number: "03",
    title: "Брюки",
    description: "Комфорт и свободный крой",
    color: "bg-[#e7e2dd]",
    filter: "Джинсы",
  },
  {
    number: "04",
    title: "Аксессуары",
    description: "Детали для завершения образа",
    color: "bg-[#e4e1da]",
    filter: "Аксессуары",
  },
];

export default function Home() {
  return (
    <div className="bg-[#f8f7f4] text-[#292929]">

      {/* Первый экран */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          <div>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Новая коллекция / 2026
            </p>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Одежда
              <span className="block text-[#a18b72]">
                на каждый день.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-gray-500">
              Комфортные модели, универсальные фасоны
              и вещи, которые легко вписать
              в повседневный гардероб.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/catalog"
                className="bg-[#292929] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#484848]"
              >
                Смотреть каталог →
              </Link>

              <a
                href="#about"
                className="border border-gray-300 px-7 py-4 text-sm transition hover:border-gray-700"
              >
                О магазине
              </a>
            </div>
          </div>

          {/* Декоративный блок */}
          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden rounded-xl bg-[#e9e4dc] p-8 md:min-h-[460px]">

            <div className="absolute left-8 top-8 text-xs tracking-widest text-gray-500">
              COLLECTION / 01
            </div>

            <div className="absolute h-56 w-40 rotate-[-12deg] rounded-2xl border border-[#c4b9a9] bg-[#f6f3ed] shadow-xl sm:h-64 sm:w-48"></div>

            <div className="absolute h-56 w-40 rotate-[10deg] rounded-2xl border border-[#b7a995] bg-[#d8cbb9] shadow-xl sm:h-64 sm:w-48"></div>

            <div className="relative z-10 flex h-52 w-40 items-center justify-center rounded-2xl border border-white/70 bg-[#292929] text-center text-white shadow-2xl sm:h-60 sm:w-48">
              <div>
                <span className="block text-5xl font-light">01</span>
                <span className="mt-3 block text-[10px] tracking-[0.2em]">
                  COLLECTION
                </span>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 text-xs text-gray-500">
              EVERYDAY CLOTHING
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section
        id="categories"
        className="border-t border-gray-200 bg-white px-5 py-16 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                Выбирай своё
              </p>

              <h2 className="text-3xl font-semibold md:text-4xl">
                Категории
              </h2>
            </div>

            <span className="hidden text-sm text-gray-400 sm:block">
              04 категории
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) => (
              <Link
                key={category.number}
                to={`/catalog?category=${encodeURIComponent(category.filter)}`}
                aria-label={`Перейти в категорию ${category.title}`}
                className={`${category.color} group flex min-h-[230px] flex-col justify-between rounded-xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a18b72]`}
              >
                <span className="text-sm text-gray-500">
                  {category.number}
                </span>

                <div>
                  <h3 className="text-xl font-semibold">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {category.description}
                  </p>

                  <span className="mt-5 inline-block text-xl transition-transform group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* О магазине */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8"
      >
        <p className="text-xs uppercase tracking-widest text-gray-400">
          О магазине
        </p>

        <h2 className="mt-5 max-w-2xl text-3xl font-medium leading-snug md:text-4xl">
          Простая одежда, комфортные
          решения и стиль на каждый день.
        </h2>
      </section>

    </div>
  );
}
