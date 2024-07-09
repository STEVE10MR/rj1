import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import * as ManagerCookies from '../ManagerCookies';
import config from '../../config';
import { Container, Typography, CircularProgress, Box, useMediaQuery, useTheme, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, List, ListItem, ListItemText, TextField, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [files, setFiles] = useState([]);
  const [progresoInicio, setProgresoInicio] = useState(0);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [active, setActive] = useState(false);
  const [role, setRole] = useState('');

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
            color: ['#ff8a65', '#4db6ac', '#ba68c8', '#f06292', '#9575cd'][index % 5]
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
        const taskData = response.data.data;
        setSelectedTask(taskData);
        setProgresoInicio(taskData.progresoInicio);
        setFechaInicio(taskData.fechaInicio);
        setFechaFin(taskData.fechaFin);
        setActive(taskData.active);
        setFiles(taskData.archivos);
        setRole(taskData.rol);
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

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      formData.append('faseId', selectedTask.faseId);
      formData.append('ecsId', selectedTask.ecsId);
      formData.append('permissionId', selectedTask.permissions);
      formData.append('cronogramaId', selectedTask.cronogramaId);
      formData.append('equipoProyecto_id', selectedTask.equipoProyecto_id);

      if (role === 'Responsable') {
        files.forEach(file => {
          formData.append('archivos', file);
        });
      }

      if (role === 'Revisor') {
        formData.append('progresoInicio', progresoInicio);
      }

      if (role === 'Aprobador') {
        formData.append('active', active);
        formData.append('fechaInicio', fechaInicio);
        formData.append('fechaFin', fechaFin);
      }

      await axios.patch(`${config.API_URL}/tareas/${selectedTask._id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      handleCloseTaskModal();
    } catch (error) {
      console.error('Error saving task changes:', error);
      alert('Error saving task changes: ' + error.response.data.message);
    }
  };

  const handleDownloadFile = async (fileUrl) => {
    try {
      const response = await axios.patch(`${config.API_URL}/tareas/descargar`, { url: fileUrl }, {
        responseType: 'blob',
        withCredentials: true,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileUrl.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
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

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Archivos:</Typography>
              <List>
                {selectedTask.archivos.map((file) => (
                  <ListItem key={file._id}>
                    <ListItemText primary={file.nombre} />
                    <Button onClick={() => handleDownloadFile(file.url)}>Descargar</Button>
                  </ListItem>
                ))}
              </List>
            </Box>

            {selectedTask.active || role === 'Aprobador' ? (
              <Box sx={{ mt: 2 }}>
                {role === 'Responsable' && (
                  <Box>
                    <Typography variant="body2">Subir Archivos:</Typography>
                    <input type="file" multiple onChange={handleFileChange} />
                    <List>
                      {files.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={file.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {role === 'Revisor' && (
                  <Box>
                    <TextField
                      label="Progreso Inicio"
                      type="number"
                      fullWidth
                      value={progresoInicio}
                      onChange={(e) => setProgresoInicio(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                )}
                {role === 'Aprobador' && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Fecha de Inicio"
                        type="date"
                        fullWidth
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Fecha de Fin"
                        type="date"
                        fullWidth
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setActive(!active)}
                      >
                        {active ? 'Desactivar' : 'Activar'} Tarea
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="error">No tienes permisos para editar esta tarea.</Typography>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseTaskModal} color="primary">
            Cerrar
          </Button>
          {(selectedTask && (selectedTask.active || role === 'Aprobador')) && (
            <Button onClick={handleSaveChanges} color="primary">
              Guardar Cambios
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskCalendar;
