import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/HomePage";
import Instalacoes from "../pages/Instalacoes";
import Reservas from "../pages/Bookings";
import Users from "../pages/Users/users";
import Tickets from "../pages/Tickets";
import Spaces from "../pages/Spaces";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/instalacoes" element={<Instalacoes />} />
      <Route path="/bookings" element={<Reservas />} />
      <Route path="/users" element={<Users />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/spaces" element={<Spaces />} />
    </Routes>
  );
};

export default AppRoutes;
