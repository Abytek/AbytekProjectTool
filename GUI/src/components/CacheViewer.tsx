import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface CacheViewerProps {
  cache: Record<string, any>;
}

const CacheViewer: React.FC<CacheViewerProps> = ({ cache }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cache Contents
      </Typography>
      <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
        <pre style={{ margin: 0 }}>
          {JSON.stringify(cache, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default CacheViewer;