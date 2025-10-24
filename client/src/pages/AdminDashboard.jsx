import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  QrCode
} from '@mui/icons-material'
import PetManagement from '../components/admin/PetManagement'
import UserManagement from '../components/admin/UserManagement'
import Analytics from '../components/admin/Analytics'

const AdminDashboard = () => {
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

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pets
      const petsResponse = await fetch('http://localhost:5000/api/admin/pets')
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData.data || [])
      }

      // Fetch stray reports
      const reportsResponse = await fetch('http://localhost:5000/api/admin/stray-reports')
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
      const response = await fetch('http://localhost:5000/api/admin/stats')
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
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stray-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchData()
        fetchStats()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stray-reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
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
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
          : 'bg-white/10 text-gray-700 hover:bg-white/20'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </motion.button>
  )

  const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-500 mt-1">↗ +{trend}% este mes</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )

  const PetCard = ({ pet }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <img
          src={pet.photo_path ? `http://localhost:5000/api/uploads/${pet.photo_path}` : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100'}
          alt={pet.pet_name}
          className="w-16 h-16 rounded-full object-cover border-4 border-cyan-200"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{pet.pet_name}</h3>
          <p className="text-gray-600">{pet.breed} • {pet.age} años</p>
          <p className="text-sm text-gray-500">CUI: {pet.cui}</p>
        </div>
        <div className="flex space-x-2">
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
    const reporterName = `${report.reporter_first_name || ''} ${report.reporter_last_name || ''}`.trim() || 'Usuario anónimo'
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{report.breed || 'Perro Callejero'}</h3>
            <p className="text-gray-600">Reportado por: {reporterName}</p>
            <p className="text-sm text-gray-500">{report.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            report.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
            report.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
            report.status === 'resolved' ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {report.status === 'pending' ? 'Pendiente' : 
             report.status === 'in_progress' ? 'En Progreso' :
             report.status === 'resolved' ? 'Resuelto' : report.status}
          </span>
        </div>

        {report.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{report.description}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate(report.id, 'in_progress')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
          >
            En Progreso
          </button>
          <button
            onClick={() => handleStatusUpdate(report.id, 'resolved')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Resuelto
          </button>
          <button
            onClick={() => handleDeleteReport(report.id)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Mascotas"
                value={dashboardStats.totalPets}
                icon={<Pets className="w-6 h-6" />}
                color="text-blue-600"
              />
              <StatCard
                title="Reportes Activos"
                value={dashboardStats.activeReports}
                icon={<Report className="w-6 h-6" />}
                color="text-red-600"
              />
              <StatCard
                title="Carnets Pendientes"
                value={dashboardStats.cardsPending}
                icon={<FilterList className="w-6 h-6" />}
                color="text-yellow-600"
              />
              <StatCard
                title="Carnets Impresos"
                value={dashboardStats.cardsPrinted}
                icon={<CheckCircle className="w-6 h-6" />}
                color="text-green-600"
              />
              <StatCard
                title="Total Usuarios"
                value={dashboardStats.totalUsers}
                icon={<People className="w-6 h-6" />}
                color="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Reportes Recientes</h2>
                <div className="space-y-4">
                  {strayReports.slice(0, 3).map((report, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <Pets className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{report.breed || 'Perro Callejero'}</p>
                        <p className="text-sm text-gray-600">{report.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'pending' ? 'bg-red-100 text-red-600' :
                        report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {report.status === 'pending' ? 'Pendiente' : 
                         report.status === 'in_progress' ? 'En Progreso' :
                         'Resuelto'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mascotas Registradas</h2>
                <div className="space-y-4">
                  {pets.slice(0, 3).map((pet, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={pet.photo_path ? `http://localhost:5000/api/uploads/${pet.photo_path}` : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50'}
                        alt={pet.pet_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{pet.pet_name}</p>
                        <p className="text-sm text-gray-600">{pet.breed}</p>
                      </div>
                      <span className="text-xs text-gray-500">{pet.cui}</span>
                    </div>
                  ))}
                </div>
              </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report, index) => (
                <ReportCard key={index} report={report} />
              ))}
            </div>

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Pets className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WebPerritos Admin</h1>
                <p className="text-cyan-600 font-semibold">Municipalidad Provincial de Puno</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Administrador</p>
                <p className="font-semibold text-gray-900">Sistema</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4 overflow-x-auto">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrintMultiplePets}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        title="Imprimir Carnets"
      >
        <Print className="w-8 h-8" />
      </motion.button>
    </div>
  )
}

export default AdminDashboard
