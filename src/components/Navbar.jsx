import { Link, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaCalendarAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaFutbol,
  FaHome,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const location = useLocation(); // Get current route

  // Hide navbar on the login page (accessible via / and /login)
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
      <Link
      to="/home">
      <div className="flex items-center mb-8">
        <FaFutbol className="text-2xl mr-5 text-gray-800 dark:text-gray-100" />
        <h2 className="text-xl font-bold text-gray-800 text-center dark:text-gray-100">
          Espacos Desportivos
        </h2>
        <FaFutbol className="text-2xl ml-5 text-gray-800 dark:text-gray-100" />
      </div>
      </Link>

      <nav className="flex flex-col gap-6">
       
        <Link
          to="/spaces"
          className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
        >
          <FaHome className="mr-3" />
          <div>
            <h3 className="font-semibold">Instalações</h3>
            
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
          to="/bookings"
          className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition"
        >
          <FaCalendarAlt className="mr-3" />
          <div>
            <h3 className="font-semibold">Reservas</h3>
            
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
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Navbar;
