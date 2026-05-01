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
import RoleBasedRoute from './component/common/RoleBasedRoute';
import { userRoles } from './utils/userRole';


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

        <Route
          element={
            <RoleBasedRoute
              allowedRoles={[
                userRoles.ORGANIZER,
                userRoles.STAFF,
                userRoles.STUDENT,
              ]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/settings" element={<SettingPage />} />
            <Route
              element={
                <RoleBasedRoute
                  allowedRoles={[userRoles.ORGANIZER, userRoles.STUDENT]}
                />
              }
            >
              <Route path="/workshops" element={<OrganizerWorkshopPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>

        {/* Redirect from root based on auth status */}
        {/* <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
