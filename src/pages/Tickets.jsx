import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/tickets";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(API_URL);
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTickets(tickets.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      case "in_progress":
        return "text-yellow-500";
      default: // pending
        return "text-blue-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "in_progress":
        return "Em progresso";
      default: // pending
        return "Pendente";
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets</h1>
          <button
            onClick={() => navigate("/add-ticket")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col mb-3">
                <h3 className="font-medium text-lg">{ticket.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Nome:</span> {ticket.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Espaço:</span> {ticket.space}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Data:</span> {new Date(ticket.date).toLocaleDateString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Descrição:</span> {ticket.description}
                </p>
                <p className={`text-sm mt-2 ${getStatusColor(ticket.status)}`}>
                  <span className="font-semibold">Status:</span> {getStatusText(ticket.status)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Criado em: {new Date(ticket.createdAt).toLocaleString('pt-PT')}
                </p>
                {ticket.updatedAt && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Atualizado em: {new Date(ticket.updatedAt).toLocaleString('pt-PT')}
                </p>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate(`/tickets/edit/${ticket.id}`)}
                  className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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

export default Tickets;