import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const snapshot = await getDocs(collection(db, "spaces"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpaces(list);
    } catch (error) {
      console.error("Error fetching spaces from Firestore:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "spaces", id));
      fetchSpaces();
    } catch (error) {
      console.error("Error deleting space:", error);
    }
  };

  return (
    <div className="flex dark:text-gray-100">
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Espaços Esportivos</h1>
          <button
            onClick={() => navigate("/spaces/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar Espaço
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map(space => (
            <div key={space.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex flex-col items-center mb-3">
                {space.image && (
                  <img 
                    src={space.image} 
                    alt={space.name}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-lg">{space.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {space.price} • {space.modality}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Morada:</span> {space.address}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {space.postCode} • {space.locality}
                </p>
                <p className={`text-sm ${
                  space.available ? 'text-green-500' : 'text-red-500'
                }`}>
                  {space.available ? 'Disponível' : 'Indisponível'}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/spaces/edit/${space.id}`)}
                  className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(space.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Spaces;
