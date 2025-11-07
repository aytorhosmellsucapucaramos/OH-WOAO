import React from 'react'
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken')
  const userRole = localStorage.getItem('userRole')
  
  // Si no hay token, redirigir a login
  if (!authToken) {
    return <Navigate to="/login" replace />
  }

  // Si no es admin o super_admin, redirigir a dashboard de usuario
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Si es admin y tiene token, permitir acceso
  return children
}

export default AdminRoute
