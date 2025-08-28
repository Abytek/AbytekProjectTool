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
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataViewer from '../components/DataViewer';
import aptService, { ProjectResponse, ProjectLink } from '../services/aptService';
import ProjectConfigViewer from '../components/ProjectConfigViewer';
import ConfigDialog from '../components/ConfigDialog';

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
  const [configNames, setConfigNames] = useState<string[]>([]);
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<{ name: string; parent: string; config: Record<string, any> } | null>(null);

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

  const refreshConfigNames = async (path: string) => {
    if (!path) return;
    try {
      const names = await aptService.getConfigNames(path);
      setConfigNames(names);

      // If Base config is in names but not in environments, fetch it
      if (names.includes('Base') && !projectData?.environments?.Base) {
        const baseConfig = await aptService.getConfig(path, 'Base');
        if (projectData) {
          const updatedData = { ...projectData };
          updatedData.environments = updatedData.environments || {};
          updatedData.environments.Base = baseConfig;
          setProjectData(updatedData);
        }
      }
    } catch (err) {
      console.error('Failed to load config names:', err);
    }
  };

  const loadProject = async (path: string) => {
    if (!path) return;
    
    try {
      setLoading(true);
      setError(null);
      const [data, links, configNames] = await Promise.all([
        aptService.getProject(path),
        aptService.getProjectLinks(),
        aptService.getConfigNames(path)
      ]);

      // If Base config is in configNames but not in environments, fetch it
      if (configNames.includes('Base') && !data.environments?.Base) {
        const baseConfig = await aptService.getConfig(path, 'Base');
        data.environments = data.environments || {};
        data.environments.Base = baseConfig;
      }

      setProjectData(data);
      setProjectLinks(links);
      setConfigNames(configNames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      setProjectData(null);
      setProjectLinks([]);
      setConfigNames([]);
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
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      {configNames.map((envName, index) => (
                        <Tab 
                          key={envName} 
                          label={`${envName} Config`}
                          data-config-name={envName}
                        />
                      ))}
                    </Tabs>
                  </Box>
                  <Tooltip title="Add New Config">
                    <IconButton
                      color="primary"
                      onClick={() => setConfigDialogOpen(true)}
                      sx={{ mr: 2 }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <ConfigDialog
                  open={configDialogOpen}
                  onClose={() => {
                    setConfigDialogOpen(false);
                    setEditingConfig(null);
                  }}
                  onSave={async (name, parent) => {
                    try {
                      if (editingConfig) {
                        // Update config parent
                        const updatedConfig = {
                          ...editingConfig.config
                        };
                        if (parent === '') {
                          // Remove Parent field when "None" is selected
                          delete updatedConfig.Parent;
                          delete updatedConfig._parentConfig;
                        } else {
                          updatedConfig.Parent = parent;
                        }
                        await aptService.addConfig(projectPath, editingConfig.name, updatedConfig);
                      } else {
                        // Add new config
                        const newConfig: Record<string, any> = {
                          Dependencies: {}
                        };
                        if (parent !== '') {
                          newConfig.Parent = parent;
                        }
                        await aptService.addConfig(projectPath, name, newConfig);
                      }
                      refreshConfigNames(projectPath);
                    } catch (error) {
                      console.error('Error saving config:', error);
                      throw error;
                    }
                  }}
                  availableConfigs={configNames}
                  configParents={Object.fromEntries(
                    Object.entries(projectData.environments)
                      .map(([name, config]) => [name, (config as any)._parentConfig || ''])
                  )}
                  initialName={editingConfig?.name || ''}
                  initialParent={editingConfig ? editingConfig.parent : Object.keys(projectData.environments)[tabValue]}
                  isEdit={!!editingConfig}
                />
                {Object.entries(projectData.environments).map(([envName, config], index) => (
                  <TabPanel key={envName} value={tabValue} index={index}>
                    <ProjectConfigViewer 
                      config={config} 
                      name={envName}
                      projectPath={projectPath}
                      projectLinks={projectLinks}
                      onParentClick={(parentName) => {
                        const parentIndex = Object.keys(projectData.environments).indexOf(parentName);
                        if (parentIndex !== -1) {
                          setTabValue(parentIndex);
                        }
                      }}
                      onEditConfig={(name, parent, currentConfig) => {
                        setEditingConfig({ name, parent, config: currentConfig });
                        setConfigDialogOpen(true);
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