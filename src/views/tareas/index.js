import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import * as ManagerCookies from '../ManagerCookies';
import config from '../../config';
import { Container, Typography, CircularProgress, Box, useMediaQuery, useTheme, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Define colors for each phase
  const phaseColors = ['#ff8a65', '#4db6ac', '#ba68c8', '#f06292', '#9575cd'];

  useEffect(() => {
    const fetchPhasesAndTasks = async () => {
      try {
        const selectedProject = ManagerCookies.getCookie('selectedProject');
        const teamRole = ManagerCookies.getCookie('teamRole');

        const response = await axios.get(`${config.API_URL}/tareas`, {
          params: { selectedProject, teamRole },
          withCredentials: true
        });

        if (response.data.status === 'success') {
          const phasesWithColors = response.data.data.map((phase, index) => ({
            ...phase,
            color: phaseColors[index % phaseColors.length]
          }));
          setPhases(phasesWithColors);
        } else {
          console.error('Failed to fetch phases and tasks');
        }
      } catch (error) {
        console.error('Error fetching phases and tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhasesAndTasks();
  }, []);

  const handleTaskClick = async (taskId) => {
    try {
      const selectedProject = ManagerCookies.getCookie('selectedProject');
      const response = await axios.get(`${config.API_URL}/tareas/obtener`, {
        params: { selectedProject, tareaId: taskId },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        setSelectedTask(response.data.data);
        setTaskModalOpen(true);
      } else {
        console.error('Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleCloseTaskModal = () => {
    setTaskModalOpen(false);
    setSelectedTask(null);
  };

  const events = phases.flatMap((phase) =>
    phase.cronogramaEcs.tareas.map((task) => ({
      title: task.titulo,
      start: new Date(task.fechaInicio),
      end: new Date(task.fechaFin),
      allDay: true,
      resource: { ...task, phase: phase.faseDetalles.nombre, color: phase.color }
    }))
  );

  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource.color;
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4 }}>Calendario de Tareas</Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => handleTaskClick(event.resource._id)}
      />
      <Typography variant="h6" sx={{ mt: 4 }}>Lista de Tareas</Typography>
      {phases.map((phase) => (
        <Box key={phase.fase_id} sx={{ mb: 2 }}>
          <Typography variant="h6" style={{ color: phase.color }}>{phase.faseDetalles.nombre}</Typography>
          <List>
            {phase.cronogramaEcs.tareas.map((task) => (
              <ListItem key={task._id} button onClick={() => handleTaskClick(task._id)}>
                <ListItemText primary={task.titulo} secondary={`${new Date(task.fechaInicio).toLocaleDateString()} - ${new Date(task.fechaFin).toLocaleDateString()}`} />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
      <Dialog
        open={taskModalOpen}
        onClose={handleCloseTaskModal}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Tarea
          <IconButton
            aria-label="close"
            onClick={handleCloseTaskModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {selectedTask && (
          <DialogContent>
            <Typography variant="h6">{selectedTask.titulo}</Typography>
            <Typography variant="body1">{selectedTask.descripcion}</Typography>
            <Typography variant="body2">Fecha de Inicio: {new Date(selectedTask.fechaInicio).toLocaleDateString()}</Typography>
            <Typography variant="body2">Fecha de Fin: {new Date(selectedTask.fechaFin).toLocaleDateString()}</Typography>
            <Typography variant="body2">Progreso: {selectedTask.progresoInicio}% - {selectedTask.progresoFin}%</Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseTaskModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskCalendar;
