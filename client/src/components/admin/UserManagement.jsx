import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, People, Delete, Visibility, Email, Phone, LocationOn,
  Pets as PetsIcon, Report, CalendarToday, FilterList
} from '@mui/icons-material'
import axios from 'axios'
import { getApiUrl } from '../../utils/urls'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      const response = await axios.get(getApiUrl('/admin/users'), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    // Solo mostrar usuarios regulares (SIN código de empleado municipal)
    const isRegularUser = !user.employee_code && (!user.role || user.role === 'user')
    
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.dni?.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return isRegularUser && matchesSearch
  })

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Se eliminarán también todas sus mascotas.')) return
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      await axios.delete(getApiUrl(`/admin/users/${userId}`), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar usuario')
    }
  }

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            {user.photo_path ? (
              <img
                src={getApiUrl(`/uploads/${user.photo_path}`)}
                alt={user.first_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-orange-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-orange-200">
                <span className="text-2xl font-bold text-white">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">DNI: {user.dni}</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold flex items-center">
                <PetsIcon className="w-3 h-3 mr-1" />
                {user.total_pets} mascotas
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold flex items-center">
                <Report className="w-3 h-3 mr-1" />
                {user.total_reports} reportes
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Email className="w-4 h-4 mr-2" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{user.phone}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <LocationOn className="w-4 h-4 mr-2" />
            <span>{user.address}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CalendarToday className="w-4 h-4 mr-2" />
            <span>Registrado: {new Date(user.created_at).toLocaleDateString('es-PE')}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedUser(user)
              setShowModal(true)
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Visibility className="w-4 h-4 mr-2" />
            Ver Detalles
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const UserModal = ({ user, onClose }) => (
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
              Detalles del Usuario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {user.photo_path ? (
                <img
                  src={getApiUrl(`/uploads/${user.photo_path}`)}
                  alt={user.first_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-orange-200">
                  <span className="text-3xl font-bold text-white">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
              )}
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-600">DNI: {user.dni}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                <p className="font-semibold text-gray-800">{user.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Dirección</p>
                <p className="font-semibold text-gray-800">{user.address}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Mascotas Registradas</p>
                <p className="font-semibold text-gray-800">{user.total_pets}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Reportes Realizados</p>
                <p className="font-semibold text-gray-800">{user.total_reports}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Fecha de Registro</p>
                <p className="font-semibold text-gray-800">
                  {new Date(user.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
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
            👥 Gestión de Usuarios
          </h2>
          <p className="text-gray-600">
            Total: {filteredUsers.length} usuarios registrados
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {currentUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <People className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
        </div>
      )}

      {/* Paginación */}
      {filteredUsers.length > 0 && (
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
              de {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
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
        {showModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false)
              setSelectedUser(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserManagement
