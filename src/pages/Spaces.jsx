import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaEuroSign,
  FaFutbol,
  FaCheckCircle,
  FaTimesCircle,
  FaTableTennis,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { FaBasketball } from "react-icons/fa6";
import { notify } from "../services/notificationService";
import ConfirmationModal from "../components/ConfirmationModal";

const modalityIcons = {
  Futebol: <FaFutbol className="mr-2 text-gray-400" />,
  Futsal: <FaFutbol className="mr-2 text-gray-400" />,
  Basquetebol: <FaBasketball className="mr-2 text-gray-400" />,
  Tenis: <FaTableTennis className="mr-2 text-gray-400" />,
};

const getModalityIcon = (modality) => {
  return modalityIcons[modality] || <FaFutbol className="mr-2 text-gray-400" />;
};

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const snapshot = await getDocs(collection(db, "spaces"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSpaces(list);
    } catch (error) {
      notify("Erro ao carregar instalações.", "error");
    }
  };

  const handleDelete = (id) => {
    setSpaceToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!spaceToDelete) return;
    try {
      await deleteDoc(doc(db, "spaces", spaceToDelete));
      fetchSpaces();
      notify("Instalação Desportiva removida com sucesso!", "success");
    } catch (error) {
      notify("Erro ao apagar. Tente novamente.", "error");
    } finally {
      setIsModalOpen(false);
      setSpaceToDelete(null);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Instalações Desportivas</h1>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/spaces/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus />
              Adicionar Instalação
            </button>
          )}
        </div>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminação"
          message="Tem a certeza de que pretende eliminar esta instalação desportiva?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden"
            >
              <img
                src={space.image || "src/uploads/field1.jpg"}
                alt={space.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">
                  {space.name}
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="flex items-center">
                    {getModalityIcon(space.modality)}
                    <span className="font-semibold mr-1">Modalidade:</span>
                    {space.modality}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Localidade:</span>
                    {space.locality}
                  </p>
                  <p className="flex items-center">
                    <FaEuroSign className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Preço:</span>
                    {space.price}€/h
                  </p>
                  <p className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Horário:</span>
                    {space.openingTime} - {space.closingTime}
                  </p>
                  <p className="flex items-center">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span className="font-semibold mr-1">Lotação Máxima:</span>
                    {space.maxCapacity}
                  </p>
                  <div
                    className={`flex items-center font-bold p-2 rounded-lg ${
                      space.available ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {space.available ? (
                      <FaCheckCircle className="mr-2" />
                    ) : (
                      <FaTimesCircle className="mr-2" />
                    )}
                    {space.available ? "Disponível" : "Indisponível"}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex gap-2">
                    {(isAdmin || isSuperAdmin) && (
                      <button
                        onClick={() => navigate(`/spaces/edit/${space.id}`)}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <FaEdit />
                        Editar
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(space.id)}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Spaces;
