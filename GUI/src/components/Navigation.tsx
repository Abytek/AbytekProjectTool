import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../theme/ThemeContext';

const Navigation = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/"
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              opacity: 0.8
            },
            cursor: 'pointer'
          }}
        >
          Abytek Project Tool
        </Typography>
        <Button color="inherit" component={RouterLink} to="/project" sx={{ mr: 2 }}>
          Project
        </Button>
        <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;