import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import './App.css';

// Components
import Login from './components/Login';
import LostItemForm from './components/LostItemForm';
import FoundItemForm from './components/FoundItemForm';
import SearchFoundItems from './components/SearchFoundItems';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import MyRetrievals from './components/MyRetrievals';

// Services
import { authService, itemsService } from './services/api';

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const isAdmin = authService.isAdmin();
  
  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You don't have permission to access the admin panel. Only administrators can view this page.
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const handleLogin = async (credentials) => {
    try {
      await authService.login(credentials);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const handleLostItemSubmit = async (itemData) => {
    try {
      await itemsService.reportLost(itemData);
    } catch (error) {
      console.error('Error reporting lost item:', error);
    }
  };

  const handleFoundItemSubmit = async (itemData) => {
    try {
      await itemsService.reportFound(itemData);
    } catch (error) {
      console.error('Error reporting found item:', error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/*" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="lost" />} />
          <Route path="lost" element={<LostItemForm onSubmit={handleLostItemSubmit} />} />
          <Route path="found" element={<FoundItemForm onSubmit={handleFoundItemSubmit} />} />
          <Route path="search" element={<SearchFoundItems />} />
          <Route path="retrievals" element={<MyRetrievals />} />
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
