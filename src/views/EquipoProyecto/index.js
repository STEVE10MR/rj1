import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams } from 'react-router-dom';
import * as ManagerCookies from "../ManagerCookies";

const EquipoProyectoManagement = () => {
  const { id } = useParams();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();

  const userRole = ManagerCookies.getCookie('userRole');

  const fetchEquipos = async () => {
    setLoading(true);
    try {
      let active = true;
      if (['admin', 'jefe proyecto'].includes(userRole)) {
        active = undefined;
      }
      const response = await axios.get(`${config.API_URL}/proyecto/${id}/equipoProyecto`, {
        params: {
          limit: rowsPerPage,
          sort: sortField,
          [`or[0][0][nombre][regex]`]: search,
          active
        },
        withCredentials: true,
      });

      if (response.data && response.data.data) {
        setEquipos(response.data.data);
      } else {
        setEquipos([]);
      }
      setLoading(false);
    } catch (error) {
      console.log('Error fetching equipos:', error);
      setEquipos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [id, page, rowsPerPage, search, sortField, userRole]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSortFieldChange = (event) => {
    setSortField(event.target.value);
  };

  const handleRegister = () => {
    navigate(`/dashboard/project-management/${id}/equipo/register`);
  };

  const handleEdit = (equipoId) => {
    navigate(`/dashboard/project-management/${id}/equipo/edit/${equipoId}`);
  };

  const handleActivar = async (equipoId) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/equipoProyecto/${equipoId}/activar`, {}, {
        withCredentials: true,
      });
      fetchEquipos(); // Llamada para actualizar la lista de equipos
    } catch (error) {
      console.log('Error activating equipo:', error);
    }
  };

  const handleDesactivar = async (equipoId) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/equipoProyecto/${equipoId}/desactivar`, {}, {
        withCredentials: true,
      });
      fetchEquipos(); // Llamada para actualizar la lista de equipos
    } catch (error) {
      console.log('Error deactivating equipo:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Equipo del Proyecto</Typography>
      {['admin', 'jefe proyecto'].includes(userRole) && (
        <Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
          Registrar Miembro
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Buscar Miembro"
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
                <TableCell>Rol</TableCell>
                <TableCell>Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipos.length > 0 ? (
                equipos.map(equipo => (
                  <TableRow key={equipo._id}>
                    <TableCell>{equipo.user_id.name}</TableCell>
                    <TableCell>{equipo.rolEquipo_id.nombre}</TableCell>
                    <TableCell>
                      {['admin'].includes(userRole) && (
                        <>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(equipo._id)}>EDITAR</Button>
                          {equipo.active ? (
                            <Button variant="contained" color="error" onClick={() => handleDesactivar(equipo._id)}>
                              DESACTIVAR
                            </Button>
                          ) : (
                            <Button variant="contained" color="primary" onClick={() => handleActivar(equipo._id)}>
                              ACTIVAR
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No se encontraron miembros del equipo
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(equipos.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default EquipoProyectoManagement;
