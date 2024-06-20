import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, IconButton, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const RegisterRequerimiento = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    requerimientoModulo_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modulos, setModulos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/moduloRequerimiento`, {
          withCredentials: true,
        });
        setModulos(response.data.data || []);
      } catch (error) {
        console.error('Error fetching modulos:', error);
      }
    };

    fetchModulos();
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
      const response = await axios.post(`${config.API_URL}/proyecto/${id}/requerimiento`, formData, {
        withCredentials: true,
      });
      console.log('Requerimiento registrado:', response.data);
      setLoading(false);
      navigate(`/dashboard/project-management/${id}/requirement`);
    } catch (error) {
      console.error('Error registrando requerimiento:', error);
      setError('Error registrando requerimiento');
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <IconButton onClick={() => navigate(`/dashboard/project-management/${id}/requirement`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Registrar Requerimiento</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <FormControl variant="outlined" fullWidth margin="normal" required>
            <InputLabel>Módulo de Requerimiento</InputLabel>
            <Select
              name="requerimientoModulo_id"
              value={formData.requerimientoModulo_id}
              onChange={handleChange}
              label="Módulo de Requerimiento"
            >
              {modulos.map((modulo) => (
                <MenuItem key={modulo._id} value={modulo._id}>
                  {modulo.nombre}
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

export default RegisterRequerimiento;
