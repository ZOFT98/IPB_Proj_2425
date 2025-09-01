import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../firebase/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As passwords não coincidem!");
      return;
    }

    try {
      await register(email, password);
      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao criar conta: " + error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: "url('/uploads/background.jpg')",
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-black text-center">
            Criar Conta
          </h1>
        </div>

        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength="6"
              />
            </div>

            {/* Confirm Password input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Confirmar Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength="6"
              />
            </div>

            {/* Register button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 mt-6"
            >
              REGISTAR
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 focus:outline-none"
            >
              Já tem conta? Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
