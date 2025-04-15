import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation(); // Get current route

  // Hide navbar on the login page
  if (location.pathname === "/login") {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        backgroundColor: "#f0f0f0",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        Plataforma de Gestão de Instalações Desportivas
      </div>
      <div style={{ position: "relative" }}>
        <button
          onClick={toggleDropdown}
          style={{ border: "none", backgroundColor: "transparent", cursor: "pointer" }}
        >
          User Menu
        </button>
        {isDropdownOpen && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              backgroundColor: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              padding: 0,
            }}
          >
            <li style={{ padding: "10px" }}>
              <Link to="/home">Home</Link> 
            </li>
            <li style={{ padding: "10px" }}>
              <Link to="/bookings">Reservas</Link>
            </li>
            <li style={{ padding: "10px" }}>
              <Link to="/facilities">Instalações Desportivas</Link>
            </li>
            <li style={{ padding: "10px" }}>
              <Link to="/users">Utilizadores</Link>
            </li>
            <li style={{ padding: "10px" }}>
              <Link to="/tickets">Tickets</Link>
            </li>
            <li style={{ padding: "10px" }}>
              <Link to="/login">Logout</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
