import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button, CircularProgress, Paper, Avatar, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import * as ManagerCookies from './ManagerCookies';
import config from '../config';

const theme = createTheme();

const SelectProject = () => {
  const [roles, setRoles] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        
        /*
        if(localStorage.getItem('selectedProject')){
          navigate('/dashboard');
        }
        */
        if(ManagerCookies.getCookie('selectedProject')){
          navigate('/dashboard');
        }

        const response = await axios.get(`${config.API_URL}/auth/verify-session`, {
          withCredentials: true,
        });

        const rolesResponse = await axios.get(`${config.API_URL}/usuario/listar-equipo-proyecto`, { withCredentials: true });
        setRoles(rolesResponse.data.data || []);

        const committeesResponse = await axios.get(`${config.API_URL}/usuario/listar-comite-proyecto`, { withCredentials: true });
        setCommittees(committeesResponse.data.data || []);

        const userInfoResponse = await axios.get(`${config.API_URL}/usuario/informacion`, { withCredentials: true });
        setUserInfo(userInfoResponse.data.data);

        setLoading(false);
      } catch (error) {
        setSnackbarMessage('Error fetching data');
        setSnackbarOpen(true);
        setLoading(false);
        navigate('/');
      }
    };

    fetchInitialData();
  }, []);

  const fetchProjects = async (roleId, committeeId = null) => {
    setProjectsLoading(true);
    try {
      const endpoint = committeeId 
        ? `${config.API_URL}/usuario/listar-comite-proyecto`
        : `${config.API_URL}/usuario/listar-proyecto-rol-proyecto/${roleId}`;
      
      const response = committeeId 
        ? await axios.get(endpoint, { params: { comite_id: committeeId }, withCredentials: true })
        : await axios.get(endpoint, { withCredentials: true });

      setProjects(response.data.data || []);
      setProjectsLoading(false);
    } catch (error) {
      setSnackbarMessage('Error fetching projects');
      setSnackbarOpen(true);
      setProjectsLoading(false);
    }
  };

  const handleSelectProject = (projectId) => {
    //localStorage.setItem('selectedProject', projectId);
    ManagerCookies.createCookie('selectedProject', projectId)
    navigate('/dashboard');
  };

  const handleRoleClick = (roleId,roleName) => {
    //localStorage.setItem('teamRoleId', roleId);
    ManagerCookies.createCookie('teamRole', roleName)
    setSelectedRole(roleId);
    setSelectedCommittee(null);
    fetchProjects(roleId);
  };

  const handleCommitteeClick = (committeeId) => {
    //localStorage.setItem('committeeId', committeeId);
    ManagerCookies.createCookie('committeeId', committeeId)
    setSelectedCommittee(committeeId);
    setSelectedRole(null);
    fetchProjects(null, committeeId);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ bgcolor: '#1976d2', color: '#fff', p: 2, mb: 4 }}>
          <Typography variant="h4">GPDI : Project Management System</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, mb: 2 }}>
              {userInfo && (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 2, mb: 2, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64 }}>
                    <AccountCircle fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {userInfo.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    {userInfo.email}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>
                    {userInfo.role}
                  </Typography>
                </Box>
              )}
              <Typography variant="h6">Roles y Equipos</Typography>
              <Box>
                {roles.length > 0 ? roles.map((role) => (
                  <Button
                    key={role.id}
                    onClick={() => handleRoleClick(role.id,role.nombre)}
                    variant={selectedRole === role.id ? "contained" : "outlined"}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>{role.nombre[0]}</Avatar>
                      {role.nombre}
                    </div>
                  </Button>
                )) : <Typography variant="body2">No roles available</Typography>}
              </Box>
              <Typography variant="h6" sx={{ mt: 2 }}>Comite de Cambio</Typography>
              <Box>
                {committees.length > 0 ? committees.map((committee) => (
                  <Button
                    key={committee.id}
                    onClick={() => handleCommitteeClick(committee.id)}
                    variant={selectedCommittee === committee.id ? "contained" : "outlined"}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>{committee.nombre[0]}</Avatar>
                      {committee.nombre}
                    </div>
                  </Button>
                )) : <Typography variant="body2">No committees available</Typography>}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>Proyectos</Typography>
            {projectsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {projects.length > 0 ? projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.proyecto_id._id}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        transition: 'background-color 0.3s',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleSelectProject(project.proyecto_id._id)}
                    >
                      <Typography variant="h6">{project.proyecto_id.nombre}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {project.proyecto_id.descripcion}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Inicio: {new Date(project.proyecto_id.fechaInicio).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Fin: {new Date(project.proyecto_id.fechaFin).toLocaleDateString()}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Seleccionar
                      </Button>
                    </Paper>
                  </Grid>
                )) : <Typography variant="body2">No projects available</Typography>}
              </Grid>
            )}
          </Grid>
        </Grid>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SelectProject;
