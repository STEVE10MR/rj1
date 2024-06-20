import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams } from 'react-router-dom';

const RequerimientosIndex = () => {
  const { id } = useParams();
  const [requerimientos, setRequerimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequerimientos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/proyecto/${id}/requerimiento`, {
          params: {
            limit: rowsPerPage,
            sort: sortField,
            [`or[0][0][nombre][regex]`]: search
          },
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

    fetchRequerimientos();
  }, [id, page, rowsPerPage, search, sortField]);

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
    navigate(`/project-management/${id}/requirement/register`);
  };

  const handleEdit = (requirementId) => {
    navigate(`/project-management/${id}/requirement/edit/${requirementId}`);
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
                      <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(requerimiento._id)}>EDITAR</Button>
                      <Button variant="contained" color="error">ELIMINAR</Button>
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