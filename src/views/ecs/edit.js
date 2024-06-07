import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const EditECS = () => {
  const { id, idFase, idEcs } = useParams();
  const [ecsData, setEcsData] = useState({
    nombre: '',
    descripcion: '',
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
    const fetchEcs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs/${idEcs}`, {
          withCredentials: true,
        });
        
        const { nombre, descripcion, tipoEcs, tipoTecnologia, estado_id } = response.data.data;
        setEcsData({ nombre, descripcion, tipoEcs, tipoTecnologia, estado_id: estado_id._id });
        setLoading(false);
      } catch (error) {
        setSnackbarMessage('Error fetching ECS data');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

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

    fetchEcs();
    fetchOptions();
  }, [id, idFase, idEcs]);

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
      const response = await axios.patch(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs/${idEcs}`, ecsData, {
        withCredentials: true,
      });
      navigate(`/dashboard/methodology-management/${id}/phases/${idFase}`);
    } catch (error) {
      console.log("Message", error.message);
      setSnackbarMessage('Error updating ECS');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Editar ECS</Typography>
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

export default EditECS;
