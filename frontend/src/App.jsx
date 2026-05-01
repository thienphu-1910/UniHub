import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import DashboardLayout from './component/layout/DashboardLayout';
import './index.css';
import OrganizerWorkshopPage from './pages/OrganizerWorkshopPage';
import { useEffect } from 'react';

function App() {
  const nav = useNavigate();
  useEffect(() => {
    const handleLogout = (event) => {

      console.warn(event.detail.message);

      nav('/login');
    }

    window.addEventListener('unauthorized-access', handleLogout);

    return () => window.removeEventListener('unauthorized-access', handleLogout);
  }, [nav])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Sidebar Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/workshops" element={<OrganizerWorkshopPage />} /> {/* Placeholder */}
          <Route path="/users" element={<HomePage />} /> {/* Placeholder */}
          <Route path="/settings" element={<HomePage />} /> {/* Placeholder */}
          <Route path="/help" element={<HomePage />} /> {/* Placeholder */}
          
          {/* Catch-all route inside layout - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>

        {/* Redirect from root based on auth status */}
        {/* <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
