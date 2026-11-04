import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  const hasImage = product.image && !imageError;

  const price = Number(product.price);

  const formattedPrice = Number.isFinite(price)
    ? `${new Intl.NumberFormat("ru-RU").format(price)} ₽`
    : "Цена не указана";

  // Автоматический номер товара: 01, 02, 03...
  const productNumber = String(product.id).padStart(2, "0");

  return (
    <Link
      to={`/product/${product.id}`}
      className={styles.link}
      aria-label={`Открыть товар ${product.name}`}
    >
      <article className={styles.card}>

        {/* Фотография или заглушка */}
        <div className={styles.imageWrapper}>
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderNumber}>
                {productNumber}
              </span>

              <span className={styles.placeholderLabel}>
                Фото товара
              </span>
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className={styles.body}>

          <span className={styles.category}>
            {product.category_name || "Одежда"}
          </span>

          <h2 className={styles.title}>
            {product.name || "Название товара"}
          </h2>

          <div className={styles.bottom}>
            <p className={styles.price}>
              {formattedPrice}
            </p>

            <span className={styles.arrow}>
              →
            </span>
          </div>

        </div>
      </article>
    </Link>
  );
}
