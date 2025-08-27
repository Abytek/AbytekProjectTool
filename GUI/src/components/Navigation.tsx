import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navigation = () => {
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
        <Button color="inherit" component={RouterLink} to="/project">
          Project
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;