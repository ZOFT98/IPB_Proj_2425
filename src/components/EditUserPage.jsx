import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import defaultUserImage from "../uploads/default-profile.jpg";
import { sendPasswordResetEmail } from "firebase/auth";
import { FaKey } from "react-icons/fa";
import { auth } from "../firebase";
import { notify } from "../services/notificationService";
import { AuthContext } from "../contexts/AuthContext";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarDay,
  FaVenusMars,
  FaUserTag,
} from "react-icons/fa";

const EditUserPage = () => {
  const { currentUser, refreshCurrentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    birthdate: "",
    gender: "",
    photoURL: "",
    role: "admin",
  });
  const [originalRole, setOriginalRole] = useState("");
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm((prev) => ({ ...prev, ...data }));
          setOriginalRole(data.role);
          if (data.photoURL && data.photoURL.startsWith("https://")) {
            setPreview(data.photoURL);
          } else {
            setPreview(defaultUserImage);
          }
        } else {
          notify("Usuário não encontrado", "error");
          navigate("/users");
        }
      } catch (error) {
        notify("Erro ao carregar usuário.", "error");
        navigate("/users");
      }
    };
    fetchUser();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!(form.name || "").trim()) newErrors.name = "Nome é obrigatório";
    if (!(form.email || "").trim()) newErrors.email = "Email é obrigatório";
    if (!(form.address || "").trim())
      newErrors.address = "Morada é obrigatória";
    if (!(form.contact || "").trim())
      newErrors.contact = "Contato é obrigatório";
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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Por favor, selecione um arquivo de imagem válido", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("A imagem deve ser menor que 5MB", "warning");
      return;
    }

    setForm({ ...form, photoURL: file });
    setPreview(URL.createObjectURL(file));
  };

  const handlePasswordReset = async () => {
    if (!form.email) {
      notify("Email do utilizador não encontrado.", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      notify(
        `Email de redefinição de palavra-passe enviado para ${form.email}.`,
        "success",
      );
    } catch (error) {
      notify("Erro ao enviar email de redefinição: " + error.message, "error");
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
        const imageRef = ref(storage, `users/${id}/${form.photoURL.name}`);
        const snapshot = await uploadBytes(imageRef, form.photoURL);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      const updatedData = {
        name: form.name,
        email: form.email,
        address: form.address,
        contact: form.contact,
        birthdate: form.birthdate,
        gender: form.gender,
        photoURL: photoURL,
      };

      if (currentUser?.role === "superadmin") {
        updatedData.role = form.role;
      }

      await updateDoc(doc(db, "users", id), updatedData);

      if (currentUser?.role === "superadmin" && form.role !== originalRole) {
        if (currentUser.uid === id) {
          await refreshCurrentUser();
          notify(
            "A sua role foi atualizada! As suas novas permissões já estão ativas.",
            "success",
          );
        } else {
          notify(
            "Role atualizado com sucesso! O utilizador precisa de fazer logout e login novamente para que as novas permissões sejam aplicadas.",
            "info",
          );
        }
      } else {
        notify("Utilizador atualizado com sucesso!", "success");
      }

      navigate("/users");
    } catch (error) {
      notify("Erro ao atualizar usuário.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark:text-gray-100 p-4">
      <div className="mx-auto max-w-4xl py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Editar Utilizador
          </h1>

          <div className="mb-6 flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300 dark:hover:file:bg-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nome *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaUser />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nome"
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaMapMarkerAlt />
                </span>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Morada"
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Contacto *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaPhone />
                </span>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contacto"
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
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
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaCalendarDay />
                </span>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.birthdate ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.birthdate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.birthdate}
                </p>
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
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaVenusMars />
                </span>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
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

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Role *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaUserTag />
                </span>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={currentUser?.role !== "superadmin"}
                  className={`w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.role ? "border-red-500" : ""
                  } ${
                    currentUser?.role !== "superadmin"
                      ? "cursor-not-allowed bg-gray-200 dark:bg-gray-600"
                      : ""
                  }`}
                >
                  <option value="admin">Administrador</option>
                  <option value="superadmin">Super Administrador</option>
                </select>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gestão de Palavra-passe
            </label>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaKey />
              Enviar Email de Redefinição
            </button>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-48 disabled:opacity-50"
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
                "Atualizar Utilizador"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
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
        title="Confirmar Utilizador"
        message="Tem certeza de que deseja atualizar este utilizador?"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default EditUserPage;
