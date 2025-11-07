import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Badge,
  Phone,
  Home,
  Shuffle,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateMunicipalUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role_id: 2, // Admin por defecto
    assigned_zone: ''
    // employee_code removido - se genera automáticamente
  });

  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Obtener roles (excluyendo 'user')
      const rolesResponse = await axios.get(
        'http://localhost:5000/api/admin/users/catalog/roles?exclude=user',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setRoles(rolesResponse.data.data || []);

      // Obtener zonas
      const zonesResponse = await axios.get(
        'http://localhost:5000/api/admin/users/catalog/zones',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setZones(zonesResponse.data.data || []);

    } catch (error) {
      console.error('Error loading catalogs:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los catálogos. Por favor recarga la página.' 
      });
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setMessage({ type: '', text: '' });
  };

  const generatePassword = () => {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
    setShowPassword(true);
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.dni || 
        !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Completa todos los campos requeridos' });
      return false;
    }

    if (formData.dni.length !== 8) {
      setMessage({ type: 'error', text: 'El DNI debe tener 8 dígitos' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    if (parseInt(formData.role_id) === 3 && !formData.assigned_zone) {
      setMessage({ type: 'error', text: 'Debes asignar una zona para el personal de seguimiento' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/admin/users/create',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const employeeCode = response.data.employee_code || 'Generado';
      
      setMessage({ 
        type: 'success', 
        text: `✅ Usuario creado exitosamente!\n📧 Email: ${formData.email}\n🔑 Contraseña: ${formData.password}\n🏷️ Código: ${employeeCode}` 
      });

      console.log('✅ Usuario creado:', response.data);

      // Redirigir al dashboard después de 4 segundos
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 4000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al crear usuario';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/dashboard')}
        sx={{ mb: 2 }}
      >
        Volver al Panel de Control
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAdd sx={{ fontSize: 40, color: '#428cef', mr: 2 }} />
            <div>
              <Typography variant="h5" fontWeight="600">
                Crear Usuario Municipal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrador o Personal de Seguimiento
              </Typography>
            </div>
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Datos Personales */}
            <Typography variant="h6" sx={{ mb: 2, color: '#428cef' }}>
              👤 Datos Personales
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.first_name}
                  onChange={handleChange('first_name')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.last_name}
                  onChange={handleChange('last_name')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DNI"
                  value={formData.dni}
                  onChange={handleChange('dni')}
                  inputProps={{ maxLength: 8, pattern: '[0-9]*' }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={formData.address}
                  onChange={handleChange('address')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Credenciales de Acceso */}
            <Typography variant="h6" sx={{ mb: 2, color: '#428cef' }}>
              📧 Credenciales de Acceso
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  helperText="Puede ser cualquier dominio (Gmail, Hotmail, etc.)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  helperText="Mínimo 6 caracteres. El usuario podrá cambiarla después."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <IconButton onClick={generatePassword} color="primary">
                          <Shuffle />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Rol y Asignación */}
            <Typography variant="h6" sx={{ mb: 2, color: '#428cef' }}>
              🔐 Rol y Asignación
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Rol"
                  value={formData.role_id}
                  onChange={handleChange('role_id')}
                  required
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {parseInt(formData.role_id) === 3 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Zona Asignada"
                    value={formData.assigned_zone}
                    onChange={handleChange('assigned_zone')}
                    required
                    helperText="Requerido para Personal de Seguimiento"
                  >
                    <MenuItem value="">
                      <em>Seleccionar zona...</em>
                    </MenuItem>
                    {zones.map(zone => (
                      <MenuItem key={zone.id} value={zone.name}>
                        {zone.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#428cef',
                  '&:hover': { backgroundColor: '#3a7ad1' }
                }}
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
              ⚠️ Importante:
            </Typography>
            <Typography variant="body2">
              • Verifica el DNI físicamente antes de crear la cuenta<br />
              • 🤖 El código de empleado se genera automáticamente (Ej: ADMIN-2024-001)<br />
              • Anota la contraseña generada y entrégasela al empleado<br />
              • El empleado podrá cambiar su contraseña después del primer login<br />
              • ⚡ Los cambios se reflejan automáticamente en tiempo real
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateMunicipalUser;
