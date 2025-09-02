import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/Register";
import HomePage from "../pages/HomePage";
import Bookings from "../pages/Bookings";
import Users from "../pages/Users";
import Tickets from "../pages/Tickets";
import Spaces from "../pages/Spaces";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spaces"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Spaces />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
