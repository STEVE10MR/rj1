import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams } from 'react-router-dom';
import * as ManagerCookies from "../ManagerCookies";

const RequerimientosIndex = () => {
  const { id } = useParams();
  const [requerimientos, setRequerimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();

  const userRole = ManagerCookies.getCookie('userRole');

  const fetchRequerimientos = async () => {
    setLoading(true);
    try {
      let active = true;
      if (['admin', 'jefe proyecto'].includes(userRole)) {
        active = undefined;
      }

      const params = {
        limit: rowsPerPage,
        sort: sortField,
        active,
        $or: [
          { 'nombre': { $regex: search, $options: 'i' } },
          { 'descripcion': { $regex: search, $options: 'i' } }
        ]
      };

      const response = await axios.get(`${config.API_URL}/proyecto/${id}/requerimiento`, {
        params: params,
        withCredentials: true,
      });

      if (response.data && response.data.data) {
        setRequerimientos(response.data.data);
      } else {
        setRequerimientos([]);
      }
      setLoading(false);
    } catch (error) {
      console.log('Error fetching requerimientos:', error);
      setRequerimientos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequerimientos();
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
    navigate(`/dashboard/project-management/${id}/requirement/register`);
  };

  const handleEdit = (requirementId) => {
    navigate(`/dashboard/project-management/${id}/requirement/edit/${requirementId}`);
  };

  const handleActivar = async (requirementId) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/requerimiento/${requirementId}/activar`, {}, {
        withCredentials: true,
      });
      fetchRequerimientos(); // Llamada para actualizar la lista de requerimientos
    } catch (error) {
      console.log('Error activating requerimiento:', error);
    }
  };

  const handleDesactivar = async (requirementId) => {
    try {
      await axios.patch(`${config.API_URL}/proyecto/${id}/requerimiento/${requirementId}/desactivar`, {}, {
        withCredentials: true,
      });
      fetchRequerimientos(); // Llamada para actualizar la lista de requerimientos
    } catch (error) {
      console.log('Error deactivating requerimiento:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Requerimientos del Proyecto</Typography>
      <Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
        Registrar Requerimiento
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Buscar Requerimiento"
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
                <TableCell>Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requerimientos.length > 0 ? (
                requerimientos.map(requerimiento => (
                  <TableRow key={requerimiento._id}>
                    <TableCell>{requerimiento.nombre}</TableCell>
                    <TableCell>{requerimiento.descripcion}</TableCell>
                    <TableCell>
                      {['admin','jefe proyecto'].includes(userRole) && (
                        <>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(requerimiento._id)}>EDITAR</Button>
                          {requerimiento.active ? (
                            <Button variant="contained" color="error" onClick={() => handleDesactivar(requerimiento._id)}>
                              DESACTIVAR
                            </Button>
                          ) : (
                            <Button variant="contained" color="primary" onClick={() => handleActivar(requerimiento._id)}>
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
                    No se encontraron requerimientos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(requerimientos.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default RequerimientosIndex;
