import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { notify } from "../services/notificationService";
import ConfirmationModal from "../components/ConfirmationModal";

const statusInfo = {
  confirmed: {
    text: "Confirmado",
    icon: <FaCheckCircle className="mr-2" />,
    color: "text-green-500",
  },
  cancelled: {
    text: "Cancelado",
    icon: <FaTimesCircle className="mr-2" />,
    color: "text-red-500",
  },
  pending: {
    text: "Pendente",
    icon: <FaHourglassHalf className="mr-2" />,
    color: "text-yellow-500",
  },
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "bookings"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
    } catch (error) {
      notify("Erro ao carregar reservas.", "error");
    }
  };

  const handleDelete = (id) => {
    setBookingToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      await deleteDoc(doc(db, "bookings", bookingToDelete));
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete));
      notify("Reserva apagada com sucesso!", "success");
    } catch (error) {
      notify("Erro ao apagar. Tente novamente.", "error");
    } finally {
      setIsModalOpen(false);
      setBookingToDelete(null);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reservas</h1>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/add-bookings")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              Adicionar Reserva
            </button>
          )}
        </div>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminação"
          message="Tem a certeza de que pretende eliminar esta reserva?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const status = statusInfo[booking.status] || {
              text: booking.status,
              icon: null,
              color: "text-gray-500",
            };
            return (
              <div
                key={booking.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">
                  {booking.title}
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Espaço:</span>
                    {booking.space}
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Data:</span>
                    {new Date(booking.date).toLocaleDateString("pt-PT")}
                  </p>
                  <p className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Horário:</span>
                    {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="flex items-start">
                    <FaInfoCircle className="mr-2 mt-1 text-gray-400" />
                    <span className="font-semibold mr-1">Descrição:</span>
                    <span className="flex-1">{booking.description}</span>
                  </p>
                  <div
                    className={`flex items-center font-bold p-2 rounded-lg ${status.color}`}
                  >
                    {status.icon}
                    {status.text}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex gap-2">
                    {(isAdmin || isSuperAdmin) && (
                      <button
                        onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <FaEdit />
                        Editar
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                        Apagar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Bookings;
