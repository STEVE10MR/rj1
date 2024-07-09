import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
  Grid, Tooltip
} from '@mui/material';
import { Bar, Doughnut, Line, Pie, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import config from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale);

const ReportOptions = () => {
  const { projectId } = useParams();
  const [cronograma, setCronograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchCronograma = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${projectId}/cronograma`, {
          withCredentials: true,
        });
        setCronograma(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cronograma:', error);
        setLoading(false);
      }
    };

    fetchCronograma();
  }, [projectId]);

  const handleOpenModal = (option) => {
    setSelectedOption(option);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOption(null);
  };

  const generateChartData = (tasks, field) => {
    const labels = tasks.map(task => task.titulo);
    const data = tasks.map(task => task[field]);

    return {
      labels,
      datasets: [
        {
          label: field,
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const renderChart = (tasks, chartType) => {
    const data = generateChartData(tasks, 'progresoInicio');

    switch (chartType) {
      case 'bar':
        return <Bar data={data} />;
      case 'doughnut':
        return <Doughnut data={data} />;
      case 'line':
        return <Line data={data} />;
      case 'pie':
        return <Pie data={data} />;
      case 'radar':
        return <Radar data={data} />;
      case 'polarArea':
        return <PolarArea data={data} />;
      case 'scatter':
        return <Scatter data={data} />;
      case 'bubble':
        return <Bubble data={data} />;
      default:
        return null;
    }
  };

  const renderTasks = (tasks) => (
    <List>
      {tasks.map(task => (
        <ListItem key={task._id}>
          <Tooltip title={`Miembros: ${task.miembros.map(m => m.nombre).join(', ')}`}>
            <ListItemText 
              primary={task.titulo} 
              secondary={
                <>
                  <Typography variant="body2">Descripción: {task.descripcion}</Typography>
                  <Typography variant="body2">Progreso: {task.progresoInicio}%</Typography>
                </>
              } 
            />
          </Tooltip>
        </ListItem>
      ))}
    </List>
  );

  const renderSummary = (tasks) => (
    <Box>
      <Typography variant="h6">Resumen</Typography>
      <Typography variant="body1">Total de Tareas: {tasks.length}</Typography>
      <Typography variant="body1">Tareas Iniciadas: {tasks.filter(task => task.progresoInicio > 0).length}</Typography>
      <Typography variant="body1">Tareas En Progreso: {tasks.filter(task => task.progresoInicio > 0 && task.progresoInicio < 100).length}</Typography>
      <Typography variant="body1">Tareas Completadas: {tasks.filter(task => task.progresoInicio === 100).length}</Typography>
      <Typography variant="body1">Total de Miembros: {new Set(tasks.flatMap(task => task.miembros.map(miembro => miembro.nombre))).size}</Typography>
      <Typography variant="body1">Tareas por Fase:</Typography>
      {cronograma.cronogramaFase.map(fase => (
        <Typography key={fase.fase_id._id} variant="body2">
          {fase.fase_id.nombre}: {fase.cronogramaEcs.flatMap(ecs => ecs.tareas).length} tareas
        </Typography>
      ))}
    </Box>
  );

  const renderPhaseDetails = (fase) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Fase: {fase.fase_id.nombre}</Typography>
      <Typography variant="body2">Progreso: {fase.progresoInicio}% - {fase.progresoFin}%</Typography>
      <Typography variant="body2">Fecha de Inicio: {new Date(fase.fechaInicio).toLocaleDateString()}</Typography>
      <Typography variant="body2">Fecha de Fin: {new Date(fase.fechaFin).toLocaleDateString()}</Typography>
    </Box>
  );

  const renderEcsDetails = (ecs) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Elemento de Configuración: {ecs.ecs_id.nombre}</Typography>
      <Typography variant="body2">Progreso: {ecs.progresoInicio}% - {ecs.progresoFin}%</Typography>
      {ecs.miembros.map(miembro => (
        <Typography key={miembro._id} variant="body2">
          Miembro: {miembro.equipoProyecto_id.user_id.name} (Rol: {miembro.rol_id.nombre})
        </Typography>
      ))}
    </Box>
  );

  const tareas = cronograma.cronogramaFase.flatMap(fase =>
    fase.cronogramaEcs.flatMap(ecs =>
      ecs.tareas.map(tarea => ({
        ...tarea,
        fase: fase.fase_id.nombre,
        ecs: ecs.ecs_id.nombre,
        miembros: ecs.miembros.map(miembro => ({
          rol: miembro.rol_id.nombre,
          nombre: miembro.equipoProyecto_id.user_id.name
        }))
      }))
    )
  );

  const noIniciados = tareas.filter(tarea => tarea.progresoInicio === 0);
  const aceptados = tareas.filter(tarea => tarea.revisor && tarea.progresoInicio === 100);
  const enProceso = tareas.filter(tarea => tarea.revisor && tarea.progresoInicio < 100);
  const implementados = tareas.filter(tarea => tarea.aprobador && tarea.active);
  const rechazados = tareas.filter(tarea => tarea.aprobador && !tarea.active);

  const options = [
    { label: 'No Iniciados', tasks: noIniciados, chartType: 'bar' },
    { label: 'Aceptados', tasks: aceptados, chartType: 'doughnut' },
    { label: 'En Proceso', tasks: enProceso, chartType: 'line' },
    { label: 'Implementados', tasks: implementados, chartType: 'pie' },
    { label: 'Rechazados', tasks: rechazados, chartType: 'radar' },
    { label: 'Progreso General', tasks: tareas, chartType: 'polarArea' },
    { label: 'Histograma de Progreso', tasks: tareas, chartType: 'scatter' },
    { label: 'Distribución de Miembros', tasks: tareas, chartType: 'bubble' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Opciones de Informe</Typography>
      {options.map(option => (
        <Box key={option.label} sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleOpenModal(option)}>
            {option.label}
          </Button>
        </Box>
      ))}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedOption?.label}</DialogTitle>
        <DialogContent>
          {selectedOption && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {renderChart(selectedOption.tasks, selectedOption.chartType)}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderSummary(selectedOption.tasks)}
                </Grid>
              </Grid>
              {selectedOption.tasks.map(task => (
                <Paper key={task._id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6">{task.titulo}</Typography>
                  <Typography variant="body2">Descripción: {task.descripcion}</Typography>
                  <Typography variant="body2">Progreso: {task.progresoInicio}%</Typography>
                  {renderPhaseDetails(task.fase)}
                  {renderEcsDetails(task.ecs)}
                </Paper>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportOptions;
