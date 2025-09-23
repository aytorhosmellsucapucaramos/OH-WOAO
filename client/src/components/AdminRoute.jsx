import React from 'react'
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const adminSession = localStorage.getItem('adminSession')
  
  if (!adminSession) {
    return <Navigate to="/admin/login" replace />
  }

  try {
    const session = JSON.parse(adminSession)
    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60)

    // Sesión expira después de 8 horas
    if (hoursDiff > 8) {
      localStorage.removeItem('adminSession')
      return <Navigate to="/admin/login" replace />
    }

    return children
  } catch (error) {
    localStorage.removeItem('adminSession')
    return <Navigate to="/admin/login" replace />
  }
}

export default AdminRoute
