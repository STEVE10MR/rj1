import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './views/auth/login';
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


import ProjectRequerimentManagement from './views/Proyecto/index';
import ProjectRequerimentManagementGet from './views/Proyecto/get';
import ProjectRequerimentManagementRegister from './views/Proyecto/register';

import CronogramaManagement from './views/cronograma/edit';

import ProjectSelection from './views/SelectProject';

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
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
