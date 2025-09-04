import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../firebase/authService";
import { notify } from "../services/notificationService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    contact: "",
    birthdate: "",
    gender: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      notify("As passwords não coincidem!", "error");
      return;
    }

    if (!agreedToTerms) {
      notify(
        "Deve aceitar os Termos de Serviço e a Política de Privacidade.",
        "warning",
      );
      return;
    }

    try {
      await register(form);
      notify("Conta criada com sucesso!", "success");
      navigate("/login");
    } catch (error) {
      notify("Erro ao criar conta: " + error.message, "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: "url('/background.jpg')",
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
                name="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={handleChange}
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
                name="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* New Fields */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Morada
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Contacto
              </label>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Gênero
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 text-left">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
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
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength="6"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-green-600 dark:ring-offset-gray-800"
                  required
                />
              </div>
              <div className="ml-3 text-sm text-left">
                <label
                  htmlFor="terms"
                  className="font-light text-gray-500 dark:text-gray-300"
                >
                  Eu concordo com os{" "}
                  <a
                    className="font-medium text-green-600 hover:underline dark:text-green-500"
                    href="#"
                  >
                    Termos de Serviço
                  </a>{" "}
                  e a{" "}
                  <a
                    className="font-medium text-green-600 hover:underline dark:text-green-500"
                    href="#"
                  >
                    Política de Privacidade
                  </a>
                </label>
              </div>
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
