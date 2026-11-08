import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  
  // Достаем пользователя из хранилища браузера
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Логика проверки прав
  // Если isSuperAdmin = true, то доступно всё.
  // Иначе проверяем, есть ли нужная роль в массиве roles
  const isSuperAdmin = user?.isSuperAdmin === true;
  const roles = user?.roles || [];
  
  const canAccessPos = isSuperAdmin || roles.includes('CASHIER');
  const canAccessWarehouse = isSuperAdmin || roles.includes('LOGIST');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Боковое меню */}
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>ShopEcosystem</h2>
        
        {/* Профиль пользователя */}
        <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '30px', borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', marginBottom: '5px' }}>
            {user?.fullName || 'Гость'}
          </div>
          <div>{isSuperAdmin ? '👑 Суперадмин' : `Роли: ${roles.length > 0 ? roles.join(', ') : 'Нет'}`}</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 Главная</Link>
          <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>📦 Каталог</Link>
          
          {/* Показываем Кассу только тем, у кого есть права */}
          {canAccessPos && (
            <Link to="/pos" style={{ color: 'white', textDecoration: 'none' }}>🛒 Касса</Link>
          )}
          
          {/* Показываем Склад только логистам и админам */}
          {canAccessWarehouse && (
            <Link to="/warehouse" style={{ color: 'white', textDecoration: 'none' }}>🏭 Склад</Link>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            🚪 Выйти
          </button>
        </div>
      </aside>

      {/* Рабочая область */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}