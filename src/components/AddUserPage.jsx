import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../firebase/authService";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AddUserPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    birthdate: "",
    gender: "",
    picture: null,
  });

  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.email.trim()) newErrors.email = "Email é obrigatório";
    if (!form.address.trim()) newErrors.address = "Morada é obrigatória";
    if (!form.contact.trim()) newErrors.contact = "Contato é obrigatório";
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
      alert("Selecione uma imagem válida.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem deve ter menos de 5MB.");
      return;
    }
    setForm({ ...form, picture: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const password = "123456";
      const firebaseUser = await registerUser(form.email, password);

      let imageUrl = "src/uploads/profile1.jpg";
      if (form.picture instanceof File) {
        const imageRef = ref(
          storage,
          `users/${Date.now()}-${form.picture.name}`,
        );
        const uploadTask = uploadBytesResumable(imageRef, form.picture);

        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          });
        });
      }

      const userData = {
        uid: firebaseUser.uid,
        name: form.name,
        email: form.email,
        address: form.address,
        contact: form.contact,
        birthdate: form.birthdate,
        gender: form.gender,
        picture: imageUrl,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "users"), userData);
      navigate("/users");
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "name", label: "Nome", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Morada", type: "text" },
    { name: "contact", label: "Contacto", type: "text" },
  ];

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Adicionar Utilizador
          </h1>

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
              disabled={isSubmitting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {fields.map((field) => (
            <div className="mb-3" key={field.name}>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder={`${field.label} *`}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors[field.name] ? "border-red-500" : ""}`}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div className="mb-3">
            <input
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.birthdate ? "border-red-500" : ""}`}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
            )}
          </div>

          <div className="mb-4">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.gender ? "border-red-500" : ""}`}
            >
              <option value="">Gênero *</option>
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Adicionar"}
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

export default AddUserPage;
