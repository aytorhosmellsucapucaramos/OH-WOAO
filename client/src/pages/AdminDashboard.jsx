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
  Refresh
} from '@mui/icons-material'
import PetManagement from '../components/admin/PetManagement'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pets, setPets] = useState([])
  const [strayReports, setStrayReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Datos simulados para el dashboard
  const dashboardStats = {
    totalPets: 156,
    totalReports: 42,
    pendingReports: 8,
    adoptedPets: 89,
    activeUsers: 234
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pets
      const petsResponse = await fetch('/api/pets')
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData.data || [])
      }

      // Fetch stray reports
      const reportsResponse = await fetch('/api/stray-reports')
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

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const response = await fetch(`/api/stray-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredReports = strayReports.filter(report => {
    const matchesSearch = report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.breed?.toLowerCase().includes(searchTerm.toLowerCase())
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
          ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg' 
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
          src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100'}
          alt={pet.name}
          className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
          <p className="text-gray-600">{pet.breed} • {pet.age}</p>
          <p className="text-sm text-gray-500">CUI: {pet.cui}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Visibility />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
            <Edit />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const ReportCard = ({ report }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{report.breed || 'Perro Callejero'}</h3>
          <p className="text-gray-600">Reportado por: {report.reporterName}</p>
          <p className="text-sm text-gray-500">{report.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          report.status === 'active' ? 'bg-red-100 text-red-600' :
          report.status === 'rescued' ? 'bg-green-100 text-green-600' :
          report.status === 'adopted' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Tamaño</p>
          <p className="font-semibold">{report.size}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Urgencia</p>
          <p className={`font-semibold ${
            report.urgency === 'high' ? 'text-red-600' :
            report.urgency === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {report.urgency}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleStatusUpdate(report.id, 'rescued')}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Rescatado
        </button>
        <button
          onClick={() => handleStatusUpdate(report.id, 'adopted')}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Pets className="w-4 h-4 mr-2" />
          Adoptado
        </button>
      </div>
    </motion.div>
  )

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
                trend="12"
              />
              <StatCard
                title="Reportes Activos"
                value={dashboardStats.totalReports}
                icon={<Report className="w-6 h-6" />}
                color="text-red-600"
                trend="8"
              />
              <StatCard
                title="Pendientes"
                value={dashboardStats.pendingReports}
                icon={<FilterList className="w-6 h-6" />}
                color="text-yellow-600"
              />
              <StatCard
                title="Adoptados"
                value={dashboardStats.adoptedPets}
                icon={<CheckCircle className="w-6 h-6" />}
                color="text-green-600"
                trend="15"
              />
              <StatCard
                title="Usuarios Activos"
                value={dashboardStats.activeUsers}
                icon={<People className="w-6 h-6" />}
                color="text-purple-600"
                trend="5"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Reportes Recientes</h2>
                <div className="space-y-4">
                  {strayReports.slice(0, 3).map((report, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Pets className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{report.breed || 'Perro Callejero'}</p>
                        <p className="text-sm text-gray-600">{report.address}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.urgency === 'high' ? 'bg-red-100 text-red-600' :
                        report.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {report.urgency}
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
                        src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50'}
                        alt={pet.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{pet.name}</p>
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
                  <option value="active">Activo</option>
                  <option value="rescued">Rescatado</option>
                  <option value="adopted">Adoptado</option>
                  <option value="closed">Cerrado</option>
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
          </div>
        )

      default:
        return <div>Contenido no disponible</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                <Pets className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WebPerritos Admin</h1>
                <p className="text-gray-600">Panel de Administración</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Administrador</p>
                <p className="font-semibold text-gray-900">Sistema</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <Add className="w-8 h-8" />
      </motion.button>
    </div>
  )
}

export default AdminDashboard
