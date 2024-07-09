import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './views/auth/login';
import AuthGmail from './views/auth/authGmail';
import Layout from './views/Layout';
import UserManagement from './views/Usuario/index';
import UserManagementRegister from './views/Usuario/register';
import UserManagementEdit from './views/Usuario/edit';

import MethodologyManagement from './views/Metodologia/index';
import MethodologyManagementRegister from './views/Metodologia/register';
import MethodologyManagementEdit from './views/Metodologia/edit';


import PhasesManagement from './views/Fases/index';
import PhasesManagementRegister from './views/Fases/register';
import PhasesManagementEdit from './views/Fases/edit';


import EcsManagement from './views/ecs/index';
import EcsManagementRegister from './views/ecs/register';
import EcsManagementEdit from './views/ecs/edit';

import ModuleRequerimentManagement from './views/ModuloRequerimiento/index';
import ModuleRequerimentManagementEdit from './views/ModuloRequerimiento/edit';
import ModuleRequerimentManagementRegister from './views/ModuloRequerimiento/register';

import TareaManagement from './views/tareas/index';

import ProjectRequerimentManagement from './views/Proyecto/index';
import ProjectRequerimentManagementGet from './views/Proyecto/get';
import ProjectRequerimentManagementRegister from './views/Proyecto/register';


import RequerimentManagement from './views/Requerimiento/index';
import RequerimentManagementRegister from './views/Requerimiento/register';
import RequerimentManagementEdit from './views/Requerimiento/edit';

import EquipoProyectoManagement from './views/EquipoProyecto/index';
import EquipoProyectoManagementRegister from './views/EquipoProyecto/register';
import EquipoProyectoManagementEdit from './views/EquipoProyecto/edit';

import CronogramaManagement from './views/cronograma/edit';

import ProjectSelection from './views/SelectProject';

import InformeEstado from './views/InformeEstado/index';
import InformeEstadoProject from './views/InformeEstado/index';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/select-project" element={<ProjectSelection />} />
        <Route path="/dashboard/*" element={<Layout />}>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="user-management/register" element={<UserManagementRegister />} />
          <Route path="user-management/edit/:id" element={<UserManagementEdit />} />

          <Route path="methodology-management" element={<MethodologyManagement />} />
          <Route path="methodology-management/register" element={<MethodologyManagementRegister />} />
          <Route path="methodology-management/edit/:id" element={<MethodologyManagementEdit />} />
          <Route path="methodology-management/:id" element={<PhasesManagement />} />
          <Route path="methodology-management/:id/phases/register" element={<PhasesManagementRegister />} />
          <Route path="methodology-management/:id/phases/edit/:idFase" element={<PhasesManagementEdit />} />
          <Route path="methodology-management/:id/phases/:idFase" element={<EcsManagement />} />
          <Route path="methodology-management/:id/phases/:idFase/register" element={<EcsManagementRegister />} />
          <Route path="methodology-management/:id/phases/:idFase/edit/:idEcs" element={<EcsManagementEdit />} />

          <Route path="module-requirement" element={<ModuleRequerimentManagement />} />
          <Route path="module-requirement/:id" element={<ModuleRequerimentManagementEdit />} />
          <Route path="module-requirement/register" element={<ModuleRequerimentManagementRegister />} />

          <Route path="project-management" element={<ProjectRequerimentManagement />} />
          <Route path="project-management/:id" element={<ProjectRequerimentManagementGet />} />
          <Route path="project-management/register" element={<ProjectRequerimentManagementRegister />} />
          <Route path="project-management/:id/cronograma" element={<CronogramaManagement />} />

          <Route path="project-management/:id/requirement" element={<RequerimentManagement />} />
          <Route path="project-management/:id/requirement/register" element={<RequerimentManagementRegister />} />
          <Route path="project-management/:id/requirement/edit/:requirementId" element={<RequerimentManagementEdit />} />
          
          <Route path="project-management/:id/equipo" element={<EquipoProyectoManagement />} />
          <Route path="project-management/:id/equipo/register" element={<EquipoProyectoManagementRegister />} />
          <Route path="project-management/:id/equipo/edit/:equipoId" element={<EquipoProyectoManagementEdit />} />

          <Route path="task" element={<TareaManagement />} />

          <Route path="report-management" element={<InformeEstado />} />
          <Route path="report-management/:id/report-options" element={<InformeEstadoProject />} />
        </Route>
        <Route path="/auth/verification/:token" element={<AuthGmail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
