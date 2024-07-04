import React, { useEffect, useState } from 'react';
import { Box, Toolbar, AppBar, Typography, CssBaseline, CircularProgress } from '@mui/material';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import axios from 'axios';
import config from '../config';
import * as ManagerCookies from "./ManagerCookies"

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ role: null, token: null });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  
  useEffect(() => {
    const project = ManagerCookies.getCookie('selectedProject');
    //const project = localStorage.getItem('selectedProject');
    const checkSession = async () => {
      let userRole = null;
      try {
        const response = await axios.get(`${config.API_URL}/auth/verify-session`, {
          withCredentials: true,
        });
        setUser({ role: response.data.data.role, token: null });
        setSelectedProject(project);
        setLoading(false);
      } catch (error) {
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return <CircularProgress />;
  }
  if (!user.role) {
    return <Navigate to="/" />;
  }

  if(user.role =='admin' || user.role =='jefe proyecto'){
    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              GPDI : Project Management System
            </Typography>
          </Toolbar>
        </AppBar>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {location.pathname === "/dashboard" && (<AdminDashboard />)}
          <Outlet />
        </Box>
      </Box>
    );
  }
  if (user.role !== 'admin' && user.role !== 'jefe proyecto' && !selectedProject && location.pathname !== '/select-project') {
    return <Navigate to="/select-project" />;
  }
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            GPDI : Project Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {location.pathname === "/dashboard" && (<UserDashboard />)}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
