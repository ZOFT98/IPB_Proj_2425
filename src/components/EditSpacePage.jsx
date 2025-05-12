import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3001/spaces";
const UPLOAD_URL = "http://localhost:3001/upload";

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

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        setForm(response.data);
        setPreview(response.data.image);
      } catch (error) {
        console.error("Error fetching space:", error);
        navigate("/spaces/edit/:id");
      }
    };
    fetchSpace();
  }, [id, navigate]);

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
  
    try {
      console.log("Starting update process...");
      let imagePath = form.image;
      
      if (form.image instanceof File) {
        console.log("New image detected, preparing upload...");
        const formData = new FormData();
        formData.append('image', form.image);
        
        console.log("Uploading image to:", UPLOAD_URL);
        const uploadResponse = await axios.post(UPLOAD_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log("Upload response:", uploadResponse.data);
        
        if (!uploadResponse.data?.path) {
          throw new Error("Server didn't return image path");
        }
        imagePath = uploadResponse.data.path;
        console.log("New image path:", imagePath);
      }
  
      const spaceData = {
        name: form.name,
        modality: form.modality,
        address: form.address,
        postCode: form.postCode,
        locality: form.locality,
        price: form.price,
        image: imagePath,
        available: form.available
      };
  
      console.log("Sending space update:", spaceData);
      const response = await axios.put(`${API_URL}/${id}`, spaceData);
      console.log("Update successful:", response.data);
      
      navigate("/spaces");
    } catch (error) {
      console.error("UPDATE ERROR DETAILS:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      alert(`Erro ao atualizar espaço: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Editar Espaço Esportivo</h1>

          <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img 
                src={typeof preview === 'string' ? preview : URL.createObjectURL(preview)} 
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
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Name Field */}
          <div className="mb-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          {/* Modality Field */}
          <div className="mb-3">
            <input
              name="modality"
              value={form.modality}
              onChange={handleChange}
              placeholder="Modalidade *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.modality ? 'border-red-500' : ''}`}
            />
            {errors.modality && <p className="text-red-500 text-sm mt-1">{errors.modality}</p>}
          </div>
          
          {/* Address Field */}
          <div className="mb-3">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Endereço *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.address ? 'border-red-500' : ''}`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          {/* Post Code Field */}
          <div className="mb-3">
            <input
              name="postCode"
              value={form.postCode}
              onChange={handleChange}
              placeholder="Código Postal *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.postCode ? 'border-red-500' : ''}`}
            />
            {errors.postCode && <p className="text-red-500 text-sm mt-1">{errors.postCode}</p>}
          </div>
          
          {/* Locality Field */}
          <div className="mb-3">
            <input
              name="locality"
              value={form.locality}
              onChange={handleChange}
              placeholder="Localidade *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.locality ? 'border-red-500' : ''}`}
            />
            {errors.locality && <p className="text-red-500 text-sm mt-1">{errors.locality}</p>}
          </div>
          
          {/* Price Field */}
          <div className="mb-3">
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Preço *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          
          {/* Available Field */}
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
            >
              Atualizar
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