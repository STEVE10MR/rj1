import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, ListItemIcon, Grid, Paper, Avatar } from '@mui/material';
import axios from 'axios';
import config from '../config';

const UserDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const fetchTeamsAndProjects = async () => {
      try {
        const teamsResponse = await axios.get(`${config.API_URL}/user/teams`, {
          withCredentials: true,
        });
        setTeams(teamsResponse.data.data);

        if (teamsResponse.data.data.length > 0) {
          setSelectedTeam(teamsResponse.data.data[0]._id);
          const projectsResponse = await axios.get(`${config.API_URL}/user/projects`, {
            params: { teamId: teamsResponse.data.data[0]._id },
            withCredentials: true,
          });
          setProjects(projectsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching teams and projects:', error);
      }
    };
    fetchTeamsAndProjects();
  }, []);

  const handleTeamClick = async (teamId) => {
    setSelectedTeam(teamId);
    try {
      const projectsResponse = await axios.get(`${config.API_URL}/user/projects`, {
        params: { teamId },
        withCredentials: true,
      });
      setProjects(projectsResponse.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>User Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Roles y Equipos</Typography>
            <List>
              {teams.map((team) => (
                <ListItem button key={team._id} onClick={() => handleTeamClick(team._id)}>
                  <ListItemIcon>
                    <Avatar>{team.name[0]}</Avatar>
                  </ListItemIcon>
                  <ListItemText primary={team.name} secondary={team.role} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Proyectos</Typography>
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={4} key={project._id}>
                  <Paper sx={{ padding: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography variant="body2">{project.description}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;
