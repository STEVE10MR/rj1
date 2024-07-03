import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const ProjectSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [requirements, setRequirements] = useState([]);
  const [availableRequirements, setAvailableRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [selectedPhaseForReq, setSelectedPhaseForReq] = useState('');
  const [selectedEcsForReq, setSelectedEcsForReq] = useState('');
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [newMember, setNewMember] = useState('');
  const [selectedPhaseForMember, setSelectedPhaseForMember] = useState('');
  const [selectedEcsForMember, setSelectedEcsForMember] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', startDate: '', endDate: '', memberId: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
          withCredentials: true,
        });
        const cronograma = response.data.data;
        setMetodologiaId(cronograma.metodologia_id._id);
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

    fetchAvailablePhases();
  }, [metodologiaId]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/rol`, {
          withCredentials: true,
        });
        setRoles(response.data.data || []);
      } catch (error) {
        console.error('Error al obtener roles', error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchAvailableRequirements = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/requerimiento`, {
          withCredentials: true,
        });
        setAvailableRequirements(response.data.data || []);
      } catch (error) {
        console.error('Error al obtener requerimientos', error);
      }
    };

    fetchAvailableRequirements();
  }, [id]);

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/equipoProyecto`, {
          withCredentials: true,
        });
        setAvailableMembers(response.data.data || []);
      } catch (error) {
        console.error('Error al obtener miembros del proyecto', error);
      }
    };

    fetchAvailableMembers();
  }, [id]);

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

  const handleAddEcs = async (faseId) => {
    setCurrentPhaseId(faseId);
    setDialogOpen(true);
    try {
      const response = await axios.get(`${config.API_URL}/metodologia/${metodologiaId}/fases/${faseId}/ecs`, {
        withCredentials: true,
      });
      setAvailableEcs(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener ECS', error);
    }
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

  const handleShowRequirements = (faseId, ecsId) => {
    setSelectedPhaseForReq(faseId);
    setSelectedEcsForReq(ecsId);
    const phase = phases.find(phase => phase.fase_id._id === faseId);
    if (phase) {
      const ecs = phase.cronogramaEcs.find(ecs => ecs.ecs_id._id === ecsId);
      if (ecs) {
        setRequirements(ecs.requerimientos || []);
      }
    }
  };

  const handleShowMembers = (faseId, ecsId) => {
    setSelectedPhaseForMember(faseId);
    setSelectedEcsForMember(ecsId);
    const phase = phases.find(phase => phase.fase_id._id === faseId);
    if (phase) {
      const ecs = phase.cronogramaEcs.find(ecs => ecs.ecs_id._id === ecsId);
      if (ecs) {
        setMembers(ecs.miembros || []);
      }
    }
  };

  const handleShowTasks = (faseId, ecsId) => {
    const phase = phases.find(phase => phase.fase_id._id === faseId);
    if (phase) {
      const ecs = phase.cronogramaEcs.find(ecs => ecs.ecs_id._id === ecsId);
      if (ecs) {
        setTasks(ecs.tareas || []);
      }
    }
  };

  const handleAddRequirement = async () => {
    if (!newRequirement) {
      setSnackbarMessage('Selecciona un requerimiento por favor');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/agregar-requerimiento-ecs`, {
        faseId: selectedPhaseForReq,
        ecsId: selectedEcsForReq,
        requerimientoId: newRequirement
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Requerimiento agregado');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al agregar requerimiento');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRemoveRequirement = async (requirementId) => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/quitar-requerimiento`, {
        faseId: selectedPhaseForReq,
        ecsId: selectedEcsForReq,
        requerimientoId: requirementId
      }, {
        withCredentials: true,
      });
      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Requerimiento eliminado');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al eliminar requerimiento');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newRole || !newMember) {
      setSnackbarMessage('Selecciona un rol y un miembro por favor');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/agregar-miembro-ecs`, {
        faseId: selectedPhaseForMember,
        ecsId: selectedEcsForMember,
        rolId: newRole,
        miembroId: newMember
      }, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Miembro agregado');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al agregar miembro');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/quitar-miembro`, {
        faseId: selectedPhaseForMember,
        ecsId: selectedEcsForMember,
        miembroId: memberId
      }, {
        withCredentials: true,
      });
      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Miembro eliminado');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al eliminar miembro');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.startDate || !newTask.endDate || !newTask.memberId) {
      setSnackbarMessage('Por favor completa todos los campos de la tarea');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        faseId: selectedPhaseForMember,
        ecsId: selectedEcsForMember,
        titulo: newTask.title,
        descripcion: newTask.description,
        equipoMiembroId: newTask.memberId,
        fechaInicio: newTask.startDate,
        fechaFin: newTask.endDate,
      };

      if (editingTaskId) {
        taskData.tarea_id = editingTaskId;
      }

      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/agregar-tarea-ecs`, taskData, {
        withCredentials: true,
      });

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage(editingTaskId ? 'Tarea editada' : 'Tarea agregada');
      setSnackbarOpen(true);
      setLoading(false);
      setEditingTaskId(null);
      setNewTask({ title: '', description: '', startDate: '', endDate: '', memberId: '' });
    } catch (error) {
      setSnackbarMessage(editingTaskId ? 'Error al editar tarea' : 'Error al agregar tarea');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRemoveTask = async (taskId) => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/cronograma/${cronogramaId}/quitar-tarea`, {
        faseId: selectedPhaseForMember,
        ecsId: selectedEcsForMember,
        tarea_id: taskId
      }, {
        withCredentials: true,
      });
      const response = await axios.get(`${config.API_URL}/proyecto/${id}/cronograma`, {
        withCredentials: true,
      });

      const cronograma = response.data.data;
      setPhases(cronograma.cronogramaFase || []);
      setSnackbarMessage('Tarea eliminada');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error al eliminar tarea');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleBackToProjectManagement = () => {
    navigate('/dashboard/project-management');
  };
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestionar Cronograma</Typography>
      <Button variant="contained" color="secondary" onClick={handleBackToProjectManagement}>
        Terminar configuracion de Cronograma
      </Button>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
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
                  <TableCell>Elementos de la Configuración</TableCell>
                  <TableCell>Opciones (Agregar/Quitar ECS)</TableCell>
                  <TableCell>Progreso Inicio</TableCell>
                  <TableCell>Progreso Fin</TableCell>
                  <TableCell>Opciones (Agregar/Quitar Fase)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phases.length > 0 ? (
                  phases.map((phase, index) => (
                    <TableRow key={phase._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{phase.fase_id ? phase.fase_id.nombre : 'Sin Fase'}</TableCell>
                      <TableCell>{new Date(phase.fechaInicio).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(phase.fechaFin).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {phase.cronogramaEcs && phase.cronogramaEcs.length > 0 ? (
                          phase.cronogramaEcs.map((cronogramaEcs, ecsIndex) => (
                            <Box key={ecsIndex} display="flex" alignItems="center">
                              <Typography>{cronogramaEcs.ecs_id.nombre}</Typography>
                              <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveEcs(phase.fase_id._id, cronogramaEcs.ecs_id._id)}>Quitar</Button>
                              <Button variant="contained" color="primary" size="small" onClick={() => handleShowRequirements(phase.fase_id._id, cronogramaEcs.ecs_id._id)}>Ver Requerimientos</Button>
                              <Button variant="contained" color="primary" size="small" onClick={() => handleShowMembers(phase.fase_id._id, cronogramaEcs.ecs_id._id)}>Ver Miembros</Button>
                              <Button variant="contained" color="primary" size="small" onClick={() => handleShowTasks(phase.fase_id._id, cronogramaEcs.ecs_id._id)}>Ver Tareas</Button>
                            </Box>
                          ))
                        ) : (
                          <Typography>No hay ECS</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleAddEcs(phase.fase_id._id)}>Agregar ECS</Button>
                      </TableCell>
                      <TableCell>{phase.progresoInicio || 0}%</TableCell>
                      <TableCell>{phase.progresoFin || 0}%</TableCell>
                      <TableCell>
                        <Button variant="contained" color="secondary" size="small" onClick={() => handleRemovePhase(phase.fase_id._id)}>Quitar Fase</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No se encontraron fases
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2}>
                    <FormControl sx={{ width: '100%' }}>
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
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Fecha Inicio"
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Fecha Fin"
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell colSpan={3}>
                    <Button variant="contained" color="primary" onClick={handleAddPhase}>
                      Agregar Fase
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {selectedPhaseForReq && selectedEcsForReq && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Typography variant="h6">Requerimientos</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Usuario Asignado</TableCell>
                    <TableCell>Opciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements.length > 0 ? (
                    requirements.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>{req.requerimiento_id.nombre}</TableCell>
                        <TableCell>{req.user_id.name}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveRequirement(req._id)}>Quitar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No se encontraron requerimientos</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>
                      <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Requerimiento</InputLabel>
                        <Select
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          label="Requerimiento"
                        >
                          {availableRequirements.map((req) => (
                            <MenuItem key={req._id} value={req._id}>
                              {req.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <Button variant="contained" color="primary" onClick={handleAddRequirement}>
                        Agregar Requerimiento
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedPhaseForMember && selectedEcsForMember && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Typography variant="h6">Miembros</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Opciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>{member.equipoProyecto_id.user_id.name}</TableCell>
                        <TableCell>{member.rol_id.nombre}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveMember(member._id)}>Quitar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No se encontraron miembros</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>
                      <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Rol</InputLabel>
                        <Select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          label="Rol"
                        >
                          {roles.map((rol) => (
                            <MenuItem key={rol._id} value={rol._id}>
                              {rol.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Miembro</InputLabel>
                        <Select
                          value={newMember}
                          onChange={(e) => setNewMember(e.target.value)}
                          label="Miembro"
                        >
                          {availableMembers.map((member) => (
                            <MenuItem key={member._id} value={member._id}>
                              {member.user_id.name} - {member.rolEquipo_id.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={handleAddMember}>
                        Agregar Miembro
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedPhaseForMember && selectedEcsForMember && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Typography variant="h6">Tareas</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Miembro</TableCell>
                    <TableCell>Fecha Inicio</TableCell>
                    <TableCell>Fecha Fin</TableCell>
                    <TableCell>Opciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>{task.titulo}</TableCell>
                        <TableCell>{task.descripcion}</TableCell>
                        <TableCell>{task.equipoProyecto_id.user_id.name}</TableCell>
                        <TableCell>{new Date(task.fechaInicio).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(task.fechaFin).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="primary" size="small" onClick={() => {
                            setNewTask({
                              title: task.titulo,
                              description: task.descripcion,
                              startDate: task.fechaInicio.split('T')[0],
                              endDate: task.fechaFin.split('T')[0],
                              memberId: task.equipoProyecto_id._id,
                            });
                            setEditingTaskId(task._id);
                          }}>Editar</Button>
                          <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveTask(task._id)}>Quitar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No se encontraron tareas</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>
                      <TextField
                        label="Título"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Descripción"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Miembro</InputLabel>
                        <Select
                          value={newTask.memberId}
                          onChange={(e) => setNewTask({ ...newTask, memberId: e.target.value })}
                          label="Miembro"
                        >
                          {availableMembers.map((member) => (
                            <MenuItem key={member._id} value={member._id}>
                              {member.user_id.name} - {member.rolEquipo_id.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Fecha Inicio"
                        type="date"
                        value={newTask.startDate}
                        onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Fecha Fin"
                        type="date"
                        value={newTask.endDate}
                        onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={handleAddTask}>
                        {editingTaskId ? 'Guardar Cambios' : 'Agregar Tarea'}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
