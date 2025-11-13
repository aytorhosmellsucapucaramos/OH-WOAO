import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Edit,
  Block,
  CheckCircle,
  Badge,
  Email,
  Phone,
  Work
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { getApiUrl } from '../../utils/urls';

const MunicipalUsersList = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [editDialog, setEditDialog] = useState({
    open: false,
    user: null,
    role_id: ''
  });

  const [roles, setRoles] = useState([]);
  
  // WebSocket: Notificaciones en tiempo real
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    
    // Conectar WebSocket - Usar variable de entorno o ruta relativa
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      console.log('🔌 Conectado a WebSocket');
      socket.emit('join-admin'); // Unirse al room de admin
    });
    
    // Escuchar evento de usuario creado
    socket.on('user-created', (newUser) => {
      console.log('⚡ Nuevo usuario creado:', newUser);
      setSnackbar({ 
        open: true, 
        message: `✅ Nuevo usuario creado: ${newUser.first_name} ${newUser.last_name} (${newUser.employee_code})` 
      });
      // Recargar lista
      fetchUsers();
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Desconectado de WebSocket');
    });
    
    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/admin/users'),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const usersData = response.data.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/admin/users/catalog/roles'),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const filterUsers = () => {
    // Primero filtrar solo usuarios municipales
    const municipalUsers = users.filter(user => {
      // Usuarios municipales tienen role_code diferente a 'user' o tienen employee_code
      const isMunicipal = 
        user.role_code === 'admin' || 
        user.role_code === 'seguimiento' ||
        user.role_code === 'super_admin' ||
        user.employee_code ||
        user.role_id > 1; // Cualquier role_id mayor a 1 (no user)
      return isMunicipal;
    });
    
    if (!searchTerm) {
      setFilteredUsers(municipalUsers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = municipalUsers.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        user.dni?.includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.employee_code?.toLowerCase().includes(term)
      );
    });
    setFilteredUsers(filtered);
  };

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleToggleActive = async (userId, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de ${action} este usuario?`)) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const endpoint = currentStatus
        ? `http://localhost:5000/api/admin/users/${userId}`
        : `http://localhost:5000/api/admin/users/${userId}/activate`;
      
      const method = currentStatus ? 'delete' : 'put';
      
      await axios[method](endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage({ 
        type: 'success', 
        text: `Usuario ${action}do exitosamente` 
      });
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || `Error al ${action} usuario` 
      });
    }
  };

  const openEditDialog = (user) => {
    setEditDialog({
      open: true,
      user,
      role_id: user.role_id
    });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, user: null, role_id: '' });
  };

  const handleChangeRole = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/admin/users/${editDialog.user.id}/role`,
        { role_id: editDialog.role_id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Rol actualizado exitosamente' });
      closeEditDialog();
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al cambiar rol' 
      });
    }
  };

  const getRoleChip = (roleCode) => {
    const config = {
      'user': { label: 'Usuario', color: 'default' },
      'admin': { label: 'Admin', color: 'error' },
      'seguimiento': { label: 'Seguimiento', color: 'primary' },
      'super_admin': { label: 'Super Admin', color: 'secondary' }
    };

    const roleConfig = config[roleCode] || { label: roleCode, color: 'default' };

    return (
      <Chip 
        label={roleConfig.label}
        color={roleConfig.color}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="600">
            Gestión de Usuarios Municipales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} usuario(s) encontrado(s)
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/admin/users/create')}
          sx={{
            backgroundColor: '#428cef',
            '&:hover': { backgroundColor: '#3a7ad1' }
          }}
        >
          Crear Usuario
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, DNI, email o código de empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>DNI</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Zona</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">
                        No se encontraron usuarios
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                            {user.phone || 'Sin teléfono'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.dni}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<Work />}
                          label={user.employee_code || 'N/A'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{getRoleChip(user.role_code)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.assigned_zone || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Chip icon={<CheckCircle />} label="Activo" color="success" size="small" />
                        ) : (
                          <Chip icon={<Block />} label="Inactivo" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Cambiar rol">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.is_active ? 'Desactivar' : 'Reactivar'}>
                          <IconButton
                            size="small"
                            color={user.is_active ? 'error' : 'success'}
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                          >
                            {user.is_active ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Paginación */}
      {filteredUsers.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'white', borderRadius: 2, border: 1, borderColor: 'grey.200' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
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
              </TextField>
              <Typography variant="body2" color="text.secondary">
                de {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                sx={{ minWidth: 'auto', px: 1 }}
                title="Primera página"
              >
                ««
              </Button>
              <Button
                size="small"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                sx={{ minWidth: 'auto', px: 1 }}
                title="Anterior"
              >
                «
              </Button>

              <Typography variant="body2" sx={{ px: 2, py: 1, fontWeight: 'medium' }}>
                Página {currentPage} de {totalPages}
              </Typography>

              <Button
                size="small"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                sx={{ minWidth: 'auto', px: 1 }}
                title="Siguiente"
              >
                »
              </Button>
              <Button
                size="small"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                sx={{ minWidth: 'auto', px: 1 }}
                title="Última página"
              >
                »»
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialog para cambiar rol */}
      <Dialog open={editDialog.open} onClose={closeEditDialog}>
        <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Usuario: <strong>{editDialog.user?.first_name} {editDialog.user?.last_name}</strong>
            </Typography>
            <TextField
              fullWidth
              select
              label="Nuevo Rol"
              value={editDialog.role_id}
              onChange={(e) => setEditDialog(prev => ({ ...prev, role_id: e.target.value }))}
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button 
            onClick={handleChangeRole} 
            variant="contained"
            disabled={!editDialog.role_id}
          >
            Cambiar Rol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones en tiempo real */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default MunicipalUsersList;
