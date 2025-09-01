import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const EditSpacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    modality: "",
    address: "",
    postCode: "",
    locality: "",
    price: "",
    image: "",
    available: true
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const docRef = doc(db, "spaces", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm(data);
          setPreview(data.image);
        } else {
          alert("Espaço não encontrado");
          navigate("/spaces");
        }
      } catch (error) {
        console.error("Erro ao buscar espaço:", error);
        alert("Erro ao carregar espaço.");
      }
    };

    fetchSpace();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.modality.trim()) newErrors.modality = "Modalidade é obrigatória";
    if (!form.address.trim()) newErrors.address = "Morada é obrigatória";
    if (!form.postCode.trim()) newErrors.postCode = "Código postal é obrigatório";
    if (!form.locality.trim()) newErrors.locality = "Localidade é obrigatória";
    if (!form.price.trim()) newErrors.price = "Preço é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem deve ser menor que 5MB");
      return;
    }

    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);

    try {
      let imageUrl = form.image;

      if (form.image instanceof File) {
        const imageRef = ref(storage, `spaces/${Date.now()}-${form.image.name}`);
        const uploadTask = uploadBytesResumable(imageRef, form.image);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      const spaceRef = doc(db, "spaces", id);
      await updateDoc(spaceRef, {
        ...form,
        image: imageUrl,
        updatedAt: Timestamp.now(),
      });

      navigate("/spaces");
    } catch (error) {
      console.error("Erro ao atualizar espaço:", error);
      alert("Erro ao atualizar espaço. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Editar Espaço Esportivo</h1>

          <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img src={preview} alt="Preview" className="w-32 h-32 rounded-lg object-cover mb-2" />
            ) : (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-2 rounded-lg">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {["nome", "modalidade", "morada", "código-postal", "localidade", "preço"].map((field) => (
            <div className="mb-3" key={field}>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} *`}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors[field] ? "border-red-500" : ""
                }`}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="w-4 h-4 mr-2"
              id="availableCheckbox"
            />
            <label htmlFor="availableCheckbox">Disponível</label>
          </div>

          <div className="flex gap-2 justify-center mt-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {uploading ? "Atualizando..." : "Atualizar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/spaces")}
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

export default EditSpacePage;
