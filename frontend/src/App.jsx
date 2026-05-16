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
import CreateWorkshopPage from "./pages/CreateWorkshopPage";
import { useEffect } from "react";
import SettingPage from "./pages/SettingPage";
import RoleBasedRoute from "./component/common/RoleBasedRoute";
import { userRoles } from "./utils/userRole";
import WorkshopsPage from "./pages/WorkshopsPage";
import { userStore } from "./store/useAuthStore";
import WorkshopDetailPage from "./pages/WorkshopDetailPage";
import CheckinPage from "./pages/CheckinPage";
import useOnlineStatus from "./hooks/useOnlineStatus";
import { getAllItems, clearItems } from "./lib/indexedDB";
import { checkinService } from "./services/checkinService";
import { useRef } from "react";
import WorkshopEdit from "./pages/WorkshopEdit";

function App() {
  const user = userStore((state) => state.user);  

  const isOnline = useOnlineStatus();  
  const prevIsOnline = useRef(null);
  const isStaff = user?.role === userRoles.STAFF;

  useEffect(() => {
    const syncCheckinData = async () => {
      const data = await getAllItems();   
      if (data.length > 0) {
        try {
          const isSynced = await checkinService.syncCheckinData(user.userId, data);          
          if (isSynced) {
            await clearItems();
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    const justCameOnline = isOnline && prevIsOnline.current === false;
    prevIsOnline.current = isOnline;

    if (isStaff && justCameOnline) {
      syncCheckinData();
    }

  }, [isOnline, isStaff, user])

  useEffect(() => {
    const handleLogout = (event) => {
      console.warn(event.detail.message);

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
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route
              element={
                <RoleBasedRoute
                  allowedRoles={[userRoles.ORGANIZER, userRoles.STUDENT]}
                />
              }
            >
              <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
            </Route>
            <Route
              element={<RoleBasedRoute allowedRoles={[userRoles.ORGANIZER]} />}
            >
              <Route
                path="/create-workshops"
                element={<CreateWorkshopPage />}
              />
              <Route path="/workshops/:id/edit" element={<WorkshopEdit />} />
            </Route>

            <Route
              element={<RoleBasedRoute allowedRoles={[userRoles.STAFF]} />}
            >
              <Route path="/checkin/:id" element={<CheckinPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>

        {/* Redirect from root based on auth status */}
        <Route
          path="/"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
