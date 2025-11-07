// API Configuration
// En desarrollo, usa rutas relativas para aprovechar el proxy de Vite (funciona en móvil)
// En producción, usa variable de entorno VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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
