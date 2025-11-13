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
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Divider
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Person,
  Search,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  Schedule,
  Close,
  AssignmentInd,
  Map
} from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl } from '../../utils/urls';
import {
  getStrayReports,
  assignReport,
  unassignReport,
  getAssignedReports,
  updateReportStatus
} from '../../services/strayReportService';

const StrayReportsManagement = () => {
  const [tabValue, setTabValue] = useState(0); // 0: Todos los reportes, 1: Mis asignados
  const [reports, setReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Assign dialog
  const [assignDialog, setAssignDialog] = useState({
    open: false,
    report: null,
    assignedTo: ''
  });

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    report: null,
    status: '',
    notes: ''
  });

  // Municipal users for assignment
  const [municipalUsers, setMunicipalUsers] = useState([]);

  // User info
  const [currentUser, setCurrentUser] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchReports();
    fetchAssignedReports();
    fetchMunicipalUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, reports, tabValue]);

  const fetchReports = async () => {
    try {
      console.log('🔍 [StrayReportsManagement] Iniciando fetchReports...');
      const response = await getStrayReports();
      console.log('📊 [StrayReportsManagement] Respuesta de getStrayReports:', response);
      console.log('📊 [StrayReportsManagement] Reportes obtenidos:', response.data?.length || 0);
      console.log('📊 [StrayReportsManagement] Primer reporte (si existe):', response.data?.[0]);
      setReports(response.data || []);
    } catch (error) {
      console.error('❌ [StrayReportsManagement] Error fetching reports:', error);
      setMessage({ type: 'error', text: 'Error al cargar reportes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      const response = await getAssignedReports();
      setAssignedReports(response.data || []);
    } catch (error) {
      // Si no es personal de seguimiento, esto fallará - es normal
      console.log('No se pudieron cargar reportes asignados (posiblemente no eres personal de seguimiento)');
    }
  };

  const fetchMunicipalUsers = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/admin/users'),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const usersData = response.data.data || [];

      // Filtrar solo usuarios de seguimiento
      const seguimientoUsers = usersData.filter(user =>
        user.role_code === 'seguimiento' && user.is_active
      );
      setMunicipalUsers(seguimientoUsers);
    } catch (error) {
      console.error('Error fetching municipal users:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/profile'),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const filterReports = () => {
    const currentReports = tabValue === 0 ? reports : assignedReports;

    if (!searchTerm) {
      setFilteredReports(currentReports);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = currentReports.filter(report => {
      const reporterName = `${report.reporter_name || ''}`.toLowerCase();
      const address = `${report.address || ''}`.toLowerCase();
      const description = `${report.description || ''}`.toLowerCase();

      return (
        reporterName.includes(term) ||
        address.includes(term) ||
        description.includes(term) ||
        report.zone?.toLowerCase().includes(term)
      );
    });
    setFilteredReports(filtered);
  };

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, tabValue]);

  const handleAssign = async () => {
    try {
      await assignReport(assignDialog.report.id, assignDialog.assignedTo);

      // Marcar automáticamente como "a" después de asignar
      await updateReportStatus(assignDialog.report.id, 'a', 'Caso asignado automáticamente');

      setMessage({ type: 'success', text: 'Reporte asignado exitosamente' });
      setAssignDialog({ open: false, report: null, assignedTo: '' });
      fetchReports();
      fetchAssignedReports();

      setSnackbar({
        open: true,
        message: '✅ Reporte asignado y marcado como "Asignado"'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al asignar reporte'
      });
    }
  };

  const handleUnassign = async (reportId) => {
    if (!window.confirm('¿Estás seguro de desasignar este reporte?')) return;

    try {
      await unassignReport(reportId);

      setMessage({ type: 'success', text: 'Reporte desasignado exitosamente' });
      fetchReports();
      fetchAssignedReports();

      setSnackbar({
        open: true,
        message: '✅ Reporte desasignado exitosamente'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al desasignar reporte'
      });
    }
  };

  const handleUpdateStatus = async () => {
    // Validar que si se cambia a "d", sea obligatorio agregar notas
    if (statusDialog.status === 'd' && !statusDialog.notes.trim()) {
      setMessage({
        type: 'error',
        text: 'Es obligatorio agregar notas cuando se marca como "Completado"'
      });
      return;
    }

    try {
      await updateReportStatus(statusDialog.report.id, statusDialog.status, statusDialog.notes);

      setMessage({ type: 'success', text: 'Estado actualizado exitosamente' });
      setStatusDialog({ open: false, report: null, status: '', notes: '' });
      fetchReports();
      fetchAssignedReports();

      setSnackbar({
        open: true,
        message: `✅ Estado actualizado a ${getStatusChip(statusDialog.status).props.label}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar estado'
      });
    }
  };

  const getStatusChip = (status) => {
    const config = {
      'n': { label: 'Nuevo', color: 'error' },
      'a': { label: 'Asignado', color: 'warning' },
      'p': { label: 'En Progreso', color: 'primary' },
      'd': { label: 'Completado', color: 'success' },
      'r': { label: 'En Revisión', color: 'secondary' },
      'c': { label: 'Cerrado', color: 'default' }
    };

    const statusConfig = config[status] || { label: status, color: 'default' };

    return (
      <Chip
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
      />
    );
  };

  const getUrgencyChip = (urgency) => {
    const config = {
      'low': { label: 'Baja', color: 'success' },
      'normal': { label: 'Normal', color: 'warning' },
      'high': { label: 'Alta', color: 'error' },
      'emergency': { label: 'Emergencia', color: 'error' }
    };

    const urgencyConfig = config[urgency] || { label: urgency, color: 'default' };

    return (
      <Chip
        label={urgencyConfig.label}
        color={urgencyConfig.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const openAssignDialog = (report) => {
    setAssignDialog({
      open: true,
      report,
      assignedTo: ''
    });
  };

  const closeAssignDialog = () => {
    setAssignDialog({ open: false, report: null, assignedTo: '' });
  };

  const openStatusDialog = (report) => {
    // Para reportes asignados, si están en "a", cambiar automáticamente a "p"
    const defaultStatus = report.assigned_to && report.status === 'a' ? 'p' : report.status;

    setStatusDialog({
      open: true,
      report,
      status: defaultStatus,
      notes: ''
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({ open: false, report: null, status: '', notes: '' });
  };

  const canAssign = currentUser && ['admin', 'super_admin'].includes(currentUser.role_code);
  const canUpdateStatus = currentUser && currentUser.role_code === 'seguimiento';

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando reportes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="600">
            Gestión de Reportes de Perros Callejeros
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''} encontrado{filteredReports.length !== 1 ? 's' : ''}
          </Typography>
        </div>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Todos los Reportes" />
        <Tab label={`Mis Asignados (${assignedReports.length})`} />
      </Tabs>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por reportante, dirección, zona o descripción..."
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
                  <TableCell><strong>Reportante</strong></TableCell>
                  <TableCell><strong>Ubicación</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Urgencia</strong></TableCell>
                  <TableCell><strong>Asignado a</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        {tabValue === 0 ? 'No se encontraron reportes' : 'No tienes reportes asignados'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {report.reporter_name || 'Anónimo'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                            {report.reporter_phone || 'Sin teléfono'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                            {report.address || 'Sin dirección'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Zona: {report.zone || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(report.status)}</TableCell>
                      <TableCell>{getUrgencyChip(report.urgency)}</TableCell>
                      <TableCell>
                        {report.assigned_first_name ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              <Person sx={{ fontSize: 14 }} />
                            </Avatar>
                            <Typography variant="body2">
                              {report.assigned_first_name} {report.assigned_last_name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No asignado
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(report.created_at).toLocaleDateString()}
                        </Typography>
                        {report.assigned_at && (
                          <Typography variant="caption" color="text.secondary">
                            Asignado: {new Date(report.assigned_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {canAssign && !report.assigned_to && (
                          <Tooltip title="Asignar reporte">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openAssignDialog(report)}
                            >
                              <AssignmentInd />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canAssign && report.assigned_to && (
                          <Tooltip title="Desasignar reporte">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleUnassign(report.id)}
                            >
                              <AssignmentTurnedIn />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canUpdateStatus && (
                          <Tooltip title="Actualizar estado">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openStatusDialog(report)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredReports.length > 0 && (
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
                de {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''}
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

      {/* Assign Dialog */}
      <Dialog open={assignDialog.open} onClose={closeAssignDialog}>
        <DialogTitle>Asignar Reporte</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reporte de: <strong>{assignDialog.report?.reporter_name || 'Anónimo'}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ubicación: <strong>{assignDialog.report?.address || 'Sin dirección'}</strong>
            </Typography>
            <TextField
              fullWidth
              select
              label="Asignar a Personal de Seguimiento"
              value={assignDialog.assignedTo}
              onChange={(e) => setAssignDialog(prev => ({ ...prev, assignedTo: e.target.value }))}
            >
              {municipalUsers.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.employee_code})
                  {user.assigned_zone && ` - ${user.assigned_zone}`}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog}>Cancelar</Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            disabled={!assignDialog.assignedTo}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={closeStatusDialog}>
        <DialogTitle>Actualizar Estado del Reporte</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reporte de: <strong>{statusDialog.report?.reporter_name || 'Anónimo'}</strong>
            </Typography>
            <TextField
              fullWidth
              select
              label="Nuevo Estado"
              value={statusDialog.status}
              onChange={(e) => setStatusDialog(prev => ({ ...prev, status: e.target.value }))}
              sx={{ mb: 2 }}
            >
              <MenuItem value="in_progress">En Progreso</MenuItem>
              <MenuItem value="under_review">En Revisión</MenuItem>
              <MenuItem value="resolved">Resuelto</MenuItem>
              <MenuItem value="closed">Cerrado</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={`Notas ${statusDialog.status === 'under_review' ? '(obligatorio)' : '(opcional)'}`}
              value={statusDialog.notes}
              onChange={(e) => setStatusDialog(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={statusDialog.status === 'under_review' ?
                "Describa los detalles del caso que requiere revisión por parte del administrador..." :
                "Agregue notas sobre el progreso del caso..."}
              required={statusDialog.status === 'under_review'}
              error={statusDialog.status === 'under_review' && !statusDialog.notes.trim()}
              helperText={statusDialog.status === 'under_review' && !statusDialog.notes.trim() ?
                "Las notas son obligatorias cuando se marca como 'En Revisión'" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancelar</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={!statusDialog.status}
          >
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default StrayReportsManagement;
