import { useEffect, useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  category?: { name: string };
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else throw new Error('Неверный формат данных');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>📦 Каталог товаров</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена (₽)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category?.name || '—'}</td>
                <td>{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}