import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          {product.image ? (
            <img src={product.image} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.noImage}>Нет фото</div>
          )}
        </div>
        
        <div className={styles.body}>
          <span className={styles.category}>{product.category_name}</span>
          <h2 className={styles.title}>{product.name}</h2>
          <p className={styles.price}>{product.price} ₽</p>
        </div>
      </div>
    </Link>
  );
}