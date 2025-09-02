import { useEffect, useState } from "react";
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
      alert("Erro ao carregar utilizadores.", error);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.uid) {
      alert("Não se pode apagar a si próprio.");
      return;
    }
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert("Erro ao apagar. Tente novamente.", error);
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
