import { Routes, Route, useLocation } from "react-router-dom";
import {
  HomePage,
  Users,
  Tickets,
  RegisterPage,
  PasswordRecoveryPage,
  ProfilePage,
  LoginPage,
  Spaces,
  Bookings,
} from "./pages";
import {
  Navbar,
  AddUserPage,
  EditUserPage,
  AddBookingPage,
  EditBookingPage,
  AddSpacePage,
  EditSpacePage,
  AddTicketPage,
  EditTicketPage,
  EditProfilePage,
} from "./components";
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
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Navbar />
          <main className="flex-1 p-8 overflow-y-auto">
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
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
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
