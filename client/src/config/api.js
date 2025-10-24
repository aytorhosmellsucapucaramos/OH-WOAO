// API Configuration
// Usa variable de entorno VITE_API_URL si está disponible, sino localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// API Endpoints
export const API_ENDPOINTS = {
  // Pets
  pets: `${API_BASE_URL}/api/pets`,
  petByCUI: (cui) => `${API_BASE_URL}/api/pet/${cui}`,
  register: `${API_BASE_URL}/api/register`,
  
  // Stray Reports
  strayReports: `${API_BASE_URL}/api/stray-reports`,
  
  // Admin
  adminPets: `${API_BASE_URL}/api/admin/pets`,
  adminDeletePet: (id) => `${API_BASE_URL}/api/admin/pets/${id}`,
  
  // Uploads
  uploads: (filename) => `${API_BASE_URL}/api/uploads/${filename}`,
  
  // Health
  health: `${API_BASE_URL}/api/health`
}

export default API_BASE_URL
