import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import LeafletMap from "./LeafletMap";
import { notify } from "../services/notificationService";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaSignature,
  FaMapMarkerAlt,
  FaMapPin,
  FaEuroSign,
  FaUsers,
  FaClock,
  FaFutbol,
} from "react-icons/fa";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsModalOpen(true);
  };

  return (
    <div className="dark:text-gray-100 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Adicionar Instalação Desportiva
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Coluna da Esquerda */}
            <div>
              <div className="mb-6 flex flex-col items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 rounded-lg object-cover mb-4 border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
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

              {/* Nome */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nome *
                </label>
                <div className="relative">
                  <FaSignature className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nome da Instalação"
                    className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Morada */}
              <div className="mb-4">
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
                    type="text"
                    name="address"
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Código Postal */}
                <div>
                  <label
                    htmlFor="postCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Código-postal *
                  </label>
                  <div className="relative">
                    <FaMapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="postCode"
                      type="text"
                      name="postCode"
                      value={form.postCode}
                      onChange={handleChange}
                      placeholder="0000-000"
                      pattern="\d{4}-\d{3}"
                      title="O formato deve ser XXXX-XXX"
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.postCode ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.postCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postCode}
                    </p>
                  )}
                </div>
                {/* Localidade */}
                <div>
                  <label
                    htmlFor="locality"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Localidade *
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="locality"
                      type="text"
                      name="locality"
                      value={form.locality}
                      onChange={handleChange}
                      placeholder="Localidade"
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.locality ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.locality && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.locality}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Preço */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Preço por hora *
                  </label>
                  <div className="relative">
                    <FaEuroSign className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Preço"
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.price ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
                {/* Lotação */}
                <div>
                  <label
                    htmlFor="maxCapacity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Lotação Máxima *
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="maxCapacity"
                      type="number"
                      name="maxCapacity"
                      value={form.maxCapacity}
                      onChange={handleChange}
                      placeholder="Lotação"
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.maxCapacity ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.maxCapacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxCapacity}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Hora Abertura */}
                <div>
                  <label
                    htmlFor="openingTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Abertura *
                  </label>
                  <div className="relative">
                    <FaClock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      value={form.openingTime}
                      onChange={handleChange}
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.openingTime ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.openingTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.openingTime}
                    </p>
                  )}
                </div>
                {/* Hora Fecho */}
                <div>
                  <label
                    htmlFor="closingTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Fecho *
                  </label>
                  <div className="relative">
                    <FaClock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      value={form.closingTime}
                      onChange={handleChange}
                      className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                        errors.closingTime ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.closingTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.closingTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Modalidade */}
              <div className="mb-4">
                <label
                  htmlFor="modality"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Modalidade *
                </label>
                <div className="relative">
                  <FaFutbol className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="modality"
                    name="modality"
                    value={form.modality}
                    onChange={handleChange}
                    className={`w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 ${
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
                </div>
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

          <div className="flex gap-4 justify-center mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={uploading}
            >
              {uploading ? "Salvando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/spaces")}
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
        title="Confirmar Instalação"
        message="Tem certeza de que deseja adicionar esta instalação desportiva?"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default AddSpacePage;
