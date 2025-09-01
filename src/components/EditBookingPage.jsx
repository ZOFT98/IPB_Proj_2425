import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de que o db está exportado do seu firebase.js

const EditBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    space: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    status: "pending",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, "bookings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data());
        } else {
          alert("Reserva não encontrada");
          navigate("/bookings");
        }
      } catch (error) {
        alert("Erro ao carregar dados da reserva", error);
        navigate("/bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.space.trim()) newErrors.space = "Espaço é obrigatório";
    if (!form.date) newErrors.date = "Data é obrigatória";
    if (!form.startTime) newErrors.startTime = "Hora de início é obrigatória";
    if (!form.endTime) newErrors.endTime = "Hora de fim é obrigatória";

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = "Hora de fim deve ser depois da hora de início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const docRef = doc(db, "bookings", id);
      await updateDoc(docRef, {
        ...form,
        updatedAt: new Date().toISOString(),
      });
      navigate("/bookings");
    } catch (error) {
      alert("Erro ao atualizar reserva", error);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Editar Reserva</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Espaço */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Espaço Desportivo *
            </label>
            <input
              name="space"
              value={form.space}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.space ? "border-red-500" : ""
              }`}
            />
            {errors.space && (
              <p className="text-red-500 text-sm mt-1">{errors.space}</p>
            )}
          </div>

          {/* Data e status */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors.date ? "border-red-500" : ""
                }`}
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
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora Início *
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors.startTime ? "border-red-500" : ""
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora Fim *
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors.endTime ? "border-red-500" : ""
                }`}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Atualizar Reserva
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
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

export default EditBookingPage;
