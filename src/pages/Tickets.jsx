import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationCircle,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const statusInfo = {
  completed: {
    text: "Concluído",
    icon: <FaCheckCircle className="mr-2" />,
    color: "text-green-500",
  },
  cancelled: {
    text: "Cancelado",
    icon: <FaTimesCircle className="mr-2" />,
    color: "text-red-500",
  },
  in_progress: {
    text: "Em Progresso",
    icon: <FaHourglassHalf className="mr-2" />,
    color: "text-yellow-500",
  },
  pending: {
    text: "Pendente",
    icon: <FaExclamationCircle className="mr-2" />,
    color: "text-blue-500",
  },
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  const fetchTickets = async () => {
    try {
      const snapshot = await getDocs(collection(db, "tickets"));
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTickets(docs);
    } catch (error) {
      alert("Erro ao carregar tickets.", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert("Erro ao apagar. Tente novamente.", error);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets</h1>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/add-ticket")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus />
              Adicionar Ticket
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const status = statusInfo[ticket.status] || statusInfo.pending;
            return (
              <div
                key={ticket.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">
                  {ticket.title}
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="flex items-center">
                    <FaUser className="mr-2 text-gray-400" /> {ticket.name}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />{" "}
                    {ticket.space}
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    {ticket.date
                      ? new Date(ticket.date.seconds * 1000).toLocaleDateString(
                          "pt-PT",
                        )
                      : "-"}
                  </p>
                  <p className="flex items-start">
                    <FaInfoCircle className="mr-2 mt-1 text-gray-400" />
                    <span className="flex-1">{ticket.description}</span>
                  </p>
                  <div
                    className={`flex items-center font-bold p-2 rounded-lg ${status.color}`}
                  >
                    {status.icon}
                    {status.text}
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                  {(isAdmin || isSuperAdmin) && (
                    <button
                      onClick={() => navigate(`/tickets/edit/${ticket.id}`)}
                      className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <FaEdit />
                      Editar
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="flex items-center gap-1 text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                      Apagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Tickets;
