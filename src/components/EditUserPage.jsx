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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Editar Utilizador
          </h1>

          {/* Avatar */}
          <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Inputs */}
          {[
            { name: "name", type: "text", label: "Nome" },
            { name: "email", type: "email", label: "Email" },
            { name: "address", type: "text", label: "Morada" },
            { name: "contact", type: "text", label: "Contacto" },
          ].map(({ name, type, label }) => (
            <div className="mb-3" key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {label} *
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors[name] ? "border-red-500" : ""
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Birthdate */}
          <div className="mb-3">
            <label
              htmlFor="birthdate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Data de Nascimento *
            </label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.birthdate ? "border-red-500" : ""
              }`}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Gênero *
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.gender ? "border-red-500" : ""
              }`}
            >
              <option value="">Selecione o Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Role */}
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={currentUser?.role !== "superadmin"}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
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
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Password Reset Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gestão de Palavra-passe
            </label>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaKey />
              Enviar Email de Redefinição
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center w-40"
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
              onClick={() => navigate("/users")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
