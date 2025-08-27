import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import CacheViewer from './CacheViewer';
import ProjectLinksViewer from './ProjectLinksViewer';
import aptService, { ProjectLink } from '../services/aptService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DataViewer: React.FC = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, any>>({});
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cacheData, linksData] = await Promise.all([
        aptService.getCache(),
        aptService.getProjectLinks()
      ]);
      setCache(cacheData);
      setProjectLinks(linksData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Cache" />
          <Tab label="Project Links" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CacheViewer cache={cache} onUpdate={fetchData} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ProjectLinksViewer links={projectLinks} />
      </TabPanel>
    </Paper>
  );
};

export default DataViewer;