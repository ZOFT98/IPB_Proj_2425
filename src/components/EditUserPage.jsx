import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3001/users";
const UPLOAD_URL = "http://localhost:3001/upload";

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
    picture: ""
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        setForm(response.data);
        setPreview(response.data.picture);
      } catch (error) {
        console.error("Error fetching user:", error);
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
    if (!form.birthdate) newErrors.birthdate = "Data de nascimento é obrigatória";
    if (!form.gender) newErrors.gender = "Gênero é obrigatório";
    
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

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ser menor que 5MB');
      return;
    }

    setForm({...form, picture: file});
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      console.log("Starting update process...");
      let imagePath = form.picture;
      
      if (form.picture instanceof File) {
        console.log("New image detected, preparing upload...");
        const formData = new FormData();
        formData.append('image', form.picture);
        
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
  
      const userData = {
        name: form.name,
        email: form.email,
        address: form.address,
        contact: form.contact,
        birthdate: form.birthdate,
        gender: form.gender,
        picture: imagePath
      };
  
      console.log("Sending user update:", userData);
      const response = await axios.put(`${API_URL}/${id}`, userData);
      console.log("Update successful:", response.data);
      
      navigate("/users");
    } catch (error) {
      console.error("UPDATE ERROR DETAILS:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      alert(`Erro ao atualizar usuário: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="dark:text-gray-100">
    <div className="mx-auto max-w-md px-4 py-8">
      
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Editar Usuário</h1>

        <div className="mb-4 flex flex-col items-center">
            {preview ? (
              <img 
                src={typeof preview === 'string' ? preview : URL.createObjectURL(preview)} 
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
          
          {/* Email Field */}
          <div className="mb-3">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          {/* Address Field */}
          <div className="mb-3">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Morada *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.address ? 'border-red-500' : ''}`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          {/* Contact Field */}
          <div className="mb-3">
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Contato *"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.contact ? 'border-red-500' : ''}`}
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
          </div>
          
          {/* Birthdate Field */}
          <div className="mb-3">
            <input
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.birthdate ? 'border-red-500' : ''}`}
            />
            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
          </div>
          
          {/* Gender Field */}
          <div className="mb-4">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.gender ? 'border-red-500' : ''}`}
            >
              <option value="">Gênero *</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
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