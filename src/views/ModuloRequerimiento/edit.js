import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, IconButton, CircularProgress, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const EditModuloRequerimiento = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchModulo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.API_URL}/moduloRequerimiento/${id}`, {
          withCredentials: true,
        });

        setFormData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching modulo data:', error);
        setError('Error fetching modulo data');
        setLoading(false);
      }
    };
    fetchModulo();
  }, [id]);

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
      const response = await axios.patch(`${config.API_URL}/moduloRequerimiento/${id}`, formData, {
        withCredentials: true,
      });
      console.log('Módulo actualizado:', response.data);
      setLoading(false);
      navigate('/dashboard/module-requirement');
    } catch (error) {
      console.error('Error actualizando módulo:', error);
      setError('Error actualizando módulo');
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 2, maxWidth: 600, mx: 'auto', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/dashboard/module-requirement')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Editar Módulo</Typography>
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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EditModuloRequerimiento;
