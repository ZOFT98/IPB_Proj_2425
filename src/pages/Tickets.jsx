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
  FaTh,
  FaList,
} from "react-icons/fa";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { notify } from "../services/notificationService";
import ConfirmationModal from "../components/ConfirmationModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [filterSpace, setFilterSpace] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [view, setView] = useState("grid");
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
      console.error(error);
      notify("Erro ao carregar tickets.", "error");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = (id) => {
    setTicketToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      await deleteDoc(doc(db, "tickets", ticketToDelete));
      setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));
      notify("Ticket apagado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      notify("Erro ao apagar. Tente novamente.", "error");
    } finally {
      setIsModalOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleResetFilters = () => {
    setFilterSpace("");
    setFilterStatus("");
  };

  const uniqueSpaces = [...new Set(tickets.map((t) => t.space))];
  const [sortBy, setSortBy] = useState("date");

  const filteredTickets = tickets
    .filter((ticket) => {
      return (
        (filterSpace ? ticket.space === filterSpace : true) &&
        (filterStatus ? ticket.status === filterStatus : true)
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

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

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            <select
              value={filterSpace}
              onChange={(e) => setFilterSpace(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Todos os Espaços</option>
              {uniqueSpaces.map((space) => (
                <option key={space} value={space}>
                  {space}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Todos os Estados</option>
              <option value="completed">Concluído</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Progresso</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button
              onClick={handleResetFilters}
              className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Resetar Filtros"
            >
              <FaFilterCircleXmark />
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="date">Ordenar por Data</option>
              <option value="status">Ordenar por Estado</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg ${
                  view === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminação"
          message="Tem a certeza de que pretende eliminar este ticket?"
        />

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
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
                        ? new Date(
                            ticket.date.seconds * 1000,
                          ).toLocaleDateString("pt-PT")
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
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => {
                const status = statusInfo[ticket.status] || statusInfo.pending;
                return (
                  <div
                    key={ticket.id}
                    className="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 mb-4 sm:mb-0 pr-4">
                      <h3 className="font-bold text-lg">{ticket.title}</h3>
                      <p className="text-sm text-gray-500">
                        {ticket.name} - {ticket.space}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-sm mb-4 sm:mb-0">
                      <FaCalendarAlt className="mr-2" />
                      {ticket.date
                        ? new Date(
                            ticket.date.seconds * 1000,
                          ).toLocaleDateString("pt-PT")
                        : "-"}
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center font-bold ${status.color} mb-4 sm:mb-0`}
                    >
                      {status.icon} {status.text}
                    </div>
                    <div className="flex gap-2">
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Tickets;
