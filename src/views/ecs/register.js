import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const RegisterECS = () => {
  const { id, idFase } = useParams();
  const [ecsData, setEcsData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    version: '',
    tipoEcs: '',
    tipoTecnologia: '',
    estado_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tipoEcsOptions, setTipoEcsOptions] = useState([]);
  const [tipoTecnologiaOptions, setTipoTecnologiaOptions] = useState([]);
  const [estadoOptions, setEstadoOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tipoEcsResponse, tipoTecnologiaResponse, estadoResponse] = await Promise.all([
          axios.get(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs/listar-tipos-ecs`, { withCredentials: true }),
          axios.get(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs/listar-tipos-tecnologia`, { withCredentials: true }),
          axios.get(`${config.API_URL}/estado`, { withCredentials: true })
        ]);

        setTipoEcsOptions(tipoEcsResponse.data.data || []);
        setTipoTecnologiaOptions(tipoTecnologiaResponse.data.data || []);
        setEstadoOptions(estadoResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, [id, idFase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEcsData({
      ...ecsData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs`, ecsData, {
        withCredentials: true,
      });
      navigate(`/dashboard/methodology-management/${id}/phases/${idFase}`);
    } catch (error) {
      setSnackbarMessage('Error registrando el ECS');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Registrar ECS</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          name="nombre"
          label="Nombre"
          value={ecsData.nombre}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="descripcion"
          label="Descripción"
          value={ecsData.descripcion}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="fechaInicio"
          label="Fecha de Inicio"
          type="date"
          value={ecsData.fechaInicio}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="fechaFin"
          label="Fecha de Fin"
          type="date"
          value={ecsData.fechaFin}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="version"
          label="Versión"
          value={ecsData.version}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de ECS</InputLabel>
          <Select
            name="tipoEcs"
            value={ecsData.tipoEcs}
            onChange={handleChange}
            label="Tipo de ECS"
          >
            {tipoEcsOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Tecnología</InputLabel>
          <Select
            name="tipoTecnologia"
            value={ecsData.tipoTecnologia}
            onChange={handleChange}
            label="Tipo de Tecnología"
          >
            {tipoTecnologiaOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Estado</InputLabel>
          <Select
            name="estado_id"
            value={ecsData.estado_id}
            onChange={handleChange}
            label="Estado"
          >
            {estadoOptions.map((estado) => (
              <MenuItem key={estado._id} value={estado._id}>
                {estado.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Registrar'}
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

export default RegisterECS;
