import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3001/bookings";

const AddBookingPage = () => {
  const [form, setForm] = useState({
    title: "",
    space: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    status: "pending"
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.space.trim()) newErrors.space = "Espaço Desportivo é obrigatório";
    if (!form.date) newErrors.date = "Data é obrigatório";
    if (!form.startTime) newErrors.startTime = "Hora de inicio é obrigatório";
    if (!form.endTime) newErrors.endTime = "Hora de fim é obrigatório";
    
    // Validate time logic
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;  // Changed from title to name
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const bookingData = {
        title: form.title,
        space: form.space,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description,
        status: form.status,
        createdAt: new Date().toISOString()
      };
  
      console.log("Creating booking with:", bookingData);
      const response = await axios.post(API_URL, bookingData);
      console.log("Booking created:", response.data);
      
      navigate("/bookings");
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Adicionar Reserva</h1>
          
          {/* Title Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Titulo *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Reservado por:"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Espaço Desportivo *</label>
            <input
              name="space"
              value={form.space}
              onChange={handleChange}
              placeholder="Espaço Desportivo"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.space ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.space}</p>}
          </div>

          {/* Date and Status Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hora Inicial *</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.startTime ? 'border-red-500' : ''}`}
              />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora Final *</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${errors.endTime ? 'border-red-500' : ''}`}
              />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mais informações"
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookingPage;