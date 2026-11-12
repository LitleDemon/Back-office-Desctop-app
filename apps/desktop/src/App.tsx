import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage'; 
import FinancierPage from './pages/FinancierPage';

// Проверка авторизации
const isAuthenticated = () => !!localStorage.getItem('token');

// Проверка ролей (гард для конкретных страниц)
const hasRole = (allowedRoles: string[]) => {
  const userString = localStorage.getItem('user');
  if (!userString) return false;
  
  const user = JSON.parse(userString);
  if (user.isSuperAdmin) return true; // Суперадмин может всё
  
  return user.roles.some((role: string) => allowedRoles.includes(role));
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
          <Route 
             path="/" 
            element={isAuthenticated() ? <Layout /> : <Navigate to="/login" />}
        >
             <Route index element={<DashboardPage />} />
             <Route path="catalog" element={<CatalogPage />} />
             <Route path="pos" element={<PosPage />} /> 
          
          {/* Защищенный роут: пускаем только если есть роль CASHIER */}
          <Route 
            path="pos" 
            element={
              hasRole(['CASHIER' , 'STORE_ADMIN']) 
                ? <PosPage /> 
                : <Navigate to="/" /> /* Если нет прав, кидаем на главную */
            } 
          />
        </Route>
         <Route 
            path="finances" 
            element={
              hasRole(['FINANCIER', 'STORE_ADMIN']) 
                ? <FinancierPage /> 
                : <Navigate to="/" /> 
            } 
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;