import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import {
  HomePage,
  Users,
  Reservas,
  Tickets,
  RegisterPage,
  PasswordRecoveryPage,
} from "./pages";
import { Navbar } from "./components";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/bookings" element={<Reservas />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
