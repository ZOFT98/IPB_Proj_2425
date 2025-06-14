import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/users";

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API_URL).then((res) => setUsers(res.data));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Utilizadores</h1>
          <button
            onClick={() => navigate("/add-user")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar utilizador
          </button>

		</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition"
            >
				<div className="flex flex-col items-center mb-3">
        <img 
          src={user.picture || '/default-profile.png'} 
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <h3 className="font-medium text-lg">{user.name}</h3>
      </div>
      
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Morada:</span> {user.address}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Contacto:</span> {user.contact}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Data de Nascimento:</span> {user.birthdate}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Gênero:</span> {user.gender}
                </p>
              <div className="mt-3 flex gap-2">
			  <button
  				onClick={() => navigate(`/users/edit/${user.id}`)}
  				className="text-sm px-3 py-1 bg-yellow-500 text-white rounded"
				>
  				  Editar
				</button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded"
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

export default Users;