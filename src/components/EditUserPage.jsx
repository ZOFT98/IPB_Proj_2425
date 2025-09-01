import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import defaultUserImage from "../uploads/default-profile.jpg";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    birthdate: "",
    gender: "",
    picture: "",
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm(data);
          if (data.picture && data.picture.startsWith("https://")) {
            setPreview(data.picture);
          } else {
            setPreview(defaultUserImage);
          }
        } else {
          alert("Usuário não encontrado");
          navigate("/users");
        }
      } catch (error) {
        alert("Erro ao carregar usuário.", error);
        navigate("/users");
      }
    };
    fetchUser();
  }, [id, navigate]);

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
      alert("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ser menor que 5MB");
      return;
    }

    setForm({ ...form, picture: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let pictureUrl = form.picture;

      if (form.picture instanceof File) {
        const imageRef = ref(
          storage,
          `users/${Date.now()}-${form.picture.name}`,
        );
        const uploadTask = uploadBytesResumable(imageRef, form.picture);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              pictureUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            },
          );
        });
      }

      const updatedData = {
        name: form.name,
        email: form.email,
        address: form.address,
        contact: form.contact,
        birthdate: form.birthdate,
        gender: form.gender,
        picture: pictureUrl,
      };

      await updateDoc(doc(db, "users", id), updatedData);
      navigate("/users");
    } catch (error) {
      alert("Erro ao atualizar usuário.", error);
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
            Editar Usuário
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
            { name: "name", type: "text", placeholder: "Nome *" },
            { name: "email", type: "email", placeholder: "Email *" },
            { name: "address", type: "text", placeholder: "Morada *" },
            { name: "contact", type: "text", placeholder: "Contacto *" },
          ].map(({ name, type, placeholder }) => (
            <div className="mb-3" key={name}>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
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
            <input
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
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.gender ? "border-red-500" : ""
              }`}
            >
              <option value="">Gênero *</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-center mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Atualizar
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
