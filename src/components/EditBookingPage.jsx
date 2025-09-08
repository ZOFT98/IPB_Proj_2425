import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { notify } from "../services/notificationService";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaRegCommentDots,
  FaBuilding,
  FaCalendarDay,
  FaClock,
  FaAlignLeft,
  FaCheckCircle,
} from "react-icons/fa";

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
  const [spaces, setSpaces] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "spaces"));
        const spacesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpaces(spacesList);
      } catch (error) {
        notify("Erro ao carregar os espaços desportivos.", "error");
      }
    };
    fetchSpaces();
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, "bookings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data());
        } else {
          notify("Reserva não encontrada", "error");
          navigate("/bookings");
        }
      } catch (error) {
        notify("Erro ao carregar dados da reserva", "error");
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
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "bookings", id);
      await updateDoc(docRef, {
        ...form,
        updatedAt: new Date().toISOString(),
      });
      notify("Reserva atualizada com sucesso!", "success");
      navigate("/bookings");
    } catch (error) {
      notify("Erro ao atualizar reserva", "error");
    } finally {
      setIsSubmitting(false);
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
    <div className="dark:text-gray-100 p-4">
      <div className="mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Editar Reserva</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reserva em nome de *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaRegCommentDots />
                </span>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="space"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Espaço *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaBuilding />
                </span>
                <select
                  id="space"
                  name="space"
                  value={form.space}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.space ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Selecione um espaço</option>
                  {spaces
                    .filter((s) => s.available || s.name === form.space)
                    .map((space) => (
                      <option key={space.id} value={space.name}>
                        {space.available ? "✅" : "⚠️"} {space.name}
                      </option>
                    ))}
                </select>
              </div>
              {errors.space && (
                <p className="text-red-500 text-sm mt-1">{errors.space}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaCalendarDay />
                </span>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Status
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaCheckCircle />
                </span>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hora Início *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaClock />
                </span>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startTime ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hora Fim *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaClock />
                </span>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endTime ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Descrição
            </label>
            <div className="relative">
              <span className="absolute top-3 left-0 flex items-center pl-3 text-gray-400">
                <FaAlignLeft />
              </span>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-48 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Atualizando...
                </>
              ) : (
                "Atualizar Reserva"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Reserva"
        message="Tem certeza de que deseja atualizar esta reserva?"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default EditBookingPage;
