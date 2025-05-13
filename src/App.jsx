import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import {
  HomePage,
  Users,
  Tickets,
  RegisterPage,
  PasswordRecoveryPage,
} from "./pages";
import { Navbar } from "./components";
import Spaces from "./pages/Spaces";
import Bookings from "./pages/Bookings";
import AddUserPage from "./components/AddUserPage";
import EditUserPage from "./components/EditUserPage";
import AddBookingPage from "./components/AddBookingPage";
import EditBookingPage from "./components/EditBookingPage";
import AddSpacePage from "./components/AddSpacePage";
import EditSpacePage from "./components/EditSpacePage";
import AddTicketPage from "./components/AddTicketPage";
import EditTicketPage from "./components/EditTicketPage";

function App() {
  const location = useLocation();
  const fullScreenRoutes = ["/", "/login", "/register", "/password-recovery"];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return isFullScreen ? (
    
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
    </Routes>
  ) : (
    
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/spaces/add" element={<AddSpacePage />} />
          <Route path="/spaces/edit/:id" element={<EditSpacePage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/users/edit/:id" element={<EditUserPage />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/add-bookings" element={<AddBookingPage />} />
          <Route path="/bookings/edit/:id" element={<EditBookingPage />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/add-ticket" element={<AddTicketPage />} />
          <Route path="/tickets/edit/:id" element={<EditTicketPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
