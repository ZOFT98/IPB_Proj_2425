import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaBirthdayCake, FaVenusMars, FaUserTag, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { currentUser } = useAuth();

  const getDisplayRole = (role) => {
    switch (role) {
      case "superadmin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      default:
        return role;
    }
  };

  const profileInfo = [
    { icon: <FaUser />, label: "Nome", value: currentUser?.name },
    { icon: <FaEnvelope />, label: "Email", value: currentUser?.email },
    { icon: <FaMapMarkerAlt />, label: "Morada", value: currentUser?.address },
    { icon: <FaPhone />, label: "Contacto", value: currentUser?.contact },
    { icon: <FaBirthdayCake />, label: "Data de Nascimento", value: currentUser?.birthdate },
    { icon: <FaVenusMars />, label: "Gênero", value: currentUser?.gender },
    { icon: <FaUserTag />, label: "Função", value: getDisplayRole(currentUser?.role) },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 p-8 flex flex-col items-center justify-center md:border-r md:border-gray-200 dark:md:border-gray-700">
            <img
              className="h-32 w-32 rounded-full object-cover ring-4 ring-green-500"
              src={currentUser?.photoURL || "/src/uploads/default-profile.jpg"}
              alt="Foto de Perfil"
            />
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white text-center">
              {currentUser?.name || "Nome do Utilizador"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
              {getDisplayRole(currentUser?.role) || "Função"}
            </p>
          </div>
          <div className="p-8 w-full">
            <div className="flex justify-between items-center mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Informações da Conta
              </h3>
              <Link to="/profile/edit">
                <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <FaEdit className="mr-2" />
                  Editar
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="text-green-500 text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      {item.value || "Não disponível"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
