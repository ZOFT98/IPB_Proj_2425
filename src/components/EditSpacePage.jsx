import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import defaultSpaceImage from "../uploads/field1.jpg";

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
    openingTime: "",
    closingTime: "",
    maxCapacity: "",
    image: "",
    available: true,
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
          if (data.image && data.image.startsWith("https://")) {
            setPreview(data.image);
          } else {
            setPreview(defaultSpaceImage);
          }
        } else {
          alert("Espaço não encontrado");
          navigate("/spaces");
        }
      } catch (error) {
        alert("Erro ao carregar espaço.", error);
      }
    };

    fetchSpace();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.modality.trim()) newErrors.modality = "Modalidade é obrigatória";
    if (!form.address.trim()) newErrors.address = "Morada é obrigatória";
    if (!form.postCode.trim()) {
      newErrors.postCode = "Código postal é obrigatório";
    } else if (!/^(\d{4}-\d{3})$/.test(form.postCode)) {
      newErrors.postCode = "Formato de código postal inválido. Use XXXX-XXX.";
    }
    if (!form.locality.trim()) newErrors.locality = "Localidade é obrigatória";
    if (!form.price.trim()) newErrors.price = "Preço é obrigatório";
    if (!form.openingTime)
      newErrors.openingTime = "Hora de abertura é obrigatória";
    if (!form.closingTime)
      newErrors.closingTime = "Hora de fecho é obrigatória";
    if (
      form.openingTime &&
      form.closingTime &&
      form.openingTime >= form.closingTime
    ) {
      newErrors.closingTime =
        "Hora de fecho deve ser depois da hora de abertura";
    }
    if (!form.maxCapacity.toString().trim())
      newErrors.maxCapacity = "Lotação máxima é obrigatória";
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
        const imageRef = ref(
          storage,
          `spaces/${Date.now()}-${form.image.name}`,
        );
        const uploadTask = uploadBytesResumable(imageRef, form.image);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            },
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
      alert("Erro ao atualizar espaço. Tente novamente.", error);
    } finally {
      setUploading(false);
    }
  };

  const fields = [
    { name: "name", label: "Nome", type: "text" },
    { name: "address", label: "Morada", type: "text" },
    {
      name: "postCode",
      label: "Código-postal",
      type: "text",
      pattern: "\\d{4}-\\d{3}",
      title: "O formato deve ser XXXX-XXX",
    },
    { name: "locality", label: "Localidade", type: "text" },
    { name: "price", label: "Preço por hora", type: "number" },
    { name: "maxCapacity", label: "Lotação Máxima", type: "number" },
  ];

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Editar Instalação Desportiva
          </h1>

          <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover mb-2"
              />
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

          {fields.map((field) => (
            <div className="mb-3" key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {field.label} *
              </label>
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.label}
                pattern={field.pattern}
                title={field.title}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                  errors[field.name] ? "border-red-500" : ""
                }`}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor="openingTime">Hora de Abertura *</label>
              <input
                id="openingTime"
                name="openingTime"
                type="time"
                value={form.openingTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.openingTime ? "border-red-500" : ""}`}
              />
              {errors.openingTime && <p>{errors.openingTime}</p>}
            </div>
            <div>
              <label htmlFor="closingTime">Hora de Fecho *</label>
              <input
                id="closingTime"
                name="closingTime"
                type="time"
                value={form.closingTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.closingTime ? "border-red-500" : ""}`}
              />
              {errors.closingTime && <p>{errors.closingTime}</p>}
            </div>
          </div>

          <div className="mb-3">
            <label
              htmlFor="modality"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Modalidade *
            </label>
            <select
              id="modality"
              name="modality"
              value={form.modality}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                errors.modality ? "border-red-500" : ""
              }`}
            >
              <option value="">Selecione a Modalidade</option>
              <option value="Futebol">Futebol</option>
              <option value="Basquetebol">Basquetebol</option>
              <option value="Tenis">Ténis</option>
              <option value="Futsal">Futsal</option>
            </select>
            {errors.modality && (
              <p className="text-red-500 text-sm mt-1">{errors.modality}</p>
            )}
          </div>

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
