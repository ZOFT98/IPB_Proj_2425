import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCalendarAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaFutbol,
  FaHome,
  FaBuilding,
} from "react-icons/fa";
import { FaBasketball } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert("Erro ao fazer logout.", error);
    }
  };

  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/password-recovery"
  ) {
    return null;
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col">
      <Link to="/home">
        <div className="flex items-center mb-8">
          <FaFutbol className="text-2xl mr-5 text-gray-800 dark:text-gray-100" />
          <h2 className="text-xl font-bold text-gray-800 text-center dark:text-gray-100">
            GestSports
          </h2>
          <FaBasketball className="text-2xl ml-5 text-gray-800 dark:text-gray-100" />
        </div>
      </Link>

      <nav className="flex flex-col gap-6">
        <Link
          to="/home"
          className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
        >
          <FaHome className="mr-3" />
          <div>
            <h3 className="font-semibold">Inicio</h3>
          </div>
        </Link>
        {(isAdmin || isSuperAdmin) && (
          <>
            <Link
              to="/spaces"
              className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              <FaBuilding className="mr-3" />
              <div>
                <h3 className="font-semibold">Instalações</h3>
              </div>
            </Link>

            <Link
              to="/bookings"
              className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              <FaCalendarAlt className="mr-3" />
              <div>
                <h3 className="font-semibold">Reservas</h3>
              </div>
            </Link>

            <Link
              to="/users"
              className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              <FaUsers className="mr-3" />
              <div>
                <h3 className="font-semibold">Utilizadores</h3>
              </div>
            </Link>

            <Link
              to="/tickets"
              className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              <FaTicketAlt className="mr-3" />
              <div>
                <h3 className="font-semibold">Tickets</h3>
              </div>
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
