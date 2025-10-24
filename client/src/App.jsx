import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import PetCardPage from './pages/PetCardPage'
import ReportStrayPage from './pages/ReportStrayPage'
import MapPageLeaflet from './pages/MapPageLeaflet'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 60%, #e2e8f0 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(147, 197, 253, 0.05) 0%, transparent 50%)',
          zIndex: 1
        },
        '& > *': {
          position: 'relative',
          zIndex: 2
        }
      }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/pet/:cui" element={<PetCardPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/report-stray" element={
            <ProtectedRoute>
              <ReportStrayPage />
            </ProtectedRoute>
          } />
          <Route path="/user/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={<MapPageLeaflet />} />
          
          {/* Rutas de Administración */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </Box>
    </Router>
  )
}

export default App
