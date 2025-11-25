import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Pets, People, BarChart, PieChart,
  Assessment, Refresh
} from '@mui/icons-material'
import axios from 'axios'
import { getApiUrl } from '../../utils/urls'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, statsRes] = await Promise.all([
        axios.get(getApiUrl('/admin/analytics')),
        axios.get(getApiUrl('/admin/stats'))
      ])
      
      setAnalytics(analyticsRes.data.analytics)
      setStats(statsRes.data.stats)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon, color, bgColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColor}`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold ${color}`}>{subtitle}</span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </motion.div>
  )

  const ChartBar = ({ label, value, maxValue, color }) => {
    const percentage = (value / maxValue) * 100
    
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`${color} h-3 rounded-full`}
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!analytics || !stats) {
    return (
      <div className="text-center py-12">
        <Assessment className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay datos de analíticas disponibles</p>
      </div>
    )
  }

  const maxBreedCount = Math.max(...analytics.breedDistribution.map(b => b.count), 1)
  const maxColorCount = Math.max(...analytics.colorDistribution.map(c => c.count), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📊 Analíticas del Sistema
          </h2>
          <p className="text-gray-600">Estadísticas y métricas del sistema</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Refresh className="w-5 h-5" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Mascotas"
          value={stats.totalPets}
          subtitle="Registradas"
          icon={<Pets className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          subtitle="Activos"
          icon={<People className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Carnets Impresos"
          value={stats.cardsPrinted}
          subtitle={`${((stats.cardsPrinted / stats.totalPets) * 100 || 0).toFixed(0)}%`}
          icon={<BarChart className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Con Vacunas"
          value={stats.vaccinatedPets}
          subtitle="Antirrábica"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Monthly Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center mb-6">
          <BarChart className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">
            Registros Mensuales (Últimos 6 Meses)
          </h3>
        </div>
        
        {analytics.monthlyRegistrations.length > 0 ? (
          <div className="space-y-4">
            {analytics.monthlyRegistrations.map((month, index) => (
              <ChartBar
                key={index}
                label={month.month}
                value={month.count}
                maxValue={Math.max(...analytics.monthlyRegistrations.map(m => m.count))}
                color="bg-gradient-to-r from-blue-500 to-purple-500"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de registros mensuales</p>
        )}
      </motion.div>

      {/* Breed Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center mb-6">
            <Pets className="w-6 h-6 text-orange-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">
              Razas Más Comunes
            </h3>
          </div>
          
          {analytics.breedDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.breedDistribution.map((breed, index) => (
                <ChartBar
                  key={index}
                  label={breed.breed}
                  value={breed.count}
                  maxValue={maxBreedCount}
                  color="bg-gradient-to-r from-orange-500 to-pink-500"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos de razas</p>
          )}
        </motion.div>

        {/* Color Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center mb-6">
            <PieChart className="w-6 h-6 text-teal-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">
              Colores Más Comunes
            </h3>
          </div>
          
          {analytics.colorDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.colorDistribution.map((color, index) => (
                <ChartBar
                  key={index}
                  label={color.color}
                  value={color.count}
                  maxValue={maxColorCount}
                  color="bg-gradient-to-r from-teal-500 to-blue-500"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos de colores</p>
          )}
        </motion.div>
      </div>

      {/* Age Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center mb-6">
          <Assessment className="w-6 h-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">
            Distribución por Edad
          </h3>
        </div>
        
        {analytics.ageDistribution.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.ageDistribution.map((age, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <p className="text-4xl font-bold text-purple-600 mb-2">{age.count}</p>
                <p className="text-sm font-medium text-gray-700">{age.age_group}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de distribución por edad</p>
        )}
      </motion.div>

      {/* Report Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center mb-6">
          <BarChart className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">
            Estado de Reportes de Callejeros
          </h3>
        </div>
        
        {analytics.reportStatusDistribution.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.reportStatusDistribution.map((status, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-xl ${
                  status.status === 'pending' ? 'bg-yellow-50' :
                  status.status === 'in_progress' ? 'bg-blue-50' :
                  'bg-green-50'
                }`}
              >
                <p className={`text-5xl font-bold mb-2 ${
                  status.status === 'pending' ? 'text-yellow-600' :
                  status.status === 'in_progress' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {status.count}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {status.status === 'pending' ? 'Pendientes' :
                   status.status === 'in_progress' ? 'En Progreso' :
                   'Resueltos'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de reportes</p>
        )}
      </motion.div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <h4 className="text-lg font-semibold mb-2">📅 Este Mes</h4>
          <p className="text-3xl font-bold mb-1">{stats.newPetsThisMonth}</p>
          <p className="text-blue-100">Nuevas mascotas registradas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <h4 className="text-lg font-semibold mb-2">👥 Este Mes</h4>
          <p className="text-3xl font-bold mb-1">{stats.newUsersThisMonth}</p>
          <p className="text-green-100">Nuevos usuarios registrados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <h4 className="text-lg font-semibold mb-2">⏳ Pendientes</h4>
          <p className="text-3xl font-bold mb-1">{stats.cardsPending}</p>
          <p className="text-orange-100">Carnets por imprimir</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
