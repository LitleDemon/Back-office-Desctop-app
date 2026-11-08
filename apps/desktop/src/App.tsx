import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';

// Проверка, залогинен ли пользователь
const isAuthenticated = () => !!localStorage.getItem('token');

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;