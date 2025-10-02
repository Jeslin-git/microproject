import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box, CssBaseline, ThemeProvider, IconButton, AppBar, Toolbar, Typography, Button, GlobalStyles
} from '@mui/material';
import { 
  Brightness4 as Brightness4Icon, 
  Brightness7 as Brightness7Icon, 
  Logout as LogoutIcon 
} from '@mui/icons-material';
import getTheme from '../theme';
import Sidebar from './Sidebar';

const Dashboard = ({ onLogout }) => {
  const [mode, setMode] = useState('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = getTheme(mode);

  const backgroundStyles = {
    body: {
      background: theme.palette.mode === 'light'
        ? 'linear-gradient(45deg, #e0f7fa 0%, #fffde7 50%, #fce4ec 100%)' // A vibrant multi-color gradient
        : 'linear-gradient(180deg, #212121 0%, #004d40 100%)',
      backgroundAttachment: 'fixed',
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={backgroundStyles} />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Lost & Found
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px' }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
