import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import LeafletMap from "./LeafletMap";
import { notify } from "../services/notificationService";

const AddSpacePage = () => {
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
    image: null,
    available: true,
    latitude: "",
    longitude: "",
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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
    if (!form.maxCapacity)
      newErrors.maxCapacity = "Lotação máxima é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMapClick = (latlng) => {
    setForm((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
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

    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);

    try {
      // Cria um novo ID antecipadamente
      const newDocRef = doc(collection(db, "spaces"));
      let imageUrl = "";

      if (form.image instanceof File) {
        const imageRef = ref(
          storage,
          `spaces/${newDocRef.id}-${form.image.name}`,
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

      const spaceData = {
        id: newDocRef.id,
        name: form.name,
        modality: form.modality,
        address: form.address,
        postCode: form.postCode,
        locality: form.locality,
        price: form.price,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        maxCapacity: form.maxCapacity,
        image: imageUrl,
        available: form.available,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        createdAt: Timestamp.now(),
      };

      await setDoc(newDocRef, spaceData);
      notify("Instalação Desportiva adicionada com sucesso!", "success");
      navigate("/spaces");
    } catch (error) {
      console.error("Erro ao criar espaço:", error);
      notify("Erro ao criar espaço. Tente novamente.", "error");
    } finally {
      setUploading(false);
    }
  };

  const fields = [
    { name: "name", label: "Nome", type: "text" },
    { name: "address", label: "Morada", type: "text" },
  ];

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Adicionar Instalação Desportiva
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Coluna da Esquerda */}
            <div>
              <div className="mb-4 flex flex-col items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover mb-2"
                  />
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
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors[field.name] ? "border-red-500" : ""}`}
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
                  <label
                    htmlFor="postCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Código-postal *
                  </label>
                  <input
                    id="postCode"
                    type="text"
                    name="postCode"
                    value={form.postCode}
                    onChange={handleChange}
                    placeholder="0000-000"
                    pattern="\d{4}-\d{3}"
                    title="O formato deve ser XXXX-XXX"
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.postCode ? "border-red-500" : ""}`}
                  />
                  {errors.postCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postCode}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="locality"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Localidade *
                  </label>
                  <input
                    id="locality"
                    type="text"
                    name="locality"
                    value={form.locality}
                    onChange={handleChange}
                    placeholder="Localidade"
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.locality ? "border-red-500" : ""}`}
                  />
                  {errors.locality && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.locality}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Preço por hora *
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Preço por hora"
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.price ? "border-red-500" : ""}`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="maxCapacity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Lotação Máxima *
                  </label>
                  <input
                    id="maxCapacity"
                    type="number"
                    name="maxCapacity"
                    value={form.maxCapacity}
                    onChange={handleChange}
                    placeholder="Lotação Máxima"
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.maxCapacity ? "border-red-500" : ""}`}
                  />
                  {errors.maxCapacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxCapacity}
                    </p>
                  )}
                </div>
              </div>

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
                  {errors.openingTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.openingTime}
                    </p>
                  )}
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
                  {errors.closingTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.closingTime}
                    </p>
                  )}
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
                  <option value="Outros">Outros Eventos</option>
                </select>
                {errors.modality && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.modality}
                  </p>
                )}
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={(e) =>
                    setForm({ ...form, available: e.target.checked })
                  }
                  className="w-4 h-4 mr-2"
                  id="availableCheckbox"
                />
                <label htmlFor="availableCheckbox">Disponível</label>
              </div>
            </div>

            {/* Coluna da Direita */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Localização no Mapa
                </label>
                <div style={{ height: "400px", width: "100%" }}>
                  <LeafletMap
                    center={[41.79685, -6.76843]}
                    zoom={15}
                    onClick={handleMapClick}
                    markers={
                      form.latitude && form.longitude
                        ? [{ position: [form.latitude, form.longitude] }]
                        : []
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    value={form.latitude}
                    onChange={handleChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    value={form.longitude}
                    onChange={handleChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    readOnly
                  />
                </div>
              </div>
            </div>
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
