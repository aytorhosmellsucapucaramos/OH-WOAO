import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Pets, Edit, Delete, Visibility, QrCode2,
  FilterList, Download, Add, CalendarToday, Phone, LocationOn, Print
} from '@mui/icons-material'
import axios from 'axios'

const PetManagement = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPet, setSelectedPet] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Función para capitalizar texto
  const capitalizeText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Función para convertir meses a formato legible
  const formatAge = (months) => {
    if (!months) return 'N/A';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  // Remove the useEffect that calls filterPets since we'll compute it directly

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/pets')
      const petsData = response.data.data || [];
      
      // LOG TEMPORAL para diagnóstico
      console.log('🎯 Datos recibidos en PetManagement:');
      console.log('Total mascotas:', petsData.length);
      if (petsData.length > 0) {
        console.log('Primera mascota FRONTEND:', {
          cui: petsData[0].cui,
          pet_name: petsData[0].pet_name,
          breed_name: petsData[0].breed_name,
          color_name: petsData[0].color_name,
          size_name: petsData[0].size_name,
          breed: petsData[0].breed,
          color: petsData[0].color,
          size: petsData[0].size
        });
      }
      
      setPets(petsData)
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

  const handleToggleCardStatus = async (petId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/pets/${petId}/card-status`, {
        card_printed: !currentStatus
      })
      fetchPets()
    } catch (error) {
      console.error('Error updating card status:', error)
    }
  }

  const handlePrintCard = (cui) => {
    // Abrir carnet en nueva ventana y activar impresión
    const printWindow = window.open(`/pet/${cui}`, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 1000)
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
        {pet.photo_frontal_path ? (
          <img
            src={`http://localhost:5000/api/uploads/${pet.photo_frontal_path}`}
            alt={pet.pet_name}
            className="w-full h-56 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-600 flex items-center justify-center">
            <Pets className="w-20 h-20 text-white opacity-80" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
            pet.card_printed 
              ? 'bg-green-500/90 text-white' 
              : 'bg-yellow-500/90 text-white'
          }`}>
            {pet.card_printed ? '✓ Impreso' : '⏳ Pendiente'}
          </span>
        </div>
        {pet.has_vaccination_card && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/90 text-white shadow-lg backdrop-blur-sm">
              💉 Vacunas
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            {capitalizeText(pet.pet_name)}
            <span className="text-lg">
              {pet.sex === 'male' ? '♂️' : pet.sex === 'female' ? '♀️' : ''}
            </span>
          </h3>
          <p className="text-gray-500 text-sm font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">CUI: {pet.cui}</p>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
            <Pets className="w-4 h-4 mr-2 text-cyan-600" />
            <span className="font-medium">{capitalizeText(pet.breed_name || pet.breed || 'N/A')}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center">
              <CalendarToday className="w-4 h-4 mr-2 text-purple-500" />
              <span className="font-medium">{formatAge(pet.age)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400" style={{ backgroundColor: pet.color_hex || pet.color_name?.toLowerCase() || pet.color?.toLowerCase() || '#ccc' }}></div>
              <span className="text-xs font-semibold">{capitalizeText(pet.color_name || pet.color || 'N/A')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {pet.has_vaccination_card && (
              <div className="flex-1 text-center bg-green-50 border border-green-200 text-green-700 text-xs py-1.5 px-2 rounded-lg font-semibold">
                ✓ Carnet
              </div>
            )}
            {pet.has_rabies_vaccine && (
              <div className="flex-1 text-center bg-blue-50 border border-blue-200 text-blue-700 text-xs py-1.5 px-2 rounded-lg font-semibold">
                ✓ Antirrábica
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-3 mb-4">
          <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">Propietario:</p>
          <p className="text-gray-800 font-semibold">{capitalizeText(pet.owner_first_name)} {capitalizeText(pet.owner_last_name)}</p>
          <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
            <Phone className="w-3 h-3" />
            {pet.owner_phone}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleViewCard(pet.cui)}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm font-semibold"
          >
            <QrCode2 className="w-4 h-4 mr-1" />
            Ver
          </button>
          <button
            onClick={() => handlePrintCard(pet.cui)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm font-semibold"
            title="Imprimir Carnet"
          >
            <Print className="w-4 h-4 mr-1" />
            Imprimir
          </button>
          <button
            onClick={() => handleToggleCardStatus(pet.id, pet.card_printed)}
            className={`flex-1 ${(
              pet.card_printed 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            )} text-white py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs font-semibold`}
          >
            {pet.card_printed ? '↻ Pendiente' : '✓ Marcar'}
          </button>
          <button
            onClick={() => setSelectedPet(pet)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Visibility className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(pet.id)}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
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
              {pet.photo_frontal_path ? (
                <img
                  src={`http://localhost:5000/api/uploads/${pet.photo_frontal_path}`}
                  alt={pet.photo_frontal_path }
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<div class="w-full h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center"><svg class="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"></path></svg></div>';
                  }}
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-600 rounded-xl flex items-center justify-center">
                  <Pets className="w-20 h-20 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200">
                <h3 className="font-bold text-cyan-900 mb-3 text-lg flex items-center gap-2">
                  🐕 Información de la Mascota
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">CUI:</span> <span className="font-mono bg-white px-2 py-0.5 rounded">{pet.cui}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Nombre:</span> <span className="font-semibold">{capitalizeText(pet.pet_name)} {pet.sex === 'male' ? '♂️' : pet.sex === 'female' ? '♀️' : ''}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Raza:</span> <span>{capitalizeText(pet.breed_name || pet.breed || 'N/A')}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Tamaño:</span> <span>{capitalizeText(pet.size_name || pet.size || 'N/A')}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Edad:</span> <span className="font-semibold">{formatAge(pet.age)}</span></p>
                  <p className="flex justify-between items-center"><span className="font-semibold text-gray-600">Color:</span> <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: pet.color_hex || pet.color_name?.toLowerCase() || pet.color?.toLowerCase() || '#ccc' }}></div>{capitalizeText(pet.color_name || pet.color || 'N/A')}</span></p>
                  {pet.additional_features && (
                    <p><span className="font-semibold text-gray-600">Características:</span> <span className="text-gray-700">{pet.additional_features}</span></p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <span className={`flex-1 text-center py-1 px-2 rounded text-xs font-semibold ${pet.has_vaccination_card ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pet.has_vaccination_card ? '✓' : '✗'} Carnet
                    </span>
                    <span className={`flex-1 text-center py-1 px-2 rounded text-xs font-semibold ${pet.has_rabies_vaccine ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pet.has_rabies_vaccine ? '✓' : '✗'} Antirrábica
                    </span>
                  </div>
                  {pet.medical_history && (
                    <p className="pt-2 border-t"><span className="font-semibold text-gray-600">Antecedentes:</span> <span className="text-gray-700 block mt-1">{pet.medical_history}</span></p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                  👤 Información del Propietario
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Nombre:</span> <span className="font-semibold">{capitalizeText(pet.owner_first_name)} {capitalizeText(pet.owner_last_name)}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">DNI:</span> <span className="font-mono">{pet.owner_dni}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Email:</span> <span className="text-xs">{pet.owner_email}</span></p>
                  <p className="flex justify-between"><span className="font-semibold text-gray-600">Teléfono:</span> <span className="font-mono">{pet.owner_phone}</span></p>
                  <p><span className="font-semibold text-gray-600">Dirección:</span> <span className="text-gray-700 block mt-1">{pet.owner_address}</span></p>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-gray-600">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${pet.card_printed ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                      {pet.card_printed ? '✓ Impreso' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <p className="flex justify-between text-xs"><span className="font-semibold text-gray-600">Registrado:</span> <span>{new Date(pet.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleViewCard(pet.cui)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <QrCode2 className="w-5 h-5 mr-2" />
              Ver Carnet
            </button>
            <button
              onClick={() => handlePrintCard(pet.cui)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Print className="w-5 h-5 mr-2" />
              Imprimir
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
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
