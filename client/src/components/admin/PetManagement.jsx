import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Pets, Edit, Delete, Visibility, QrCode2,
  FilterList, Download, Add, CalendarToday, Phone, LocationOn
} from '@mui/icons-material'
import axios from 'axios'

const PetManagement = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPet, setSelectedPet] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPets()
  }, [])

  // Remove the useEffect that calls filterPets since we'll compute it directly

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pets')
      setPets(response.data)
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Compute filtered pets directly
  const filteredPets = Array.isArray(pets) ? pets.filter(pet => {
    const matchesSearch = searchTerm === '' || 
      pet.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.cui?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && pet.status === 'active') ||
      (filterStatus === 'pending' && !pet.card_printed) ||
      (filterStatus === 'delivered' && pet.card_printed)
    
    return matchesSearch && matchesStatus
  }) : []

  const handleViewCard = (cui) => {
    window.open(`/pet/${cui}`, '_blank')
  }

  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/pets/${petId}`)
        fetchPets()
      } catch (error) {
        console.error('Error deleting pet:', error)
      }
    }
  }

  const PetCard = ({ pet }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        {pet.photo_path ? (
          <img
            src={`http://localhost:5000/api/uploads/${pet.photo_path}`}
            alt={pet.pet_name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Pets className="w-16 h-16 text-white" />
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            pet.species.toLowerCase() === 'perro' 
              ? 'bg-orange-500 text-white' 
              : 'bg-teal-500 text-white'
          }`}>
            {pet.species}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {pet.pet_name} {pet.pet_last_name}
            </h3>
            <p className="text-gray-600 text-sm">CUI: {pet.cui}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Pets className="w-4 h-4 mr-2" />
            <span>{pet.breed}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <CalendarToday className="w-4 h-4 mr-2" />
            <span>Adoptado: {new Date(pet.adoption_date).toLocaleDateString('es-PE')}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="w-4 h-4 mr-2" />
            <span>{pet.phone}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <LocationOn className="w-4 h-4 mr-2" />
            <span>{pet.district}, {pet.province}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-2">Adoptante:</p>
          <p className="text-gray-600">{pet.adopter_name} {pet.adopter_last_name}</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleViewCard(pet.cui)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <QrCode2 className="w-4 h-4 mr-2" />
            Ver Carnet
          </button>
          <button
            onClick={() => setSelectedPet(pet)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Visibility className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(pet.id)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const PetModal = ({ pet, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Detalles de {pet.pet_name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {pet.photo_path ? (
                <img
                  src={`http://localhost:5000/api/uploads/${pet.photo_path}`}
                  alt={pet.pet_name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Pets className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Información de la Mascota</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">CUI:</span> {pet.cui}</p>
                  <p><span className="font-medium">Nombre:</span> {pet.pet_name} {pet.pet_last_name}</p>
                  <p><span className="font-medium">Especie:</span> {pet.species}</p>
                  <p><span className="font-medium">Raza:</span> {pet.breed}</p>
                  <p><span className="font-medium">Fecha de Adopción:</span> {new Date(pet.adoption_date).toLocaleDateString('es-PE')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Información del Adoptante</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nombre:</span> {pet.adopter_name} {pet.adopter_last_name}</p>
                  <p><span className="font-medium">DNI:</span> {pet.dni}</p>
                  <p><span className="font-medium">Teléfono:</span> {pet.phone}</p>
                  <p><span className="font-medium">Dirección:</span> {pet.address}</p>
                  <p><span className="font-medium">Ubicación:</span> {pet.district}, {pet.province}, {pet.department}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleViewCard(pet.cui)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <QrCode2 className="w-5 h-5 mr-2" />
              Ver Carnet Digital
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🐾 Gestión de Mascotas
          </h2>
          <p className="text-gray-600">
            Total: {filteredPets.length} mascotas registradas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, adoptante o CUI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendiente impresión</option>
              <option value="delivered">Entregados</option>
            </select>
          </div>

          <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </AnimatePresence>
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-12">
          <Pets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron mascotas</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedPet && (
          <PetModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PetManagement
