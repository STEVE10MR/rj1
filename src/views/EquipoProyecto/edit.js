import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, IconButton, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const EditEquipoProyecto = () => {
  const { id, equipoId } = useParams();
  const [formData, setFormData] = useState({
    user_id: '',
    rolEquipo_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/equipoProyecto/${equipoId}`, {
          withCredentials: true,
        });
        setFormData(response.data.data || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching equipo:', error);
        setError('Error fetching equipo');
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/rolequipo`, {
          params: { active: true },
          withCredentials: true,
        });
        setRoles(response.data.data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/usuario`, {
          params: { active: true, role: 'user' },
          withCredentials: true,
        });
        setUsuarios(response.data.data.filter(user => ['user'].includes(user.role)) || []);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      }
    };

    fetchEquipo();
    fetchRoles();
    fetchUsuarios();
  }, [id, equipoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/equipoProyecto/${equipoId}`, formData, {
        withCredentials: true,
      });
      navigate(`/dashboard/project-management/${id}/equipo`);
    } catch (error) {
      console.error('Error actualizando miembro:', error);
      setError('Error actualizando miembro');
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setError('');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <IconButton onClick={() => navigate(`/dashboard/project-management/${id}/equipo`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Editar Miembro</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          {error && <Alert severity="error" onClose={handleSnackbarClose}>{error}</Alert>}
          <FormControl variant="outlined" fullWidth margin="normal" required>
            <InputLabel>Usuario</InputLabel>
            <Select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              label="Usuario"
            >
              {usuarios.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" fullWidth margin="normal" required>
            <InputLabel>Rol</InputLabel>
            <Select
              name="rolEquipo_id"
              value={formData.rolEquipo_id}
              onChange={handleChange}
              label="Rol"
            >
              {roles.map(rol => (
                <MenuItem key={rol._id} value={rol._id}>
                  {rol.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Actualizar
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EditEquipoProyecto;
