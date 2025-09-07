import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../firebase/firestoreService";
import { notify } from "../services/notificationService";
import defaultProfileImage from "../uploads/default-profile.jpg";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h1>
          <div className="mb-4 flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {[
            { name: "name", type: "text", label: "Nome" },
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
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors[name] ? "border-red-500" : ""}`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

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
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.birthdate ? "border-red-500" : ""}`}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
            )}
          </div>

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
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.gender ? "border-red-500" : ""}`}
            >
              <option value="">Selecione o Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

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
              onClick={() => navigate("/profile")}
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

export default EditProfilePage;
