import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { notify } from "../services/notificationService";
import ConfirmationModal from "../components/ConfirmationModal";

const roleInfo = {
  admin: {
    text: "Administrador",
    color: "bg-blue-500 text-white",
  },
  superadmin: {
    text: "Super Administrador",
    color: "bg-red-500 text-white",
  },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  const fetchUsers = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => {
        if (a.id === currentUser.uid) return -1;
        if (b.id === currentUser.uid) return 1;
        return 0;
      });

      setUsers(data);
    } catch (error) {
      console.error(error);
      notify("Erro ao carregar utilizadores.", "error");
    }
  }, [currentUser.uid]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (id) => {
    if (id === currentUser.uid) {
      notify("Não se pode apagar a si próprio.", "warning");
      return;
    }
    setUserToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, "users", userToDelete));
      setUsers(users.filter((u) => u.id !== userToDelete));
      notify("Utilizador apagado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      notify("Erro ao apagar. Tente novamente.", "error");
    } finally {
      setIsModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Utilizadores</h1>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/add-user")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus />
              Adicionar Utilizador
            </button>
          )}
        </div>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminação"
          message="Tem a certeza de que pretende eliminar este utilizador?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <img
                  src={user.picture || "src/uploads/profile1.jpg"}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {user.id === currentUser.uid && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500 text-white">
                        Eu
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        roleInfo[user.role]?.color || "bg-gray-500 text-white"
                      }`}
                    >
                      {roleInfo[user.role]?.text || user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" /> {user.email}
                </p>
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />{" "}
                  {user.address}
                </p>
                <p className="flex items-center">
                  <FaPhone className="mr-2 text-gray-400" /> {user.contact}
                </p>
                <p className="flex items-center">
                  <FaBirthdayCake className="mr-2 text-gray-400" />{" "}
                  {user.birthdate}
                </p>
                <p className="flex items-center">
                  <FaVenusMars className="mr-2 text-gray-400" /> {user.gender}
                </p>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                {(isAdmin || isSuperAdmin) && (
                  <button
                    onClick={() => navigate(`/users/edit/${user.id}`)}
                    className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <FaEdit />
                    Editar
                  </button>
                )}
                {isSuperAdmin && user.id !== currentUser.uid && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="flex items-center gap-1 text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash />
                    Apagar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Users;
