import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Collapse, Toolbar, Divider, Typography, Avatar, useTheme } from '@mui/material';
import { ExpandLess, ExpandMore, Settings, People, Security, SwapHoriz, AccountCircle, Dashboard, ExitToApp, Assignment } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config';
import * as ManagerCookies from './ManagerCookies';
const Sidebar = () => {
  const [openMantenimiento, setOpenMantenimiento] = useState(false);
  const [openProyecto, setOpenProyecto] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [role, setRole] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    
    const fecthMaster =async()=>{
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get(`${config.API_URL}/usuario/informacion`, {
            withCredentials: true,
          });
          setUserInfo(response.data.data);
          setRole(response.data.data.role);
          ManagerCookies.createCookie('userRole',response.data.data.role)
        } catch (error) {
          console.error('Error fetching user information:', error);
        }
      };
  
      const fetchUserCheckInfo = async () => {
        const committeeId = ManagerCookies.getCookie('committeeId');
        const teamRole = ManagerCookies.getCookie('teamRole');
        const selectedProject = ManagerCookies.getCookie('selectedProject');
        const userRole = 'jefe proyecto'//ManagerCookies.getCookie('userRole');

        if ((!selectedProject && (!committeeId || !teamRole)) && (userRole !== 'admin' && userRole !== 'jefe proyecto')) {
          ManagerCookies.deleteCookie('selectedProject');
          ManagerCookies.deleteCookie('committeeId');
          ManagerCookies.deleteCookie('teamRole');
          navigate('/select-project');
        }
      };
      await fetchUserInfo();
      await fetchUserCheckInfo();
    }
    fecthMaster();
  }, []);

  const handleToggleMantenimiento = () => {
    setOpenMantenimiento(!openMantenimiento);
  };

  const handleToggleProyecto = () => {
    setOpenProyecto(!openProyecto);
  };

  const handleSelectProject = () => {
    ManagerCookies.deleteCookie('selectedProject');
    ManagerCookies.deleteCookie('committeeId');
    ManagerCookies.deleteCookie('teamRole');

    navigate('/select-project');
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${config.API_URL}/auth/logout`, { withCredentials: true });
      ManagerCookies.deleteCookie('selectedProject');
      ManagerCookies.deleteCookie('committeeId');
      ManagerCookies.deleteCookie('teamRole');
      ManagerCookies.deleteCookie('userRole');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box sx={{ width: 280, flexShrink: 0, bgcolor: theme.palette.background.default, height: '100vh', boxShadow: theme.shadows[5], display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Toolbar />
        {userInfo && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 2, mb: 2, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64 }}>
              <AccountCircle fontSize="large" />
            </Avatar>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {userInfo.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              {userInfo.email}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>
              {userInfo.role}
            </Typography>
          </Box>
        )}
        <Divider />
        <List>
          <ListItem button component={Link} to="/dashboard" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          {['user'].includes(role) && (<ListItem button onClick={handleSelectProject} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <Assignment />
            </ListItemIcon>
            <ListItemText primary="Seleccionar Proyecto" />
          </ListItem>)}
          {['admin','jefe proyecto'].includes(role) && (
            <>
              <ListItem button onClick={handleToggleMantenimiento} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Mantenimiento" />
                {openMantenimiento ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openMantenimiento} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem button component={Link} to="/dashboard/user-management" sx={{ pl: 4, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <ListItemText primary="Gestión de Usuarios" />
                  </ListItem>
                  <ListItem button component={Link} to="/dashboard/methodology-management" sx={{ pl: 4, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <ListItemText primary="Gestión de Metodologías" />
                  </ListItem>
                  <ListItem button component={Link} to="/dashboard/module-requirement" sx={{ pl: 4, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <ListItemText primary="Gestión de Módulos de Requerimiento" />
                  </ListItem>
                </List>
              </Collapse>
            </>
          )}
          <ListItem button onClick={handleToggleProyecto} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="Proyecto" />
            {openProyecto ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openProyecto} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
            {['jefe proyecto'].includes(role) && (
              <ListItem button component={Link} to="/dashboard/project-management" sx={{ pl: 4, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                <ListItemText primary="Gestión de Proyectos" />
              </ListItem>)}
            </List>
          </Collapse>
          <ListItem button component={Link} to="/dashboard/security" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText primary="Seguridad" />
          </ListItem>
          <ListItem button component={Link} to="/dashboard/change-control" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <SwapHoriz />
            </ListItemIcon>
            <ListItemText primary="Control de Cambios" />
          </ListItem>
          <ListItem button onClick={handleLogout} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()} Project Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
