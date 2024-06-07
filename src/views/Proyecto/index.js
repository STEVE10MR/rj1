import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProjectManagementIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();
  const [user, setUser] = useState({ role: null, token: null });
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/proyecto`, {
          params: {
            limit: rowsPerPage,
            sort: sortField,
            [`or[0][0][nombre][regex]`]: search
          },
          withCredentials: true,
        });
        const userRole = Cookies.get('user-role');
        console.log(userRole)

        setUser({ role: userRole });
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
  const handleGet = (id) => {
    navigate(`/dashboard/project-management/${id}`);
  };
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Proyectos</Typography>
      {user.role === 'user'&&(
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
                    {user.role === 'user'&&(
                        <TableCell>
                            <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleGet(project._id)}>VER</Button>
                            <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(project._id)}>EDITAR</Button>
                            <Button variant="contained" color="error">ELIMINAR</Button>
                        </TableCell>
                    )}
                    {user.role === 'admin'&&(
                        <TableCell>
                            <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleGet(project._id)}>VER</Button>
                        </TableCell>
                    )}
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
