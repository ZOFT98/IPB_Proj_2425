import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const snapshot = await getDocs(collection(db, "tickets"));
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(docs);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      setTickets(prev => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar ticket:", error);
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
      default:
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
      default:
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
                  <span className="font-semibold">Data:</span>{" "}
                  {ticket.date ? new Date(ticket.date.seconds * 1000).toLocaleDateString() : "-"}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Descrição:</span> {ticket.description}
                </p>
                <p className={`text-sm mt-2 ${getStatusColor(ticket.status)}`}>
                  <span className="font-semibold">Status:</span> {getStatusText(ticket.status)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Criado em: {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleString("pt-PT") : "-"}
                </p>
                {ticket.updatedAt && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Atualizado em: {new Date(ticket.updatedAt.seconds * 1000).toLocaleString("pt-PT")}
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
