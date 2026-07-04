import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Home from '@/pages/public/Home';
import About from '@/pages/public/About';
import Departments from '@/pages/public/Departments';
import Events from '@/pages/public/Events';
import Contact from '@/pages/public/Contact';
import Policies from '@/pages/public/Policies';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import Dashboard from '@/pages/platform/Dashboard';
import DepartmentsManagement from '@/pages/platform/DepartmentsManagement';
import CoursesManagement from '@/pages/platform/CoursesManagement';
import AssignmentsManagement from '@/pages/platform/AssignmentsManagement';
import ResultsView from '@/pages/platform/ResultsView';
import UsersManagement from '@/pages/platform/UsersManagement';
import Settings from '@/pages/platform/Settings';
import LecturesManagement from '@/pages/platform/LecturesManagement';
import ProfilePage from '@/pages/platform/ProfilePage';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/:type" element={<Policies />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Platform Routes (Protected) */}
        <Route element={<ProtectedLayout />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* System Manager Routes */}
            <Route element={<ProtectedLayout allowedRoles={['system_manager']} />}>
              <Route path="/dashboard/departments" element={<DepartmentsManagement />} />
              <Route path="/dashboard/users" element={<UsersManagement />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>

            {/* General Routes */}
            <Route path="/dashboard/courses" element={<CoursesManagement />} />
            <Route path="/dashboard/lectures" element={<LecturesManagement />} />
            <Route path="/dashboard/assignments" element={<AssignmentsManagement />} />
            <Route path="/dashboard/content" element={<AssignmentsManagement />} />
            <Route path="/dashboard/results" element={<ResultsView />} />
            <Route path="/dashboard/grades" element={<ResultsView />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
