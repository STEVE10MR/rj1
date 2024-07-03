import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import config from '../../config';

const AuthGmail = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.patch(`${config.API_URL}/auth/verification/${token}`, {
          withCredentials: true
        });

        if (response.data.success) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        navigate('/');
      }
    };

    if (token) {
      verifyToken();
    } else {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default AuthGmail;
