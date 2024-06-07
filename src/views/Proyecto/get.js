import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button, TextField, IconButton, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const GetProject = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [projectLeaders, setProjectLeaders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [leaderToRemove, setLeaderToRemove] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}`, {
          withCredentials: true,
        });
        const responseTeam = await axios.get(`${config.API_URL}/proyecto/${id}/equipoProyecto`, {
          withCredentials: true,
        });

        setProject(response.data.data);
        setProjectLeaders(responseTeam.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Error fetching project');
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/usuario/obtenerUsuarios?active[eq]=true&role[eq]=user`, {
          params: {
            [`or[0][0][name][regex]`]: search,
            [`or[0][1][email][regex]`]: search
          },
          withCredentials: true,
        });

        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchProject();
    fetchUsers();
  }, [id, search]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleAddProjectLeader = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.API_URL}/proyecto/${id}/equipoProyecto/add-project-manager`, { user_id: selectedUser }, {
        withCredentials: true,
      });

      // Fetch the user details for the newly added project leader
      const newLeader = users.find(user => user._id === selectedUser);
      setProjectLeaders([...projectLeaders, { ...response.data.data, user_id: newLeader }]);
      setSelectedUser('');
      setLoading(false);
    } catch (error) {
      console.error('Error adding project leader:', error);
      setError('Error adding project leader');
      setLoading(false);
    }
  };

  const handleRemoveProjectLeader = async () => {
    if (!leaderToRemove) return;

    try {
      setLoading(true);
      await axios.delete(`${config.API_URL}/proyecto/${id}/equipoProyecto/${leaderToRemove._id}`, {
        withCredentials: true,
      });
      setProjectLeaders(projectLeaders.filter(leader => leader._id !== leaderToRemove._id));
      setLoading(false);
      setOpenDialog(false);
    } catch (error) {
      console.log('Error removing project leader:', error);
      setError('Error removing project leader');
      setLoading(false);
    }
  };

  const handleOpenDialog = (leader) => {
    setLeaderToRemove(leader);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setLeaderToRemove(null);
    setOpenDialog(false);
  };

  return (
    <Container>
      <Box sx={{ mt: 2, maxWidth: 600, mx: 'auto', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/dashboard/project-management')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Configuración del Proyecto</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          {error && <Alert severity="error">{error}</Alert>}
          {project && (
            <>
              <Typography variant="h6">Nombre: {project.nombre}</Typography>
              <Typography variant="h6">Descripción: {project.descripcion}</Typography>
              <Typography variant="h6">Fecha de Inicio: {new Date(project.fechaInicio).toLocaleDateString()}</Typography>
              <Typography variant="h6">Fecha de Fin: {new Date(project.fechaFin).toLocaleDateString()}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Jefes de Proyecto</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Correo</TableCell>
                        <TableCell>Opciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectLeaders.length > 0 ? (
                        projectLeaders.map(leader => (
                          <TableRow key={leader._id}>
                            <TableCell>{leader?.user_id?.name || 'N/A'}</TableCell>
                            <TableCell>{leader?.user_id?.email || 'N/A'}</TableCell>
                            <TableCell>
                              <Button variant="contained" color="error" onClick={() => handleOpenDialog(leader)}>
                                Quitar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No se encontraron jefes de proyecto
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Agregar Jefe de Proyecto</Typography>
                <TextField
                  label="Buscar Usuario"
                  variant="outlined"
                  value={search}
                  onChange={handleSearchChange}
                  fullWidth
                  margin="normal"
                />
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel>Seleccionar Usuario</InputLabel>
                  <Select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    label="Seleccionar Usuario"
                  >
                    {users.length > 0 ? (
                      users.map(user => (
                        <MenuItem key={user._id} value={user._id}>{user.name} ({user.email})</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No se encontraron usuarios</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleAddProjectLeader} disabled={!selectedUser}>
                  Agregar Jefe de Proyecto
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Está seguro de que quiere quitar a este jefe de proyecto?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleRemoveProjectLeader} color="error" autoFocus>
            Quitar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GetProject;
