import { useEffect, useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  category?: { name: string };
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Проверка, что нам пришел именно массив
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          throw new Error('Сервер вернул неверный формат данных');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>📦 Каталог товаров</h1>
      
      {loading && <p>Загрузка...</p>}
      
      {error && (
        <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Артикул (SKU)</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена (₽)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category?.name || 'Без категории'}</td>
                <td>{product.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;