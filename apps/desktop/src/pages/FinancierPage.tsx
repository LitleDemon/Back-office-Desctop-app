import { useState, useEffect } from 'react';

interface Order {
  id: string;
  total: string;
  createdAt: string;
  source: string;
  customer?: { fullName: string };
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  averageCheck: number;
}

export default function FinancierPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/finances/summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка доступа к аналитике');
        return res.json();
      })
      .then(data => {
        setStats(data.stats);
        setOrders(data.recentOrders);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка аналитики...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>📊 Финансовая аналитика</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Режим просмотра (только чтение)</p>

      {/* Карточки со статистикой */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Общая выручка</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2e7d32' }}>
            {stats?.totalRevenue.toFixed(2)} ₽
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Количество чеков</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {stats?.totalOrders}
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Средний чек</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>
            {stats?.averageCheck.toFixed(2)} ₽
          </div>
        </div>
      </div>

      {/* Таблица последних заказов */}
      <h2 style={{ marginBottom: '15px' }}>Последние продажи</h2>
      <table>
        <thead>
          <tr>
            <th>Дата и время</th>
            <th>Тип</th>
            <th>Клиент</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
              <td>
                <span style={{ background: o.source === 'POS' ? '#e3f2fd' : '#f3e5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {o.source}
                </span>
              </td>
              <td>{o.customer ? o.customer.fullName : 'Аноним'}</td>
              <td style={{ fontWeight: 'bold' }}>{o.total} ₽</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Продаж пока нет</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}