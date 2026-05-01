import { BrowserRouter as Router, Routes, Route, Navigate, } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import DashboardLayout from './component/layout/DashboardLayout';
import './index.css';
import OrganizerWorkshopPage from './pages/OrganizerWorkshopPage';
import { useEffect } from 'react';
import SettingPage from './pages/SettingPage';
import { authenticationService } from './services/authenticationService';


function App() {  
  useEffect(() => {
    const handleLogout = (event) => {

      console.warn(event.detail.message);

      if (window.location.href !== '/login') {
        authenticationService.logout();
        window.location.href = "/login";
      }      
    }

    window.addEventListener('unauthorized-access', handleLogout);

    return () => window.removeEventListener('unauthorized-access', handleLogout);
  }, [])

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
          <Route path="/settings" element={<SettingPage />} /> {/* Placeholder */}
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
