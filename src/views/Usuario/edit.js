import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, CircularProgress, Alert, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import config from '../../config';

const UserManagementEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    firtName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/usuario/${id}`, {
          withCredentials: true,
        });

        setFormData({
          email: response.data.data.email
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, ...updateData } = formData;
      await axios.patch(`${config.API_URL}/usuario/${id}`, updateData, {
        withCredentials: true,
      });
      navigate('/dashboard/user-management');
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error updating user');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <IconButton onClick={() => navigate('/dashboard/user-management')}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom align="center">Editar Usuario</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            variant="outlined"
            fullWidth
            margin="normal"
            required
            disabled
          />
          <TextField
            label="First Name"
            name="firtName"
            value={formData.firtName}
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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default UserManagementEdit;
