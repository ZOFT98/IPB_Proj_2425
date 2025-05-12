import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/bookings";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(API_URL);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setBookings(bookings.filter(booking => booking.id !== id));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reservas</h1>
          <button
            onClick={() => navigate("/add-bookings")} // Updated to correct path
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Adicionar reserva
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center mb-3">
                <h3 className="font-medium text-lg">{booking.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(booking.date).toLocaleDateString('pt-PT')} • {booking.startTime} - {booking.endTime}
                </p>
              </div>

              <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Espaço Desportivo:</span> {booking.space}
                </p>
              
              <div className="space-y-2">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Descrição:</span> {booking.description}
                </p>
                <p className={`text-sm font-medium ${
                  booking.status === 'confirmed' ? 'text-green-500' :
                  booking.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  Status: {booking.status}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Criado em: {new Date(booking.createdAt).toLocaleString('pt-PT')}
                </p>
                {booking.updatedAt && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Atualizado em: {new Date(booking.updatedAt).toLocaleString('pt-PT')}
                </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/bookings/edit/${booking.id}`)} // Updated to correct path
                  className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Bookings;