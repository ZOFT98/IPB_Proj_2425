import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handlePasswordRecoveryRequest = (e) => {
    e.preventDefault();
    // Add actual password recovery request logic here (e.g., API call)
    console.log("Password recovery requested for:", email);
    alert(
      "Se o email existir na nossa base de dados, receberá um link para recuperar a senha.",
    );
    
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/uploads/background.jpg')"
      }}
    >
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center mx-4">
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Recuperar Senha
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Insira o seu email para receber um link de recuperação.
        </p>

        <form onSubmit={handlePasswordRecoveryRequest} className="space-y-4">
          
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            ENVIAR PEDIDO DE RECUPERAÇÃO
          </button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}