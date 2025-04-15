import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage"; 

function App() {
  return (
    <>
      <Navbar /> 
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* Add other routes here */}
      </Routes>
    </>
  );
}

export default App;
