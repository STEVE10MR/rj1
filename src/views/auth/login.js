import React, { useState, useEffect } from "react";
import { Box, Button, Container, TextField, Typography, Link, Paper, Avatar, CssBaseline, Snackbar, Alert } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import Cookies from 'js-cookie'; 
import config from '../../config';

axios.defaults.withCredentials = true

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
    body2: {
      color: '#3f51b5',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    const checkSession = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/auth/verify-session`, {
          withCredentials: true,
        });
        if (response.data) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log("No active session", error);
      }
    };

    checkSession();
  }, [navigate]);

  const validate = () => {
    let tempErrors = {};
    let valid = true;

    if (!email) {
      tempErrors.email = "This field is required.";
      valid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        tempErrors.email = "Email is not valid.";
        valid = false;
      }
    }

    if (!password) {
      tempErrors.password = "This field is required.";
      valid = false;
    }
    
    setErrors(tempErrors);

    if (!valid) {
      setSnackbarMessage("Please fix the errors in the form.");
      setSnackbarOpen(true);
    }

    return valid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post(`${config.API_URL}/auth/login`, {
          email: email,
          password: password
        }, {
          withCredentials: true
        });
        navigate("/dashboard")
      } catch (error) {

        if (error.response && error.response.data && error.response.data.message) {
          setSnackbarMessage(error.response.data.message);
        } else {
          setSnackbarMessage("Login failed. Please check your credentials.");
        }
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper elevation={10} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Project Management System
            </Typography>
            <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 3, mb: 2,
                  transition: 'background-color 0.3s',
                }}
              >
                Login
              </Button>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Paper>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
