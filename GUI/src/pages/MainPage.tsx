import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DataViewer from '../components/DataViewer';

const MainPage = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to Abytek Project Tool
        </Typography>
        <Typography variant="body1">
          Manage and navigate your projects with ease. Select a project from the links below or use the navigation to create/open a specific project.
        </Typography>
      </Paper>
      
      <DataViewer />
    </Box>
  );
};

export default MainPage;