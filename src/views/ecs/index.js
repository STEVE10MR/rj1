import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Pagination, CircularProgress, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams } from 'react-router-dom';
import * as ManagerCookies from "../ManagerCookies"
const ECSIndex = () => {
  const [ecs, setEcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const navigate = useNavigate();
  const { id, idFase  } = useParams();

  useEffect(() => {
    const fetchEcs = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/metodologia/${id}/fases/${idFase}/ecs`, {
          params: {
            limit: rowsPerPage,
            sort: sortField,
            [`or[0][0][nombre][regex]`]: search
          },
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          setEcs(response.data.data);
        } else {
          setEcs([]);
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching ECS:', error);
        setEcs([]);
        setLoading(false);
      }
    };
    fetchEcs();
  }, [id, idFase, page, rowsPerPage, search, sortField]);

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
    navigate(`/dashboard/methodology-management/${id}/phases/${idFase}/register`);
  };

  const handleEdit = (ecsId) => {
    navigate(`/dashboard/methodology-management/${id}/phases/${idFase}/edit/${ecsId}`);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(`/dashboard/metodologia/${id}/fases`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>Elementos de Configuración del Software</Typography>
      </Box>
      {['admin','jefe proyecto'].includes(ManagerCookies.getCookie('userRole')) &&(
      <Button variant="contained" color="primary" onClick={handleRegister} sx={{ mb: 2 }}>
        Registrar ECS
      </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Nombre del ECS"
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
                <TableCell>Tipo Ecs</TableCell>
                <TableCell>Tipo de Tecnologia</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ecs.length > 0 ? (
                ecs.map(ec => (
                  <TableRow key={ec._id}>
                    <TableCell>{ec.nombre}</TableCell>
                    <TableCell>{ec.descripcion}</TableCell>
                    <TableCell>{ec.tipoEcs}</TableCell>
                    <TableCell>{ec.tipoTecnologia}</TableCell>
                    <TableCell>{ec.versiones[ec.versiones.length-1].version}</TableCell>
                    <TableCell>{new Date(ec.versiones[ec.versiones.length-1].fechaInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(ec.versiones[ec.versiones.length-1].fechaFin).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {['admin','jefe proyecto'].includes(localStorage.getItem('userRole')) && (<Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(ec._id)}>EDITAR</Button>)}
                      {['admin','jefe proyecto'].includes(localStorage.getItem('userRole')) && (<Button variant="contained" color="error">ELIMINAR</Button>)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron ECS
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(ecs.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default ECSIndex;
