import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AddSpacePage = () => {
  const [form, setForm] = useState({ 
    name: "",
    modality: "",
    address: "",
    postCode: "",
    locality: "",
    price: "",
    image: null,
    available: true
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.modality.trim()) newErrors.modality = "Modalidade é obrigatória";
    if (!form.address.trim()) newErrors.address = "Endereço é obrigatório";
    if (!form.postCode.trim()) newErrors.postCode = "Código postal é obrigatório";
    if (!form.locality.trim()) newErrors.locality = "Localidade é obrigatória";
    if (!form.price.trim()) newErrors.price = "Preço é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ser menor que 5MB');
      return;
    }

    setForm({...form, image: file});
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);

    try {
      // Cria um novo ID antecipadamente
      const newDocRef = doc(collection(db, "spaces"));
      let imageUrl = "/default-space.jpg";

      if (form.image instanceof File) {
        const imageRef = ref(storage, `spaces/${newDocRef.id}-${form.image.name}`);
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

      const spaceData = {
        id: newDocRef.id, // salva o ID no próprio doc
        name: form.name,
        modality: form.modality,
        address: form.address,
        postCode: form.postCode,
        locality: form.locality,
        price: form.price,
        image: imageUrl,
        available: form.available,
        createdAt: Timestamp.now()
      };

      await setDoc(newDocRef, spaceData);
      navigate("/spaces");
    } catch (error) {
      console.error("Erro ao criar espaço:", error);
      alert("Erro ao criar espaço. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Adicionar Espaço Esportivo</h1>

          <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img src={preview} alt="Preview" className="w-32 h-32 rounded-lg object-cover mb-2" />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-200 mb-2 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {["name", "modality", "address", "postCode", "locality", "price"].map((field) => (
            <div className="mb-3" key={field}>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} *`}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors[field] ? 'border-red-500' : ''}`}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={(e) => setForm({...form, available: e.target.checked})}
              className="w-4 h-4 mr-2"
              id="availableCheckbox"
            />
            <label htmlFor="availableCheckbox">Disponível</label>
          </div>

          <div className="flex gap-2 justify-center mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={uploading}
            >
              {uploading ? "Salvando..." : "Adicionar"}
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

export default AddSpacePage;
