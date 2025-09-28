import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box,
  CssBaseline, ThemeProvider, createTheme
} from '@mui/material';
import './App.css';

// Components
import Login from './components/Login';
import LostItemForm from './components/LostItemForm';
import FoundItemForm from './components/FoundItemForm';
import ItemCard from './components/ItemCard';

// Services
import { authService, itemsService } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLostItems();
    }
  }, [isAuthenticated]);

  const loadLostItems = async () => {
    try {
      const items = await itemsService.getLostItems();
      setLostItems(items);
    } catch (error) {
      console.error('Error loading lost items:', error);
    }
  };

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
      loadLostItems();
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Lost & Found System
              </Typography>
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={Link} to="/lost">
                    Report Lost
                  </Button>
                  <Button color="inherit" component={Link} to="/found">
                    Report Found
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route
                path="/login"
                element={
                  !isAuthenticated ? (
                    <Login onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/lost" />
                  )
                }
              />
              <Route
                path="/lost"
                element={
                  isAuthenticated ? (
                    <>
                      <LostItemForm onSubmit={handleLostItemSubmit} />
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                          Your Lost Items
                        </Typography>
                        {lostItems.map((item) => (
                          <ItemCard key={item.id} item={item} type="lost" />
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/found"
                element={
                  isAuthenticated ? (
                    <FoundItemForm onSubmit={handleFoundItemSubmit} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/" element={<Navigate to="/lost" />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
