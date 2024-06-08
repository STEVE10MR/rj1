import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

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
        setSnackbarMessage('Error fetching schedule');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

    const fetchAvailablePhases = async () => {
      try {
        if (metodologiaId) {
          const response = await axios.get(`${config.API_URL}/metodologia/${metodologiaId}/fases`, {
            withCredentials: true,
          });
          setAvailablePhases(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching available phases:', error);
      }
    };

    fetchSchedule();
    fetchAvailablePhases();
  }, [id, metodologiaId]);

  const handlePhaseSelect = (e) => {
    setSelectedPhase(e.target.value);
  };

  const handleAddPhase = async () => {
    if (!selectedPhase) {
      setSnackbarMessage('Please select a phase to add');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}`, {
        faseId: selectedPhase
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Phase added successfully');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error adding phase');
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
                  <TableCell>Progreso Inicio</TableCell>
                  <TableCell>Progreso Fin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phases.length > 0 ? (
                  phases.map((phase, index) => (
                    <TableRow key={phase._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{phase.fase_id.nombre}</TableCell>
                      <TableCell>{phase.progresoInicio || 0}%</TableCell>
                      <TableCell>{phase.progresoFin || 0}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
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
            <Button variant="contained" color="primary" onClick={handleAddPhase}>
              Agregar Fase
            </Button>
          </Box>
        </>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectSchedule;
