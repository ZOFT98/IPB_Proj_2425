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
import ProtectedRoute from "./router/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const fullScreenRoutes = ["/", "/login", "/register", "/password-recovery"];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {isFullScreen ? (
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
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spaces"
                element={
                  <ProtectedRoute>
                    <Spaces />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spaces/add"
                element={
                  <ProtectedRoute>
                    <AddSpacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spaces/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditSpacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-user"
                element={
                  <ProtectedRoute>
                    <AddUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-bookings"
                element={
                  <ProtectedRoute>
                    <AddBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <Tickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-ticket"
                element={
                  <ProtectedRoute>
                    <AddTicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditTicketPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
