import { FaFutbol } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  const handlePasswordRecovery = () => {
    navigate("/password-recovery");
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        {/* Top Title */}
        <div className="flex items-center justify-center mb-8">
          <FaFutbol className="text-2xl mr-5 text-gray-800 dark:text-gray-100" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Espacos Desportivos
          </h2>
          <FaFutbol className="text-2xl ml-5 text-gray-800 dark:text-gray-100" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              //required
            />
          </div>

          {/* Password input */}
          <div>
            <input
              type="password"
              placeholder="Senha de acesso"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              //required
            />
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
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

        {/* Links Section */}
        <div className="mt-6 flex flex-col items-center space-y-2">
          {/* Password recovery */}
          <button
            type="button"
            onClick={handlePasswordRecovery}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
          >
            Recuperar senha de acesso
          </button>

          {/* Create Account */}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 focus:outline-none"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
