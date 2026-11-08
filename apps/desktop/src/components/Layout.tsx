import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Боковое меню */}
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '30px' }}>ShopEcosystem</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 Главная</Link>
          <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>📦 Каталог</Link>
          <Link to="/pos" style={{ color: '#95a5a6', textDecoration: 'none' }}>🛒 Касса (в разработке)</Link>
          <Link to="/warehouse" style={{ color: '#95a5a6', textDecoration: 'none' }}>🏭 Склад (в разработке)</Link>
        </nav>
      </aside>

      {/* Рабочая область */}
      <main style={{ flex: 1, padding: '20px' }}>
        {/* Outlet — это место, куда будут подставляться страницы */}
        <Outlet />
      </main>
    </div>
  );
}