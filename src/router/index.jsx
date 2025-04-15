import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/HomePage";
import Instalacoes from "../pages/Instalacoes";
import Reservas from "../pages/Reservas";
import Users from "../pages/Users";
import Tickets from "../pages/Tickets";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/instalacoes" element={<Instalacoes />} />
      <Route path="/bookings" element={<Reservas />} />
      <Route path="/users" element={<Users />} />
      <Route path="/tickets" element={<Tickets />} />
    </Routes>
  );
};

export default AppRoutes;
