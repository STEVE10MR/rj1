import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams } from 'react-router-dom';

const FasesIndex = () => {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchFases = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/metodologia/${id}/fases`, {
          params: {
            limit: rowsPerPage,
            sort: sortField,
            [`or[0][0][nombre][regex]`]: search
          },
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          setFases(response.data.data);
        } else {
          setFases([]);
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching fases:', error);
        setFases([]);
        setLoading(false);
      }
    };
    fetchFases();
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
    navigate(`/dashboard/methodology-management/${id}/phases/register`);
  };
  const handleGet = (faseId) => {
    navigate(`/dashboard/methodology-management/${id}/phases/${faseId}`);
  };
  const handleEdit = (faseId) => {
    navigate(`/dashboard/methodology-management/${id}/phases/edit/${faseId}`);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(`/dashboard/methodology-management`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Fases de la Metodología</Typography>
      </Box>
      {['admin','jefe proyecto'].includes(localStorage.getItem('userRole')) &&(<Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
        Registrar Fase
      </Button>)}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Nombre de la Fase"
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
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
              {fases.length > 0 ? (
                fases.map(fase => (
                  <TableRow key={fase._id}>
                    <TableCell>{fase.nombre}</TableCell>
                    <TableCell>{fase.descripcion}</TableCell>
                    <TableCell>
                    <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleGet(fase._id)}>VER</Button>
                    {['admin','jefe proyecto'].includes(localStorage.getItem('userRole')) &&(<Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(fase._id)}>EDITAR</Button>)}
                    <Button variant="contained" color="error">ELIMINAR</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No se encontraron fases
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(fases.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default FasesIndex;
