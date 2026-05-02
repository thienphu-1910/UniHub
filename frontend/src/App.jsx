import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import DashboardLayout from "./component/layout/DashboardLayout";
import "./index.css";
import OrganizerWorkshopPage from "./pages/OrganizerWorkshopPage";
import { useEffect } from "react";
import SettingPage from "./pages/SettingPage";
import RoleBasedRoute from "./component/common/RoleBasedRoute";
import { userRoles } from "./utils/userRole";
import WorkshopsPage from "./pages/WorkshopsPage";
import { userStore } from "./store/useAuthStore";
import WorkshopDetailPage from "./pages/WorkshopDetailPage";

function App() {
  const user = userStore((state) => state.user);

  useEffect(() => {
    const handleLogout = (event) => {
      console.warn(event.detail.message);

      //authenticationService.logout();
      window.location.href = "/login";
    };

    window.addEventListener("unauthorized-access", handleLogout);

    return () =>
      window.removeEventListener("unauthorized-access", handleLogout);
  }, []);

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
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
            </Route>
            <Route
              element={<RoleBasedRoute allowedRoles={[userRoles.ORGANIZER]} />}
            >
              <Route
                path="/create-workshops"
                element={<OrganizerWorkshopPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>

        {/* Redirect from root based on auth status */}
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
