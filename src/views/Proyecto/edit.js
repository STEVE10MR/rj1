import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const EditProject = () => {
  const { id } = useParams();
  const [projectData, setProjectData] = useState({
    nombre: '',
    descripcion: '',
    metodologia_id: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [metodologiaOptions, setMetodologiaOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}`, {
          withCredentials: true,
        });
        setProjectData(response.data.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    const fetchOptions = async () => {
      try {
        const metodologiaResponse = await axios.get(`${config.API_URL}/metodologia`, {
          params: { active: true },
          withCredentials: true,
        });
        setMetodologiaOptions(metodologiaResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchProject();
    fetchOptions();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}`, projectData, {
        withCredentials: true,
      });
      navigate(`/dashboard/project-management/${id}/cronograma`);
    } catch (error) {
      setSnackbarMessage('Error actualizando el proyecto');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Editar Proyecto</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          name="nombre"
          label="Nombre"
          value={projectData.nombre}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="descripcion"
          label="Descripción"
          value={projectData.descripcion}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="fechaInicio"
          label="Fecha de Inicio"
          type="date"
          value={projectData.fechaInicio}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="fechaFin"
          label="Fecha de Fin"
          type="date"
          value={projectData.fechaFin}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Metodología</InputLabel>
          <Select
            name="metodologia_id"
            value={projectData.metodologia_id}
            onChange={handleChange}
            label="Metodología"
          >
            {metodologiaOptions.map((metodologia) => (
              <MenuItem key={metodologia._id} value={metodologia._id}>
                {metodologia.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Actualizar'}
          </Button>
        </Box>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProject;
