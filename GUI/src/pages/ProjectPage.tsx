import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import DataViewer from '../components/DataViewer';
import aptService, { ProjectResponse } from '../services/aptService';
import ProjectConfigViewer from '../components/ProjectConfigViewer';

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

const ProjectPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { encodedPath } = useParams<{ encodedPath?: string }>();
  const [projectPath, setProjectPath] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectResponse | null>(null);

  // Function to encode project path for URL
  const encodeProjectPath = (path: string) => {
    // Convert backslashes to forward slashes and encode
    return encodeURIComponent(path.replace(/\\/g, '/'));
  };

  // Function to update project path and URL
  const updateProjectPath = (newPath: string) => {
    if (newPath !== projectPath) {
      setProjectPath(newPath);
      setTabValue(0); // Reset tab selection for new project
      setProjectData(null); // Clear old project data
      
      // Update URL without triggering a navigation
      const encodedProjectPath = encodeProjectPath(newPath);
      if (encodedProjectPath !== encodedPath) {
        navigate(`/project/${encodedProjectPath}`, { 
          replace: true,
          state: { projectPath: newPath }
        });
      }
    }
  };

  // Handle URL parameter
  useEffect(() => {
    if (encodedPath && location.state?.projectPath) {
      updateProjectPath(location.state.projectPath);
    }
  }, [encodedPath, location.state]);

  // Handle direct state changes
  useEffect(() => {
    if (location.state?.projectPath) {
      updateProjectPath(location.state.projectPath);
    }
  }, [location.state]);

  const loadProject = async (path: string) => {
    if (!path) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await aptService.getProject(path);
      setProjectData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      setProjectData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectPath) {
      loadProject(projectPath);
    }
  }, [projectPath]);

  const handleProjectPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectPath(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Project Configuration
        </Typography>
        <TextField
          fullWidth
          label="APTProject.js Path"
          value={projectPath}
          onChange={handleProjectPathChange}
          variant="outlined"
          placeholder="Enter path to APTProject.js"
          sx={{ mb: 2 }}
        />
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DataViewer initialExpanded={[]} />
          </Grid>

          {projectData && (
            <Grid item xs={12}>
              <Paper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                   <Tabs value={tabValue} onChange={handleTabChange}>
                   {Object.keys(projectData.environments).map((envName, index) => (
                     <Tab 
                       key={envName} 
                       label={`${envName} Config`}
                       data-config-name={envName}
                     />
                   ))}
                 </Tabs>
                </Box>
                {Object.entries(projectData.environments).map(([envName, config], index) => (
                  <TabPanel key={envName} value={tabValue} index={index}>
                    <ProjectConfigViewer 
                      config={config} 
                      name={envName}
                      onParentClick={(parentName) => {
                        const parentIndex = Object.keys(projectData.environments).indexOf(parentName);
                        if (parentIndex !== -1) {
                          setTabValue(parentIndex);
                        }
                      }}
                    />
                  </TabPanel>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectPage;