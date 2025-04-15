import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  const handlePasswordRecovery = () => {
    // Add password recovery logic here
    console.log("Password recovery clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        {/* Title with proper spacing and styling */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          PLATAFORMA DE GESTÃO
        </h1>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          ESPAÇOS DESPORTIVOS
        </h2>
        
        {/* Welcome message */}
        <h3 className="text-lg font-semibold text-gray-700 mb-8">BEM-VINDO</h3>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              //required
            />
          </div>
          
          {/* Password input */}
          <div>
            <input
              type="password"
              placeholder="Senha de acesso"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              //required
            />
          </div>
          
          {/* Remember me checkbox */}
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Guardar dados de acesso
            </label>
          </div>
          
          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            ENTRAR
          </button>
        </form>
        
        {/* Password recovery */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handlePasswordRecovery}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Recuperar senha de acesso
          </button>
        </div>
      </div>
    </div>
  );
}