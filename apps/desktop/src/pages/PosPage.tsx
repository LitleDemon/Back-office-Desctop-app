import { useState, useEffect } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientCode, setClientCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Загружаем товары при открытии кассы
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setMessage({ text: 'Ошибка загрузки товаров', type: 'error' }));
  }, []);

  // Добавление товара в корзину
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setMessage(null);
  };

  // Удаление из корзины
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Итоговая сумма
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.product.price) * item.qty, 0);

  // Фильтрация товаров
  const filteredProducts = products.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) || 
      p.sku.toLowerCase().includes(searchLower)
    );
  });

  // Оплата
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/pos/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.product.id, qty: i.qty })),
          clientCode: clientCode || undefined 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ text: data.message, type: 'success' });
      setCart([]); 
      setClientCode('');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)' }}>
      
      {/* ЛЕВАЯ КОЛОНКА: Список товаров */}
      <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
        <h2>📦 Товары</h2>
        
        {/* Поле поиска */}
        <input 
          type="text" 
          placeholder="🔍 Поиск по названию или артикулу..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            marginTop: '15px', 
            padding: '12px', 
            fontSize: '16px', 
            border: '2px solid #007bff', 
            borderRadius: '6px',
            outline: 'none'
          }}
        />

        {/* Сетка товаров */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? (
            <p style={{ color: '#999' }}>Ничего не найдено</p>
          ) : (
            filteredProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                style={{ width: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', background: '#f9f9f9', textAlign: 'center' }}
              >
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <div style={{ color: '#666', fontSize: '12px' }}>Арт: {p.sku}</div>
                <div style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '10px' }}>{p.price} ₽</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: Корзина и оплата */}
      <div style={{ width: '400px', background: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
        <h2>🛒 Чек</h2>
        
        <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px' }}>
          {cart.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>Чек пуст. Добавьте товары.</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.product.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.qty} шт. x {item.product.price} ₽</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{(Number(item.product.price) * item.qty).toFixed(2)} ₽</div>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Удалить</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Блок оплаты */}
        <div style={{ marginTop: '20px', borderTop: '2px solid #2c3e50', paddingTop: '20px' }}>
          <h3 style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span>Итого:</span>
            <span>{totalAmount.toFixed(2)} ₽</span>
          </h3>

          <input 
            type="text" 
            placeholder="Код клиента (необязательно)" 
            value={clientCode} 
            onChange={(e) => setClientCode(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />

          <button 
            onClick={handleCheckout} 
            disabled={loading || cart.length === 0}
            style={{ width: '100%', padding: '15px', fontSize: '18px', cursor: (loading || cart.length === 0) ? 'not-allowed' : 'pointer', background: (loading || cart.length === 0) ? '#ccc' : '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
          >
            {loading ? 'Обработка...' : '💳 Оплатить'}
          </button>

          {message && (
            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9', color: message.type === 'error' ? '#c62828' : '#2e7d32', fontSize: '14px', textAlign: 'center' }}>
              {message.text}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}