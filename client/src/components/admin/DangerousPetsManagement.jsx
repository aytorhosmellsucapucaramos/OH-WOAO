import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  MenuItem,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Search,
  Pets,
  Warning,
  Visibility,
  Receipt,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl } from '../../utils/urls';

const DangerousPetsManagement = () => {
  const [dangerousPets, setDangerousPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDangerousPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [searchTerm, dangerousPets]);

  const fetchDangerousPets = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(getApiUrl('/admin/pets/dangerous'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setDangerousPets(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dangerous pets:', error);
      setLoading(false);
    }
  };

  const handleMarkVoucherViewed = async (petId) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      await axios.put(
        getApiUrl(`/admin/pets/dangerous/${petId}/voucher-viewed`),
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Actualizar el estado local
      setDangerousPets(prev => prev.map(pet => 
        pet.id === petId ? { ...pet, voucher_viewed: true } : pet
      ));
    } catch (error) {
      console.error('Error marking voucher as viewed:', error);
    }
  };

  const filterPets = () => {
    if (!searchTerm) {
      setFilteredPets(dangerousPets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = dangerousPets.filter(pet =>
      pet.pet_name?.toLowerCase().includes(term) ||
      pet.breed?.toLowerCase().includes(term) ||
      pet.owner_first_name?.toLowerCase().includes(term) ||
      pet.owner_last_name?.toLowerCase().includes(term) ||
      pet.owner_dni?.includes(term) ||
      pet.cui?.toLowerCase().includes(term)
    );

    setFilteredPets(filtered);
    setCurrentPage(1);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Mascotas Potencialmente Peligrosas
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, propietario, raza, CUI o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Results */}
      {filteredPets.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No se encontraron mascotas con ese criterio de búsqueda' : 'No hay mascotas potencialmente peligrosas registradas'}
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Mascota</strong></TableCell>
                    <TableCell><strong>Propietario</strong></TableCell>
                    <TableCell><strong>Raza</strong></TableCell>
                    <TableCell><strong>Pago</strong></TableCell>
                    <TableCell><strong>Voucher</strong></TableCell>
                    <TableCell><strong>CUI</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPets.map((pet) => (
                    <TableRow key={pet.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: '#ff5722',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <Warning />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {pet.pet_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pet.age} {pet.age === 1 ? 'mes' : 'meses'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {pet.owner_first_name} {pet.owner_last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DNI: {pet.owner_dni}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pet.breed}
                          color="warning"
                          size="small"
                          icon={<Pets />}
                        />
                      </TableCell>
                      <TableCell>
                        {pet.receipt_number ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              S/ {pet.receipt_amount || '52.20'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Recibo: {pet.receipt_number}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Sin pago registrado" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        {pet.voucher_photo_path ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Ver voucher">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  window.open(`http://localhost:5000/uploads/${pet.voucher_photo_path}`, '_blank');
                                  if (!pet.voucher_viewed) {
                                    handleMarkVoucherViewed(pet.id);
                                  }
                                }}
                              >
                                <Receipt />
                              </IconButton>
                            </Tooltip>
                            {pet.voucher_viewed ? (
                              <Chip 
                                icon={<CheckCircle />} 
                                label="Visto" 
                                size="small" 
                                color="success" 
                              />
                            ) : (
                              <Chip 
                                label="Pendiente" 
                                size="small" 
                                color="warning" 
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin voucher
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {pet.cui}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver carnet">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(`/pet/${pet.cui}`, '_blank')}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredPets.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrar:
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    sx={{ minWidth: 70 }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </TextField>
                  <Typography variant="body2" color="text.secondary">
                    de {filteredPets.length} mascota{filteredPets.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </IconButton>
                  <Typography variant="body2" sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                    Página {currentPage} de {totalPages}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </IconButton>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DangerousPetsManagement;
