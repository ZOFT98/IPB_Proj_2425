import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

const EditTicketPage = () => {
  const { id } = useParams();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", id);
        const snapshot = await getDoc(ticketRef);

        if (!snapshot.exists()) {
          alert("Ticket não encontrado");
          return navigate("/tickets");
        }

        const data = snapshot.data();
        setForm({
          ...data,
          date: data.date?.toDate().toISOString().split("T")[0] || "",
        });
      } catch (error) {
        alert("Erro ao carregar o ticket", error);
        navigate("/tickets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.space.trim()) newErrors.space = "Espaço é obrigatório";
    if (!form.date) newErrors.date = "Data é obrigatória";

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

    try {
      const ticketRef = doc(db, "tickets", id);
      const updatedTicket = {
        ...form,
        date: new Date(form.date),
        updatedAt: Timestamp.now(),
      };
      await updateDoc(ticketRef, updatedTicket);
      navigate("/tickets");
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Editar Ticket</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          {/* Title Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Space Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Espaço *</label>
            <input
              name="space"
              value={form.space}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.space ? "border-red-500" : ""}`}
            />
            {errors.space && (
              <p className="text-red-500 text-sm mt-1">{errors.space}</p>
            )}
          </div>

          {/* Date and Status Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
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
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Atualizar Ticket
            </button>
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketPage;
