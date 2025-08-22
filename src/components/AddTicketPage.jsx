import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const AddTicketPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    name: "",
    space: "",
    date: "",
    description: "",
    status: "pending",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.space.trim()) newErrors.space = "Espaço é obrigatório";
    if (!form.date) newErrors.date = "Data é obrigatória";
    if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const ticketData = {
        ...form,
        date: new Date(form.date),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "tickets"), ticketData);
      navigate("/tickets");
    } catch (error) {
      console.error("Erro ao adicionar ticket:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Adicionar Ticket</h1>

          {/* Title */}
          <div className="mb-3">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Name */}
          <div className="mb-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Space */}
          <div className="mb-3">
            <input
              name="space"
              value={form.space}
              onChange={handleChange}
              placeholder="Espaço *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.space ? "border-red-500" : ""}`}
            />
            {errors.space && <p className="text-red-500 text-sm mt-1">{errors.space}</p>}
          </div>

          {/* Date */}
          <div className="mb-3">
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div className="mb-3">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descrição *"
              rows="3"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Status */}
          <div className="mb-4">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Progresso</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-2 justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Enviando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketPage;
