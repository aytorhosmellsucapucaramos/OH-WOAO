import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Pets, Edit, Delete, Visibility, QrCode2,
  FilterList, Download, Add, CalendarToday, Phone, LocationOn, Print
} from '@mui/icons-material'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { getApiUrl, getUploadUrl } from '../../utils/urls'

const PetManagement = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPet, setSelectedPet] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedPet) {
        setSelectedPet(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [selectedPet])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedPet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPet])

  // Remove the useEffect that calls filterPets since we'll compute it directly

  const fetchPets = async () => {
    try {
      const response = await axios.get(getApiUrl('/admin/pets'))
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

  // Paginación
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPets = filteredPets.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, itemsPerPage])

  const handleViewCard = (cui) => {
    window.open(`/pet/${cui}`, '_blank')
  }

  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await axios.delete(getApiUrl(`/admin/pets/${petId}`))
        fetchPets()
      } catch (error) {
        console.error('Error deleting pet:', error)
      }
    }
  }

  const handleToggleCardStatus = async (petId, currentStatus) => {
    try {
      await axios.put(getApiUrl(`/admin/pets/${petId}/card-status`), {
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

  const handleExportExcel = () => {
    // Preparar datos para Excel
    const excelData = filteredPets.map(pet => ({
      'CUI': pet.cui || '',
      'Nombre Mascota': capitalizeText(pet.pet_name) || '',
      'Sexo': pet.sex === 'male' ? 'Macho' : pet.sex === 'female' ? 'Hembra' : '',
      'Raza': capitalizeText(pet.breed_name || pet.breed) || '',
      'Color': capitalizeText(pet.color_name || pet.color) || '',
      'Tamaño': capitalizeText(pet.size_name || pet.size) || '',
      'Edad (meses)': pet.age || '',
      'Propietario': `${capitalizeText(pet.owner_first_name)} ${capitalizeText(pet.owner_last_name)}` || '',
      'DNI Propietario': pet.owner_dni || '',
      'Teléfono': pet.owner_phone || '',
      'Email': pet.owner_email || '',
      'Dirección': pet.owner_address || '',
      'Carnet Vacunación': pet.has_vaccination_card ? 'Sí' : 'No',
      'Vacuna Antirrábica': pet.has_rabies_vaccine ? 'Sí' : 'No',
      'Carnet Impreso': pet.card_printed ? 'Sí' : 'No',
      'Fecha Registro': new Date(pet.created_at).toLocaleDateString('es-PE')
    }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mascotas');

    // Ajustar ancho de columnas
    const maxWidth = 30;
    const colWidths = [
      { wch: 15 }, // CUI
      { wch: 20 }, // Nombre
      { wch: 10 }, // Sexo
      { wch: 20 }, // Raza
      { wch: 15 }, // Color
      { wch: 12 }, // Tamaño
      { wch: 12 }, // Edad
      { wch: 25 }, // Propietario
      { wch: 12 }, // DNI
      { wch: 15 }, // Teléfono
      { wch: maxWidth }, // Email
      { wch: maxWidth }, // Dirección
      { wch: 15 }, // Carnet Vac
      { wch: 15 }, // Antirrábica
      { wch: 15 }, // Impreso
      { wch: 15 }  // Fecha
    ];
    worksheet['!cols'] = colWidths;

    // Descargar archivo
    const fileName = `Mascotas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log(`✅ Excel exportado: ${filteredPets.length} mascotas`);
  }

  const PetCard = ({ pet }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
      onClick={() => setSelectedPet(pet)}
      className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-all duration-300 cursor-pointer p-4"
    >
      <div className="flex gap-4">
        {/* Contenido Principal */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 truncate">
                {capitalizeText(pet.pet_name)}
                {pet.sex === 'male' && <span className="text-blue-600 text-sm">♂</span>}
                {pet.sex === 'female' && <span className="text-pink-600 text-sm">♀</span>}
              </h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${pet.card_printed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
                }`}>
                {pet.card_printed ? 'IMPRESO' : 'PENDIENTE'}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-mono">CUI: {pet.cui}</p>
          </div>

          {/* Info compacta */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-slate-700 text-sm">
              <Pets className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
              <span className="font-medium truncate">{capitalizeText(pet.breed_name || pet.breed || 'N/A')}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center">
                <CalendarToday className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{formatAge(pet.age)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: pet.color_hex || pet.color_name?.toLowerCase() || pet.color?.toLowerCase() || '#ccc' }}></div>
                <span className="font-medium">{capitalizeText(pet.color_name || pet.color || 'N/A')}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          {(pet.has_vaccination_card || pet.has_rabies_vaccine) && (
            <div className="flex gap-1.5 mb-3">
              {pet.has_vaccination_card && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">CARNET</span>
              )}
              {pet.has_rabies_vaccine && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">ANTIRRÁBICA</span>
              )}
            </div>
          )}

          {/* Propietario */}
          <div className="border-t border-slate-200 pt-2.5">
            <p className="text-slate-900 font-semibold text-sm truncate">{capitalizeText(pet.owner_first_name)} {capitalizeText(pet.owner_last_name)}</p>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {pet.owner_phone}
            </p>
          </div>
        </div>

        {/* Imagen en esquina superior derecha */}
        <div className="flex-shrink-0">
          {pet.photo_frontal_path ? (
            <img
              src={getUploadUrl(pet.photo_frontal_path)}
              alt={pet.pet_name}
              className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW48L3RleHQ+PC9zdmc+';
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center border-2 border-slate-200">
              <Pets className="w-10 h-10 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción - evitar propagación del click */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePrintCard(pet.cui)
          }}
          className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-2 rounded-lg transition-all flex items-center justify-center text-xs font-bold"
          title="Imprimir Carnet"
        >
          <Print className="w-4 h-4 mr-1" />
          Imprimir
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleCardStatus(pet.id, pet.card_printed)
          }}
          className={`${pet.card_printed
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-amber-500 hover:bg-amber-600'
            } text-white py-2 px-2 rounded-lg transition-all text-xs font-bold`}
          title={pet.card_printed ? 'Marcar como Pendiente' : 'Marcar como Impreso'}
        >
          {pet.card_printed ? '✓ Impreso' : '⏳ Marcar'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(pet.id)
          }}
          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-2 px-2 rounded-lg transition-all border border-red-200 hover:border-red-300"
          title="Eliminar"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )

  const PetModal = ({ pet, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Fijo */}
        <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-slate-200 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pets className="w-7 h-7 text-blue-600" />
              Detalles de {capitalizeText(pet.pet_name)}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              title="Cerrar (ESC)"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {pet.photo_frontal_path ? (
                <img
                  src={getUploadUrl(pet.photo_frontal_path)}
                  alt={pet.photo_frontal_path}
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

              {/* Información de Pago - Solo para razas peligrosas */}
              {pet.has_payments && pet.payment_id && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                    💰 Información de Pago
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-600">Recibo N°:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded">{pet.receipt_number}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-600">Fecha:</span>
                      <span>{pet.receipt_issue_date ? new Date(pet.receipt_issue_date).toLocaleDateString('es-PE') : 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-600">Pagador:</span>
                      <span className="font-semibold">{pet.receipt_payer}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-600">Monto:</span>
                      <span className="font-bold text-green-700">S/. {parseFloat(pet.receipt_amount || 0).toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-600">Tipo:</span>
                      <span className="capitalize">{pet.payment_type === 'registration' ? 'Registro' : pet.payment_type === 'renewal' ? 'Renovación' : 'Multa'}</span>
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold text-gray-600">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${pet.payment_status === 'verified' ? 'bg-green-500 text-white' :
                          pet.payment_status === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-yellow-500 text-white'
                        }`}>
                        {pet.payment_status === 'verified' ? '✓ Verificado' :
                          pet.payment_status === 'rejected' ? '✗ Rechazado' :
                            '⏳ Pendiente'}
                      </span>
                    </div>
                    {pet.payment_notes && (
                      <p className="pt-2 border-t">
                        <span className="font-semibold text-gray-600">Notas:</span>
                        <span className="text-gray-700 block mt-1">{pet.payment_notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con botones fijos */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 pt-4 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={() => handleViewCard(pet.cui)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all flex items-center justify-center font-semibold shadow-md hover:shadow-lg"
            >
              <QrCode2 className="w-5 h-5 mr-2" />
              Ver Carnet
            </button>
            <button
              onClick={() => handlePrintCard(pet.cui)}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg transition-all flex items-center justify-center font-semibold"
            >
              <Print className="w-5 h-5 mr-2" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-lg transition-all font-semibold"
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Pets className="w-7 h-7 text-black" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Gestión de Mascotas
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {filteredPets.length} {filteredPets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, propietario o CUI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div className="relative">
            <FilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none text-sm bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendiente impresión</option>
              <option value="delivered">Entregados</option>
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center font-bold text-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Excel ({filteredPets.length})
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {currentPets.map((pet) => (
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

      {/* Paginación */}
      {filteredPets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span className="text-sm text-slate-600">
              de {filteredPets.length} mascota{filteredPets.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Primera página"
            >
              <span className="text-sm font-semibold">««</span>
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Anterior"
            >
              <span className="text-sm font-semibold">«</span>
            </button>
            
            <span className="px-4 py-2 text-sm text-slate-700 font-medium">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Siguiente"
            >
              <span className="text-sm font-semibold">»</span>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Última página"
            >
              <span className="text-sm font-semibold">»»</span>
            </button>
          </div>
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
