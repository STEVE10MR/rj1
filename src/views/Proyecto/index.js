import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import * as ManagerCookies from "../ManagerCookies";

const ProjectManagementIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();
  const [user, setUser] = useState({ role: null, token: null });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let active = true;
      const userRole = ManagerCookies.getCookie('userRole');
      setUser({ role: userRole });
      if (['admin', 'jefe proyecto'].includes(userRole)) {
        active = undefined;
      }
      const response = await axios.get(`${config.API_URL}/proyecto`, {
        params: {
          limit: rowsPerPage,
          sort: sortField,
          [`or[0][0][nombre][regex]`]: search,
          active
        },
        withCredentials: true,
      });
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
      setLoading(false);
    } catch (error) {
      console.log('Error fetching projects:', error);
      setProjects([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, search, sortField]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  const handleSortFieldChange = (event) => {
    setSortField(event.target.value);
  };

  const handleRegister = () => {
    navigate('/dashboard/project-management/register');
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/project-management/edit/${id}`);
  };

  const handleCronograma = (id) => {
    navigate(`/dashboard/project-management/${id}/cronograma`);
  };

  const handleMiembros = (id) => {
    navigate(`/dashboard/project-management/${id}/equipo`);
  };

  const handleRequerimientos = (id) => {
    navigate(`/dashboard/project-management/${id}/requirement`);
  };

  const handleActivar = async (id) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/activar`, {}, {
        withCredentials: true,
      });
      fetchProjects(); // Llamada para actualizar la lista de proyectos
    } catch (error) {
      console.log('Error activating proyecto:', error);
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/desactivar`, {}, {
        withCredentials: true,
      });
      fetchProjects(); // Llamada para actualizar la lista de proyectos
    } catch (error) {
      console.log('Error deactivating proyecto:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Proyectos</Typography>
      {user.role === 'jefe proyecto' && (
        <Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
          Registrar Proyecto
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Nombre del Proyecto"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
        />
        <FormControl variant="outlined" sx={{ width: '200px' }}>
          <InputLabel>Ordenar Por</InputLabel>
          <Select
            value={sortField}
            onChange={handleSortFieldChange}
            label="Ordenar Por"
          >
            <MenuItem value="createdAt">Fecha de Creación</MenuItem>
            <MenuItem value="nombre">Nombre</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ width: '100px' }}>
          <InputLabel>Limite</InputLabel>
          <Select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            label="Limite"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha de Inicio</TableCell>
                <TableCell>Fecha de Fin</TableCell>
                <TableCell>Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length > 0 ? (
                projects.map(project => (
                  <TableRow key={project._id}>
                    <TableCell>{project.nombre}</TableCell>
                    <TableCell>{project.descripcion}</TableCell>
                    <TableCell>{new Date(project.fechaInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(project.fechaFin).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.role === 'jefe proyecto' && (
                        <>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(project._id)}>EDITAR</Button>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleCronograma(project._id)}>CRONOGRAMA</Button>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleMiembros(project._id)}>MIEMBROS</Button>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleRequerimientos(project._id)}>REQUERIMIENTOS</Button>
                          {project.active ? (
                            <Button variant="contained" color="error" onClick={() => handleDesactivar(project._id)}>DESACTIVAR</Button>
                          ) : (
                            <Button variant="contained" color="primary" onClick={() => handleActivar(project._id)}>ACTIVAR</Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron proyectos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(projects.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default ProjectManagementIndex;
