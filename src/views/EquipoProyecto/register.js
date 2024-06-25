import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, IconButton, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const RegisterEquipoProyecto = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    user_id: '',
    rolEquipo_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
        setUsuarios(response.data.data.filter(user => ['user', 'jefe proyecto'].includes(user.role)) || []);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      }
    };

    fetchRoles();
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${config.API_URL}/proyecto/${id}/equipoProyecto`, formData, {
        withCredentials: true,
      });
      console.log('Miembro registrado:', response.data);
      setLoading(false);
      navigate(`/dashboard/project-management/${id}/equipo`);
    } catch (error) {
      console.error('Error registrando miembro:', error);
      setError('Error registrando miembro');
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <IconButton onClick={() => navigate(`/dashboard/project-management/${id}/equipo`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Registrar Miembro</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          {error && <Alert severity="error">{error}</Alert>}
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
            Registrar
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default RegisterEquipoProyecto;
