import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const PetCard = ({ petData }) => {
  if (!petData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl"
      >
        <Typography variant="h6" color="text.secondary">
          No se encontraron datos de la mascota
        </Typography>
      </Box>
    )
  }

  const {
    cui, pet_name, pet_last_name, species, breed, adoption_date,
    adopter_name, adopter_last_name, dni, phone, department, province, district, address,
    photo_path, qr_code_path
  } = petData

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Carnet Principal - Diseño Oficial */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300">
          {/* Header con escudo oficial */}
          <div className="relative bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Escudo de Puno */}
                <div className="w-16 h-20 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white text-xs font-bold">🏛️</span>
                    </div>
                    <div className="text-xs text-gray-700 font-bold">MUNICIPALIDAD</div>
                    <div className="text-xs text-gray-600">DE PUNO</div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide">REGISTRO MUNICIPAL DE MASCOTAS</h1>
                  <p className="text-lg opacity-90 font-medium">(RMM)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo con fondo degradado verde claro */}
          <div className="relative bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-6">
            {/* Patitas decorativas sutiles */}
            <div className="absolute inset-0 opacity-8">
              <div className="absolute top-10 left-20 text-4xl transform rotate-12 text-white">🐾</div>
              <div className="absolute top-32 right-32 text-3xl transform -rotate-12 text-white">🐾</div>
              <div className="absolute bottom-20 left-32 text-3xl transform rotate-45 text-white">🐾</div>
              <div className="absolute bottom-10 right-20 text-2xl transform -rotate-45 text-white">🐾</div>
            </div>

            <div className="relative grid grid-cols-5 gap-6">
              {/* Información de la Mascota */}
              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Nombre</p>
                    <p className="text-2xl font-bold text-black">{pet_name?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Apellido</p>
                    <p className="text-2xl font-bold text-black">{pet_last_name?.toUpperCase() || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Especie</p>
                    <p className="text-xl font-bold text-black">{species?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Raza</p>
                    <p className="text-xl font-bold text-black">{breed?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Fecha de Adopción</p>
                    <p className="text-lg font-bold text-black">{formatDate(adoption_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Fecha de Emisión</p>
                    <p className="text-lg font-bold text-black">{formatDate(new Date())}</p>
                  </div>
                </div>

                {/* Sellos oficiales */}
                <div className="flex justify-between items-center mt-8">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-teal-500 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-bold text-teal-600">GMAS</div>
                      <div className="text-xs text-gray-600">SALUD</div>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-green-500 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl">🌱</div>
                      <div className="text-xs font-bold text-green-600">ECO</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto y CUI */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="text-right mb-2 w-full">
                  <p className="text-sm font-bold text-blue-600">CUI</p>
                  <p className="text-2xl font-bold text-black">{cui}</p>
                </div>
                <div className="w-48 h-56 bg-white border-2 border-gray-400 rounded-lg overflow-hidden shadow-lg">
                  {photo_path ? (
                    <img
                      src={`http://localhost:5000/api/uploads/${photo_path}`}
                      alt={pet_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-6xl">🐕</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carnet del Adoptante - Diseño Oficial */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-20 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white text-xs font-bold">🏛️</span>
                    </div>
                    <div className="text-xs text-gray-700 font-bold">MUNICIPALIDAD</div>
                    <div className="text-xs text-gray-600">DE PUNO</div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide">REGISTRO MUNICIPAL DE MASCOTAS</h1>
                  <p className="text-lg opacity-90 font-medium">(RMM)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">CUI</p>
                <p className="text-2xl font-bold">{cui}</p>
              </div>
            </div>
          </div>

          {/* Cuerpo con fondo degradado */}
          <div className="relative bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-6">
            {/* Patitas decorativas */}
            <div className="absolute inset-0 opacity-8">
              <div className="absolute top-8 right-20 text-4xl transform rotate-12 text-white">🐾</div>
              <div className="absolute bottom-16 left-24 text-3xl transform -rotate-12 text-white">🐾</div>
              <div className="absolute top-1/2 right-1/3 text-2xl transform rotate-45 text-white">🐾</div>
            </div>

            {/* Sección Propietario */}
            <div className="relative mb-6">
              <h2 className="text-3xl font-bold text-blue-600 mb-6">Propietario</h2>
            </div>

            <div className="relative grid grid-cols-4 gap-6">
              {/* Datos del Propietario */}
              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Nombres</p>
                    <p className="text-2xl font-bold text-black">{adopter_name?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Apellidos</p>
                    <p className="text-2xl font-bold text-black">{adopter_last_name?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">DNI</p>
                    <p className="text-xl font-bold text-black">{dni}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">CELULAR</p>
                    <p className="text-xl font-bold text-black">{phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-600 mb-1">Departamento/provincia/distrito</p>
                  <p className="text-lg font-bold text-black">{department?.toUpperCase()} / {province?.toUpperCase()} / {district?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-600 mb-1">Dirección</p>
                  <p className="text-lg font-bold text-black">{address?.toUpperCase()}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-32 bg-white border-2 border-gray-400 rounded-lg p-2 shadow-lg">
                  {qr_code_path ? (
                    <img
                      src={`http://localhost:5000/api/uploads/${qr_code_path}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl">📱</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Pequeña Mejorada */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl shadow-xl p-6 max-w-sm mx-auto border-2 border-teal-400">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <div className="text-center">
                  <div className="text-xs font-bold text-red-600">PUNO</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">MI REGISTRO MUNICIPAL</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white text-gray-800 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-1">CUI</p>
                <p className="text-lg font-bold">{cui}</p>
              </div>
              {qr_code_path ? (
                <img
                  src={`http://localhost:5000/api/uploads/${qr_code_path}`}
                  alt="QR Code"
                  className="w-16 h-16 border border-gray-300 rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center border border-gray-300 rounded">
                  <span className="text-2xl">📱</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="text-center mt-8">
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
          >
            🖨️ Imprimir Carnet
          </button>
        </div>
      </div>
    </div>
  )
}

export default PetCard
