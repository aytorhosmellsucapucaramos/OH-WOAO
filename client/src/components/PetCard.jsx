import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { getUploadUrl } from "../utils/urls";

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
    );
  }

  const {
    cui,
    pet_name,
    sex,
    breed_name,
    age,
    color_name,
    size_name,
    additional_features,
    has_vaccination_card,
    has_rabies_vaccine,
    medical_history,
    owner_first_name,
    owner_last_name,
    owner_dni,
    owner_phone,
    owner_address,
    owner_email,
    photo_frontal_path,
    photo_posterior_path,
    qr_code_path,
    created_at,
  } = petData;

  // Formatear edad de meses a texto legible
  const formatAge = (months) => {
    if (!months) return "N/A";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} ${months === 1 ? "mes" : "meses"}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? "año" : "años"}`;
    } else {
      return `${years} ${years === 1 ? "año" : "años"} y ${remainingMonths} ${
        remainingMonths === 1 ? "mes" : "meses"
      }`;
    }
  };

  // Formatear sexo
  const formatSex = (sexValue) => {
    if (sexValue === "male") return "MACHO ♂️";
    if (sexValue === "female") return "HEMBRA ♀️";
    return "N/A";
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-PE");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-5 py-4 md:py-8 px-2 md:px-4 rounded-3xl">
      {/* Indicador de scroll en móviles */}
      <div className="block md:hidden text-center mb-4 animate-bounce">
        <Typography variant="body2" sx={{ color: 'rgb(0, 167, 229)', fontWeight: 600 }}>
          ⬅️ Desliza para ver el carnet completo ➡️
        </Typography>
      </div>
      
      {/* Contenedor con scroll horizontal en móviles */}
      <div className="max-w-5xl mx-auto space-y-8 overflow-x-auto pb-4">
        <style>{`
          /* Ocultar scrollbar en móviles pero mantener funcionalidad */
          @media (max-width: 768px) {
            .max-w-5xl {
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 167, 229, 0.3) transparent;
            }
            .max-w-5xl::-webkit-scrollbar {
              height: 8px;
            }
            .max-w-5xl::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
            .max-w-5xl::-webkit-scrollbar-thumb {
              background: rgba(0, 167, 229, 0.5);
              border-radius: 10px;
            }
          }

          /* ESTILOS PARA IMPRESIÓN */
          @media print {
            /* Ocultar elementos no necesarios en impresión */
            .animate-bounce,
            .no-print {
              display: none !important;
            }

            /* Configuración de página */
            @page {
              size: A4 portrait;
              margin: 0.5cm;
            }

            /* Body y contenedor principal */
            body {
              background: white !important;
              margin: 0;
              padding: 0;
            }

            /* Forzar impresión de fondos de color */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* Contenedor principal */
            .min-h-screen {
              min-height: auto !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            /* Contenedor de carnets */
            .max-w-5xl {
              max-width: 100% !important;
              overflow: visible !important;
              padding: 0 !important;
              margin: 0 auto !important;
            }

            /* Cada carnet */
            .max-w-4xl {
              max-width: 100% !important;
              min-width: 0 !important;
              margin: 0 auto 0.5cm !important;
              page-break-inside: avoid;
              transform: scale(0.85);
              transform-origin: top center;
            }

            /* Tarjetas llavero */
            .max-w-6xl {
              max-width: 100% !important;
              display: flex !important;
              flex-wrap: wrap !important;
              justify-content: center !important;
              gap: 0.5cm !important;
              page-break-before: always;
              page-break-inside: avoid;
            }

            /* Tarjetas individuales llavero */
            .max-w-6xl > div {
              width: 45% !important;
              max-width: 45% !important;
              page-break-inside: avoid;
            }

            /* Ajustar sombras para impresión */
            .shadow-2xl,
            .shadow-lg {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
            }

            /* Mantener bordes redondeados pero más sutiles */
            .rounded-3xl {
              border-radius: 12px !important;
            }

            .rounded-xl {
              border-radius: 8px !important;
            }

            /* Asegurar que los gradientes se impriman */
            .bg-gradient-to-r,
            .bg-gradient-to-br,
            .bg-gradient-to-l {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Imágenes */
            img {
              max-width: 100%;
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact !important;
            }

            /* SVG gradientes */
            svg {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Ajustar padding para impresión */
            .p-6, .p-4 {
              padding: 0.8cm !important;
            }
          }
        `}</style>
        {/* Carnet Principal - Diseño Oficial */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 max-w-4xl mx-auto min-w-[800px] md:min-w-0">
          {/* Header con escudo oficial */}
          <div className="relative bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Escudo de Puno */}
                <div className="flex-shrink-0">
                  <img
                    src="/images/logos/Logo Escudo MPP 2023-Horizontal_UU.png"
                    alt="Escudo Municipalidad Provincial de Puno"
                    className="w-26 h-20 object-contain"
                  />
                </div>
                <div className="ml-8">
                  <h1 className="text-2xl font-bold tracking-wide">
                    REGISTRO MUNICIPAL DE MASCOTAS (RMM)
                  </h1>
                </div>
                {/* Sellos oficiales */}
                <div className="flex justify-between items-center">
                  <div className="flex-shrink-2">
                    <img
                      src="/images/logos/GMASS.png"
                      alt="GMAS"
                      className="w-40 h-20 object-contain"
                    />
                  </div>
                  <div className="flex-shrink-2">
                    <img
                      src="/images/logos/gestionambiental.png"
                      alt="GMAS"
                      className="w-40 h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Línea decorativa ondulada */}
            <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 12"
              >
                <path
                  d="M0,6 L250,6 L250,2 L750,2 L750,6 L1000,6 L1000,12 L0,12 Z"
                  fill="url(#gradient1)"
                />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
                    />
                    <stop
                      offset="25%"
                      style={{ stopColor: "#0ea5e9", stopOpacity: 1 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: "#06b6d4", stopOpacity: 1 }}
                    />
                    <stop
                      offset="75%"
                      style={{ stopColor: "#0891b2", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#0e7490", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Cuerpo con fondo degradado azul claro */}
          <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 p-6">
            {/* Marca de agua - Logo Puno Renace */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <img
                src="/images/logos/Logo Puno Renace_UU.png"
                alt="Marca de agua"
                className="w-96 h-96 object-contain"
                style={{ transform: "rotate(-15deg)" }}
              />
            </div>

            <div className="relative grid grid-cols-5 gap-6">
              {/* Información de la Mascota */}
              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Nombre del Can
                    </p>
                    <p className="text-2xl font-bold text-black">
                      {pet_name?.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">Sexo</p>
                    <p className="text-2xl font-bold text-black">
                      {formatSex(sex)}
                    </p>
                  </div>
                  <div className="text-gray-700">
                    <p className="text-sm font-bold text-blue-600 mb-1">Raza</p>
                    <p className="text-2xl font-bold uppercase text-black">
                      {breed_name || "N/A"}
                    </p>
                  </div>
                  <div className="text-gray-700">
                    <p className="text-sm font-bold text-blue-600 mb-1">Edad</p>
                    <p className="text-2xl font-bold uppercase text-black">
                      {formatAge(age)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Fecha de Emisión
                    </p>
                    <p className="text-2xl font-bold text-black">
                      {formatDate(created_at || new Date())}
                    </p>
                  </div>
                </div>
              </div>

              {/* Foto y CUI */}
              <div className="col-span-2 flex flex-col items-start">
                <div className="text-start mb-3 w-full">
                  <p className="text-sm font-bold text-blue-600">CUI</p>
                  <p className="text-xl font-bold text-black">{cui}</p>
                </div>
                <div className="w-64 h-48 bg-white border-2 border-gray-400 rounded-lg overflow-hidden shadow-lg">
                  {photo_frontal_path ? (
                    <img
                      src={getUploadUrl(photo_frontal_path)}
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
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 max-w-4xl mx-auto min-w-[800px] md:min-w-0">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Escudo de Puno */}
                <div className="flex-shrink-0">
                  <img
                    src="/images/logos/Logo Escudo MPP 2023-Horizontal_UU.png"
                    alt="Escudo Municipalidad Provincial de Puno"
                    className="w-26 h-20 object-contain"
                  />
                </div>
                <div className="ml-8">
                  <h1 className="text-2xl font-bold tracking-wide">
                    REGISTRO MUNICIPAL DE MASCOTAS (RMM)
                  </h1>
                </div>
                {/* Sellos oficiales */}
                <div className="flex justify-between items-center">
                  <div className="flex-shrink-2">
                    <img
                      src="/images/logos/GMASS.png"
                      alt="GMAS"
                      className="w-40 h-20 object-contain"
                    />
                  </div>
                  <div className="flex-shrink-2">
                    <img
                      src="/images/logos/gestionambiental.png"
                      alt="GMAS"
                      className="w-40 h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Línea decorativa ondulada */}
            <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 12"
              >
                <path
                  d="M0,6 L250,6 L250,2 L750,2 L750,6 L1000,6 L1000,12 L0,12 Z"
                  fill="url(#gradient2)"
                />
                <defs>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
                    />
                    <stop
                      offset="25%"
                      style={{ stopColor: "#0ea5e9", stopOpacity: 1 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: "#06b6d4", stopOpacity: 1 }}
                    />
                    <stop
                      offset="75%"
                      style={{ stopColor: "#0891b2", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#0e7490", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Cuerpo con fondo degradado */}
          <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 p-6">
            {/* Marca de agua - Logo Puno Renace */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <img
                src="/images/logos/Logo Puno Renace_UU.png"
                alt="Marca de agua"
                className="w-96 h-96 object-contain"
                style={{ transform: "rotate(-15deg)" }}
              />
            </div>
            {/* Patitas decorativas */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-32 text-4xl transform -rotate-12 text-blue-300">
                🐾
              </div>
              <div className="absolute bottom-16 right-40 text-3xl transform rotate-45 text-sky-300">
                🐾
              </div>
              <div className="absolute top-1/2 right-1/4 text-2xl transform -rotate-45 text-cyan-300">
                🐾
              </div>
            </div>

            {/* Sección Propietario */}
            <div className="relative mb-6">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">
                PROPIETARIO
              </h2>
              <div className="absolute bottom-0 left-0 w-80 h-1 bg-gradient-to-r from-blue-400 to-cyan-600"></div>
            </div>

            <div className="relative grid grid-cols-5 gap-6">
              {/* Datos del Adoptante - Columna Izquierda */}
              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Nombres
                    </p>
                    <p className="text-xl font-bold text-black">
                      {owner_first_name?.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Apellidos
                    </p>
                    <p className="text-xl font-bold text-black">
                      {owner_last_name?.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">DNI</p>
                    <p className="text-xl font-bold text-black">{owner_dni}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      CELULAR
                    </p>
                    <p className="text-xl font-bold text-black">
                      {owner_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Dirección
                    </p>
                    <p className="text-lg font-bold text-black">
                      {owner_address?.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600 mb-1">
                      Departamento/provincial/distrito
                    </p>
                    <p className="text-lg font-bold text-black">
                      PUNO / PUNO / PUNO
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code y CUI */}
              <div className="col-span-2 flex flex-col items-start">
                <div className="text-start mb-3">
                  <p className="text-sm font-bold text-blue-600">CUI</p>
                  <p className="text-xl font-bold text-black">{cui}</p>
                </div>
                <div className="w-64 h-48 bg-white border-2 border-gray-400 rounded-lg p-2 shadow-lg">
                  {qr_code_path ? (
                    <img
                      src={getUploadUrl(qr_code_path)}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="grid grid-cols-8 gap-1 w-full h-full p-2">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 ${
                              Math.random() > 0.5 ? "bg-black" : "bg-white"
                            } rounded-sm`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas Llavero lado a lado */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 mb-8 max-w-6xl mx-auto">
          {/* Tarjeta tipo Llavero/Tag para mascota frontal */}
          <div className="w-full max-w-[384px] md:w-96">
            <div className="h-[400px] bg-white shadow-2xl overflow-hidden rounded-3xl border-2 border-gray-300">
              {/* Contenido principal */}
              <div className="relative bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-600 text-white p-6 h-full flex flex-col items-center justify-center">
                {/* Marca de agua - Logo Puno Renace */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <img
                    src="/images/logos/Logo Puno Renace_UU.png"
                    alt="Marca de agua"
                    className="w-48 h-48 object-contain"
                    style={{ transform: "rotate(-15deg)" }}
                  />
                </div>
                <div className="relative flex items-center justify-center">
                  {/* QR Code */}
                  <div className="w-64 h-64 bg-white p-2 flex items-center justify-center rounded-lg shadow-lg">
                    {qr_code_path ? (
                      <img
                        src={getUploadUrl(qr_code_path)}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">
                        <svg viewBox="0 0 29 29" className="w-full h-full">
                          <rect width="50" height="50" fill="white" />
                          <path
                            d="M1,1h7v7h-7zM2,2v5h5v-5zM3,3h3v3h-3zM9,1h1v1h-1zM11,1h2v1h1v1h-1v1h-1v-1h-1v1h-1v-2h1zM14,2h1v1h-1zM16,1h1v2h-1zM18,1h1v1h-1zM21,1h7v7h-7zM22,2v5h5v-5zM23,3h3v3h-3zM10,4h1v1h-1zM12,4h1v1h1v1h-2zM15,4h3v1h-2v1h-1zM19,4h1v2h-1zM9,6h1v2h-1v1h-1v-2h1zM14,6h1v1h-1zM17,6h2v1h-1v1h-1zM11,7h2v1h-2zM15,7h1v1h-1zM1,9h1v2h1v-1h2v1h-1v1h-1v1h1v2h-2v-2h-1zM5,9h1v1h-1zM7,9h2v2h-2zM10,9h1v1h-1v1h1v1h-1v1h1v1h-2v-1h1v-2h-1v-1h1zM12,9h1v1h-1zM14,9h4v1h-4zM19,9h1v3h-1zM11,10h1v1h-1zM6,11h1v1h-1zM12,11h2v1h-1v1h-1zM15,11h3v1h-3zM20,11h1v1h-1zM5,12h1v1h-1zM9,13h1v1h1v-1h3v1h-1v1h-1v-1h-2v1h-1zM15,13h1v1h1v1h-2zM18,13h1v2h-1zM20,13h1v1h-1zM4,14h2v1h-2zM7,14h2v1h-2zM17,15h1v1h2v1h-2v1h-1v1h-1v-3h1zM20,15h1v1h-1zM1,16h2v1h-2zM4,16h1v1h-1zM6,16h3v1h1v1h-4zM13,16h3v1h-3zM1,17h1v1h-1zM10,17h2v2h-2zM21,17h1v2h1v-1h1v1h1v1h-1v1h1v1h-1v-1h-2v-1h1v-2h-1zM25,17h2v1h-2zM13,18h3v1h-3zM2,19h5v1h-5zM8,19h1v1h-1zM16,19h1v1h-1zM18,19h2v1h-2zM1,20h1v1h-1zM13,20h2v1h-2zM1,21h7v7h-7zM2,22v5h5v-5zM3,23h3v3h-3zM9,21h2v1h1v1h-1v1h2v1h-4v-1h1v-2h-1zM13,21h3v1h-3zM17,21h1v2h-1zM20,21h1v1h-1zM25,21h2v1h1v1h-3zM12,22h1v2h-1zM16,22h1v1h-1zM24,22h1v1h-1zM26,23h2v2h-2zM9,24h2v1h-2zM13,24h4v1h1v1h-1v2h-1v-3h-3zM20,24h1v1h-1zM23,24h1v1h-1zM9,25h2v1h-2zM12,25h1v1h-1zM24,25h2v1h-2zM19,26h1v2h-1zM21,26h2v1h-2zM25,26h3v2h-3zM20,27h1v1h-1zM23,27h1v1h-1z"
                            fill="black"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta tipo Llavero/Tag para mascota trasera */}
          <div className="w-full max-w-[384px] md:w-96">
            <div className="h-[400px] bg-white shadow-2xl overflow-hidden rounded-3xl border-2 border-gray-300">
              {/* Contenido principal */}
              <div className="relative bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-600 text-white p-6 h-full flex flex-col items-center justify-center">
                {/* Marca de agua - Logo Puno Renace */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <img
                    src="/images/logos/Logo Puno Renace_UU.png"
                    alt="Marca de agua"
                    className="w-48 h-48 object-contain"
                    style={{ transform: "rotate(-15deg)" }}
                  />
                </div>
                <div className="relative flex items-center justify-center mb-6">
                  {/* Escudo */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-40 h-40 flex items-center justify-center ">
                      <img
                        src="/images/logos/Logo Escudo MPP 2023-vetical_UU.png"
                        alt="Logo Municipalidad"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative text-center mt-6">
                  <p className="text-2xl font-bold mb-2">¿ME HE PERDIDO?</p>
                  <p className="text-lg font-bold mb-3">Avisa a mi familia</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-2">
                    <p className="text-sm font-semibold">📞 {owner_phone}</p>
                    <p className="text-xs font-bold mt-1">
                      {owner_first_name} {owner_last_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
