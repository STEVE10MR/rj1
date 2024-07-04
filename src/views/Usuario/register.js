import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, IconButton, CircularProgress, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import * as ManagerCookies from "../ManagerCookies";

const UserManagementRegister = () => {
  const userRole = ManagerCookies.getCookie('userRole'); // Obtener el rol del usuario actual
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'jefe proyecto' : 'user') : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.API_URL}/usuario/registrarUsuario`, formData, {
        withCredentials: true,
      });
      console.log("formData")
      console.log('User registered:', response.data);
      navigate('/dashboard/user-management');
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Error registering user. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/user-management');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Registrar Usuario</Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />
        {userRole === 'admin' && (
          <FormControlLabel
            control={
              <Checkbox
                name="role"
                checked={formData.role === 'jefe proyecto'}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Marcar como Jefe de Proyecto"
          />
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ position: 'relative', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            Guardar cambios
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default UserManagementRegister;
