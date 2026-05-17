import { Navigate, Outlet } from "react-router-dom";
import { userStore } from "../../store/useAuthStore";

const RoleBasedRoute = ({ allowedRoles }) => {

  const user = userStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />
}

export default RoleBasedRoute