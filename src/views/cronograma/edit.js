import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const ProjectSchedule = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [cronogramaId, setCronogramaId] = useState('');
  const [metodologiaId, setMetodologiaId] = useState('');
  const [availablePhases, setAvailablePhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [phases, setPhases] = useState([]);
  const [availableEcs, setAvailableEcs] = useState([]);
  const [selectedEcs, setSelectedEcs] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
          withCredentials: true,
        });
        const cronograma = response.data.data;
        setMetodologiaId(cronograma.metodologia_id);
        setCronogramaId(cronograma._id);
        setPhases(cronograma.cronogramaFase || []);
        setLoading(false);
      } catch (error) {
        setSnackbarMessage('Error al obtener el cronograma');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  useEffect(() => {
    const fetchAvailablePhases = async () => {
      try {
        if (metodologiaId) {
          const response = await axios.get(`${config.API_URL}/metodologia/${metodologiaId}/fases`, {
            withCredentials: true,
          });
          setAvailablePhases(response.data.data || []);
        }
      } catch (error) {
        console.error('Error al obtener fases', error);
      }
    };

    const fetchAvailableEcs = async () => {
      try {
        if (metodologiaId) {
          const response = await axios.get(`${config.API_URL}/metodologia/${metodologiaId}/ecs`, {
            withCredentials: true,
          });
          setAvailableEcs(response.data.data || []);
        }
      } catch (error) {
        console.error('Error al obtener ECS', error);
      }
    };

    fetchAvailablePhases();
    fetchAvailableEcs();
  }, [metodologiaId]);

  const handlePhaseSelect = (e) => {
    setSelectedPhase(e.target.value);
  };

  const handleEcsSelect = (e) => {
    setSelectedEcs(e.target.value);
  };

  const handleAddPhase = async () => {
    if (!selectedPhase || !fechaInicio || !fechaFin) {
      setSnackbarMessage('Selecciona una fase y proporciona fechas de inicio y fin');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}`, {
        faseId: selectedPhase, fechaInicio, fechaFin
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Fase agregada');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al agregar fase');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRemovePhase = async (faseId) => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/quitar-fase`, {
        faseId
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Fase eliminada');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al eliminar fase');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleAddEcs = (faseId) => {
    setCurrentPhaseId(faseId);
    setDialogOpen(true);
  };

  const handleConfirmAddEcs = async () => {
    if (!selectedEcs) {
      setSnackbarMessage('Selecciona un ECS por favor');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/agregar-ecs`, {
        faseId: currentPhaseId,
        ecsId: selectedEcs
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('ECS agregado');
      setSnackbarOpen(true);
      setDialogOpen(false);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al agregar ECS');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRemoveEcs = async (faseId, ecsId) => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/quitar-ecs`, {
        faseId,
        ecsId
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('ECS eliminado');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al eliminar ECS');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestionar Cronograma</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Num</TableCell>
                  <TableCell>Fase</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Progreso Inicio</TableCell>
                  <TableCell>Progreso Fin</TableCell>
                  <TableCell>Opciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phases.length > 0 ? (
                  phases.map((phase, index) => (
                    <TableRow key={phase._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{phase.fase_id.nombre}</TableCell>
                      <TableCell>{phase.fechaInicio}</TableCell>
                      <TableCell>{phase.fechaFin}</TableCell>
                      <TableCell>{phase.progresoInicio || 0}%</TableCell>
                      <TableCell>{phase.progresoFin || 0}%</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleAddEcs(phase._id)}>Agregar ECS</Button>
                        <Button variant="contained" color="secondary" size="small" onClick={() => handleRemovePhase(phase._id)}>Eliminar Fase</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No se encontraron fases
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <FormControl sx={{ width: '300px' }}>
              <InputLabel>Fase</InputLabel>
              <Select
                value={selectedPhase}
                onChange={handlePhaseSelect}
                label="Fase"
              >
                {availablePhases.map((fase) => (
                  <MenuItem key={fase._id} value={fase._id}>
                    {fase.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" color="primary" onClick={handleAddPhase}>
              Agregar Fase
            </Button>
          </Box>
        </>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Agregar ECS</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecciona el ECS que deseas agregar a la fase.
          </DialogContentText>
          <FormControl sx={{ width: '100%' }}>
            <InputLabel>ECS</InputLabel>
            <Select
              value={selectedEcs}
              onChange={handleEcsSelect}
              label="ECS"
            >
              {availableEcs.map((ecs) => (
                <MenuItem key={ecs._id} value={ecs._id}>
                  {ecs.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAddEcs} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('Error') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectSchedule;
