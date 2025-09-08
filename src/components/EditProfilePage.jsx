import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../firebase/firestoreService";
import { notify } from "../services/notificationService";
import defaultProfileImage from "../uploads/default-profile.jpg";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
} from "react-icons/fa";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, refreshCurrentUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    birthdate: "",
    gender: "",
    photoURL: "",
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
        contact: currentUser.contact || "",
        birthdate: currentUser.birthdate || "",
        gender: currentUser.gender || "",
        photoURL: currentUser.photoURL || "",
      });
      setPreview(currentUser.photoURL || defaultProfileImage);
    }
  }, [currentUser]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.address.trim()) newErrors.address = "Morada é obrigatória";
    if (!form.contact.trim()) newErrors.contact = "Contacto é obrigatório";
    if (!form.birthdate)
      newErrors.birthdate = "Data de nascimento é obrigatória";
    if (!form.gender) newErrors.gender = "Gênero é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        notify("Por favor, selecione um ficheiro de imagem válido.", "warning");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        notify("A imagem deve ser menor que 5MB.", "warning");
        return;
      }
      setForm({ ...form, photoURL: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    try {
      let photoURL = form.photoURL;
      if (form.photoURL instanceof File) {
        const imageRef = ref(
          storage,
          `users/${currentUser.uid}/${form.photoURL.name}`,
        );
        const uploadTask = uploadBytesResumable(imageRef, form.photoURL);
        photoURL = await getDownloadURL((await uploadTask).ref);
      }

      const updatedData = { ...form, photoURL };
      await updateUser(currentUser.uid, updatedData);
      await refreshCurrentUser();

      notify("Perfil atualizado com sucesso!", "success");
      navigate("/profile");
    } catch (error) {
      notify("Erro ao atualizar o perfil.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark:text-gray-100 p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Editar Perfil</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
            <div className="md:col-span-1 flex justify-center">
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200 dark:border-gray-700"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nome *
                </label>
                <div className="relative">
                  <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nome"
                    className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Morada *
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Morada"
                    className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                      errors.address ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Contacto *
              </label>
              <div className="relative">
                <FaPhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contacto"
                  className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                    errors.contact ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data de Nascimento *
              </label>
              <div className="relative">
                <FaBirthdayCake className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={handleChange}
                  className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                    errors.birthdate ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.birthdate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Gênero *
              </label>
              <div className="relative">
                <FaVenusMars className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Selecione o Gênero</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center w-40 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Atualizando...
                </>
              ) : (
                "Atualizar"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Atualização de Perfil"
        message="Tem certeza de que deseja atualizar seu perfil?"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default EditProfilePage;
