import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
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

const AddBookingPage = () => {
  const [form, setForm] = useState({
    title: "",
    space: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    status: "pending",
  });
  const [spaces, setSpaces] = useState([]);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const q = query(
          collection(db, "spaces"),
          where("available", "==", true),
        );
        const querySnapshot = await getDocs(q);
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

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.space.trim()) newErrors.space = "Espaço Desportivo é obrigatório";
    if (!form.date) newErrors.date = "Data é obrigatório";
    if (!form.startTime) newErrors.startTime = "Hora de inicio é obrigatório";
    if (!form.endTime) newErrors.endTime = "Hora de fim é obrigatório";

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = "Hora final deve ser depois da hora inicial";
    }

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

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    try {
      const docData = {
        ...form,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "bookings"), docData);
      notify("Reserva adicionada com sucesso!", "success");
      navigate("/bookings");
    } catch (error) {
      notify("Erro ao adicionar reserva.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsModalOpen(true);
  };

  return (
    <div className="dark:text-gray-100 p-4">
      <div className="mx-auto max-w-4xl py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Adicionar Nova Reserva
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reserva em nome de: *
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
                  placeholder="Reserva em nome de:"
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
                  {spaces.map((space) => (
                    <option key={space.id} value={space.name}>
                      ✅ {space.name}
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
                Hora Inicial *
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
                Hora Final *
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
                placeholder="Mais informações"
                rows={3}
                className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adicionar Reserva
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
        message="Tem certeza de que deseja adicionar esta reserva?"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default AddBookingPage;
