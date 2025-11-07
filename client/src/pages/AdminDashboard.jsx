import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { getUploadUrl, getApiUrl } from '../utils/urls'
import {
  Pets,
  Dashboard,
  Report,
  People,
  BarChart,
  Settings,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Add,
  Refresh,
  Print,
  QrCode,
  LocationOn,
  Warning,
  Info,
  Map as MapIcon,
  Logout,
  Phone
} from '@mui/icons-material'
import PetManagement from '../components/admin/PetManagement'
import UserManagement from '../components/admin/UserManagement'
import Analytics from '../components/admin/Analytics'
import MunicipalUsersList from '../components/admin/MunicipalUsersList'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pets, setPets] = useState([])
  const [strayReports, setStrayReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dashboardStats, setDashboardStats] = useState({
    totalPets: 0,
    totalUsers: 0,
    activeReports: 0,
    cardsPrinted: 0,
    cardsPending: 0
  })

  // Obtener datos del usuario del localStorage
  const [currentUser, setCurrentUser] = useState({
    name: 'Usuario',
    role: 'Admin'
  })

  useEffect(() => {
    // Obtener datos del usuario
    const userData = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const roleName = userRole === 'super_admin' ? 'Super Admin' :
          userRole === 'admin' ? 'Administrador' :
            userRole === 'seguimiento' ? 'Seguimiento' : 'Usuario'
        setCurrentUser({
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Usuario',
          role: roleName
        })
      } catch (e) {
        console.error('Error al parsear datos de usuario:', e)
      }
    }

    fetchData()
    fetchStats()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pets
      const petsResponse = await fetch(getApiUrl('/admin/pets'))
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData.data || [])
      }

      // Fetch stray reports
      const reportsResponse = await fetch(getApiUrl('/admin/stray-reports'))
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setStrayReports(reportsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('/admin/stats'))
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handlePrintPet = (cui) => {
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

  const handlePrintMultiplePets = () => {
    if (pets.length === 0) {
      alert('No hay mascotas para imprimir')
      return
    }
    // Imprimir carnets seleccionados o todos
    alert('Funcionalidad de impresión masiva en desarrollo')
  }

  const handleStatusUpdate = async (reportId, newStatus) => {
    const loadingToast = toast.loading('Actualizando estado...')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(getApiUrl(`/admin/stray-reports/${reportId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()

        // Mostrar mensaje especial si se asignó automáticamente
        if (newStatus === 'in_progress' && data.data?.assigned_to) {
          toast.success('✅ Estado actualizado y caso asignado automáticamente', {
            id: loadingToast,
            duration: 4000,
          })
        } else {
          toast.success('Estado actualizado correctamente', {
            id: loadingToast,
            icon: '✅',
            duration: 3000,
          })
        }

        fetchData()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al actualizar el estado', {
          id: loadingToast,
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        id: loadingToast,
      })
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteReport = async (reportId) => {
    // Alerta personalizada con animación
    toast((t) => (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-2">
          <Warning className="text-red-500 w-6 h-6" />
          <span className="font-bold text-gray-800">¿Eliminar reporte?</span>
        </div>
        <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              const loadingToast = toast.loading('Eliminando reporte...')

              try {
                const response = await fetch(getApiUrl(`/admin/stray-reports/${reportId}`), {
                  method: 'DELETE'
                })

                if (response.ok) {
                  toast.success('Reporte eliminado correctamente', {
                    id: loadingToast,
                    icon: '🗑️',
                  })
                  fetchData()
                  fetchStats()
                } else {
                  toast.error('Error al eliminar el reporte', {
                    id: loadingToast,
                  })
                }
              } catch (error) {
                toast.error('Error de conexión', {
                  id: loadingToast,
                })
                console.error('Error deleting report:', error)
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      },
    })
  }

  const filteredReports = strayReports.filter(report => {
    const reporterName = `${report.reporter_first_name || ''} ${report.reporter_last_name || ''}`.trim()
    const matchesSearch = reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${isActive
        ? 'text-slate-900 border-b-3 border-blue-600'
        : 'text-slate-500 hover:text-slate-700 border-b-3 border-transparent hover:border-slate-300'
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  )

  const StatCard = ({ title, value, icon, color, gradient, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value || 0}</p>
    </motion.div>
  )

  const PetCard = ({ pet }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <img
          src={pet.photo_path ? getUploadUrl(pet.photo_path) : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100'}
          alt={pet.pet_name}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-cyan-200"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{pet.pet_name}</h3>
          <p className="text-sm sm:text-base text-gray-600 truncate">{pet.breed} • {pet.age} años</p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">CUI: {pet.cui}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => window.open(`/pet/${pet.cui}`, '_blank')}
            className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
            title="Ver Carnet"
          >
            <Visibility />
          </button>
          <button
            onClick={() => handlePrintPet(pet.cui)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Imprimir Carnet"
          >
            <Print />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const ReportCard = ({ report }) => {
    const [selectedStatus, setSelectedStatus] = useState(report.status)
    const reporterName = `${report.reporter_first_name || ''} ${report.reporter_last_name || ''}`.trim() || 'Usuario anónimo'

    const statusConfig = {
      active: { label: 'Activo', color: 'bg-red-50 text-red-700 border border-red-200' },
      pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
      in_progress: { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
      resolved: { label: 'Resuelto', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      closed: { label: 'Cerrado', color: 'bg-slate-100 text-slate-700 border border-slate-200' }
    }

    const currentStatus = statusConfig[report.status] || statusConfig.active

    const handleViewLocation = () => {
      if (report.latitude && report.longitude) {
        const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
        window.open(url, '_blank')
      } else {
        toast.error('No hay coordenadas disponibles')
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -3 }}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
      >
        {/* Header con estado */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-lg text-slate-900">{report.breed || 'Perro Callejero'}</h3>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-600">
                <People className="w-4 h-4" />
                <span className="text-sm font-medium">{reporterName}</span>
              </div>
              {report.reporter_phone && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{report.reporter_phone}</span>
                </div>
              )}
              {report.assigned_first_name && report.assigned_last_name && (
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {report.assigned_first_name} {report.assigned_last_name}
                    {report.assigned_employee_code && ` (${report.assigned_employee_code})`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación con botón de mapa */}
        {(report.latitude && report.longitude) && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <LocationOn className="text-slate-600 w-5 h-5" />
                  <span className="font-semibold text-slate-900">Ubicación</span>
                </div>
                <p className="text-sm text-slate-700 mb-1">{report.address || 'Dirección no especificada'}</p>
                <p className="text-xs text-slate-500">Lat: {report.latitude}, Lng: {report.longitude}</p>
              </div>
              <button
                onClick={handleViewLocation}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                title="Ver en Google Maps"
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Descripción */}
        {report.description && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{report.description}</p>
          </div>
        )}

        {/* Características */}
        <div className="mb-4 flex flex-wrap gap-2">
          {report.size_name && (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
              {report.size_name}
            </span>
          )}
          {report.temperament_name && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
              {report.temperament_name}
            </span>
          )}
          {report.urgency_level && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">
              Urgencia: {report.urgency_level}
            </span>
          )}
        </div>

        {/* Acciones: Dropdown de estado + Eliminar */}
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              const newStatus = e.target.value
              setSelectedStatus(newStatus)
              handleStatusUpdate(report.id, newStatus)
            }}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm bg-white hover:bg-slate-50"
          >
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
          <button
            onClick={() => handleDeleteReport(report.id)}
            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-2.5 px-4 rounded-lg transition-all flex items-center space-x-2 border border-red-200 hover:border-red-300 font-medium"
            title="Eliminar reporte"
          >
            <Delete className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>

        {/* Fecha de reporte */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Reportado el: {new Date(report.created_at).toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </motion.div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Mascotas"
                value={dashboardStats.totalPets}
                icon={<Pets />}
                gradient="from-blue-500 to-blue-600"
                trend={12}
              />
              <StatCard
                title="Reportes Activos"
                value={dashboardStats.activeReports}
                icon={<Report />}
                gradient="from-red-500 to-rose-600"
                trend={-5}
              />
              <StatCard
                title="Carnets Pendientes"
                value={dashboardStats.cardsPending}
                icon={<FilterList />}
                gradient="from-amber-500 to-orange-600"
              />
              <StatCard
                title="Total Usuarios"
                value={dashboardStats.totalUsers}
                icon={<People />}
                gradient="from-emerald-500 to-green-600"
                trend={8}
              />
            </div>

            {/* Reportes y Mascotas Recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reportes Recientes */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <Report className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Reportes Recientes</h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{strayReports.length} total</span>
                </div>
                <div className="space-y-3">
                  {strayReports.slice(0, 4).map((report, index) => {
                    const statusColors = {
                      active: 'bg-red-50 text-red-700 border-red-200',
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border border-slate-100"
                        onClick={() => setActiveTab('reports')}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Pets className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{report.breed || 'Perro Callejero'}</p>
                          <p className="text-xs text-slate-500 truncate flex items-center">
                            <LocationOn className="w-3 h-3 mr-1" />
                            {report.address || 'Sin ubicación'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${statusColors[report.status] || statusColors.active}`}>
                          {report.status === 'active' ? 'Activo' :
                           report.status === 'pending' ? 'Pendiente' :
                           report.status === 'in_progress' ? 'En Progreso' : 'Resuelto'}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
                {strayReports.length === 0 && (
                  <div className="text-center py-8">
                    <Report className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No hay reportes recientes</p>
                  </div>
                )}
              </motion.div>

              {/* Mascotas Registradas */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Pets className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Mascotas Registradas</h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{pets.length} total</span>
                </div>
                <div className="space-y-3">
                  {pets.slice(0, 4).map((pet, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border border-slate-100"
                      onClick={() => window.open(`/pet/${pet.cui}`, '_blank')}
                    >
                      <img
                        src={pet.photo_frontal_path ? getUploadUrl(pet.photo_frontal_path) : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50'}
                        alt={pet.pet_name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{pet.pet_name}</p>
                        <p className="text-xs text-slate-500 truncate">{pet.breed_name || pet.breed || 'Sin raza'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded">{pet.cui}</p>
                        <p className="text-xs text-slate-400 mt-1">{pet.owner_first_name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {pets.length === 0 && (
                  <div className="text-center py-8">
                    <Pets className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No hay mascotas registradas</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )

      case 'pets':
        return <PetManagement />

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-800">Reportes de Perros Callejeros</h2>

              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar reportes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="resolved">Resuelto</option>
                </select>

                <button
                  onClick={fetchData}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Refresh />
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <Report className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron reportes</p>
              </div>
            )}
          </div>
        )

      case 'users':
        return <UserManagement />

      case 'municipal':
        return <MunicipalUsersList />

      case 'analytics':
        return <Analytics />

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">⚙️ Configuración del Sistema</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Información del Sistema</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión:</span>
                    <span className="font-semibold">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base de Datos:</span>
                    <span className="font-semibold">MySQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-green-600">✓ Operativo</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones del Sistema</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Exportar Base de Datos
                  </button>
                  <button className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    Limpiar Caché
                  </button>
                  <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Administradores</h3>
              <p className="text-gray-600 mb-4">Usuario actual: admin</p>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        )

      default:
        return <div>Contenido no disponible</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            fontWeight: '500',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo + Título */}
            <div className="flex items-center space-x-4">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                src="/images/logos/Logo Escudo MPP 2023-vetical_UU.png"
                alt="Municipalidad Provincial de Puno"
                className="h-14 w-auto cursor-pointer"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
              />
              <div className="border-l-2 border-slate-300 pl-4">
                <h1 className="text-xl font-bold text-slate-900">Panel de Control</h1>
                <p className="text-xs text-slate-500 font-medium">Municipalidad Provincial de Puno</p>
              </div>
            </div>

            {/* Usuario + Salir */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{currentUser.role}</p>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.clear()
                  navigate('/login')
                }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg transition-all font-medium border border-slate-200 hover:border-red-300"
                title="Cerrar Sesión"
              >
                <Logout className="w-5 h-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            <TabButton
              id="dashboard"
              label="Dashboard"
              icon={<Dashboard />}
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <TabButton
              id="pets"
              label="Mascotas"
              icon={<Pets />}
              isActive={activeTab === 'pets'}
              onClick={() => setActiveTab('pets')}
            />
            <TabButton
              id="reports"
              label="Reportes"
              icon={<Report />}
              isActive={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
            <TabButton
              id="users"
              label="Usuarios"
              icon={<People />}
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <TabButton
              id="municipal"
              label="Personal Municipal"
              icon={<People />}
              isActive={activeTab === 'municipal'}
              onClick={() => setActiveTab('municipal')}
            />
            <TabButton
              id="analytics"
              label="Analíticas"
              icon={<BarChart />}
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              id="settings"
              label="Configuración"
              icon={<Settings />}
              isActive={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePrintMultiplePets}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-white"
        title="Imprimir Carnets"
      >
        <Print className="w-6 h-6" />
      </motion.button>
    </div>
  )
}

export default AdminDashboard
