import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CacheViewer from './CacheViewer';
import ProjectLinksViewer from './ProjectLinksViewer';
import aptService, { ProjectLink } from '../services/aptService';

interface DataViewerProps {
  initialExpanded?: string[];
}

const DataViewer: React.FC<DataViewerProps> = ({ initialExpanded = ['project-links'] }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(initialExpanded);
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

  const handleAccordionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => 
      isExpanded 
        ? [...prev, section]
        : prev.filter(s => s !== section)
    );
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
    <Paper elevation={3} sx={{ p: 2 }}>
      <Accordion 
        expanded={expandedSections.includes('project-links')}
        onChange={handleAccordionChange('project-links')}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            '&.Mui-expanded': {
              minHeight: 48,
              '& .MuiAccordionSummary-content': { margin: '12px 0' }
            }
          }}
        >
          <Typography>Project Links</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ProjectLinksViewer links={projectLinks} />
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expandedSections.includes('cache')}
        onChange={handleAccordionChange('cache')}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            '&.Mui-expanded': {
              minHeight: 48,
              '& .MuiAccordionSummary-content': { margin: '12px 0' }
            }
          }}
        >
          <Typography>Cache</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CacheViewer cache={cache} onUpdate={fetchData} />
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default DataViewer;