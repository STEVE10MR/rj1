import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const MetodologiaIndex = () => {
  const [metodologias, setMetodologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetodologias = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/metodologia`, {
          params: {
            limit: rowsPerPage,
            sort: sortField,
            [`or[0][0][nombre][regex]`]: search
          },
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          setMetodologias(response.data.data);
        } else {
          setMetodologias([]);
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching metodologias:', error);
        setMetodologias([]);
        setLoading(false);
      }
    };
    fetchMetodologias();
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
    navigate('/dashboard/methodology-management/register');
  };
  const handleGet = (id) => {
    navigate(`/dashboard/methodology-management/${id}`);
  };
  const handleEdit = (id) => {
    navigate(`/dashboard/methodology-management/edit/${id}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Metodologías</Typography>
      {localStorage.getItem('userRole') === 'admin' && (
      <Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
        Registrar Metodología
      </Button>)}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Nombre de la Metodología"
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
              {metodologias.length > 0 ? (
                metodologias.map(metodologia => (
                  <TableRow key={metodologia._id}>
                    <TableCell>{metodologia.nombre}</TableCell>
                    <TableCell>{metodologia.descripcion}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleGet(metodologia._id)}>VER</Button>
                      {localStorage.getItem('userRole') == 'admin' && (<Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(metodologia._id)}>EDITAR</Button>)}
                      <Button variant="contained" color="error">ELIMINAR</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No se encontraron metodologías
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(metodologias.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default MetodologiaIndex;
