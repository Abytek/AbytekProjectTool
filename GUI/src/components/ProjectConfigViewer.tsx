import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Link,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Link as LinkIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import aptService, { DependencyDetails, ProjectLink } from '../services/aptService';
import DependencyDialog from './DependencyDialog';
import TreeObjectEditor from './TreeObjectEditor';

interface ProjectConfigViewerProps {
  config: Record<string, any>;
  name: string;
  projectPath: string;
  projectLinks: ProjectLink[];
  onParentClick?: (parentName: string) => void;
  onEditConfig?: (name: string, parent: string, currentConfig: Record<string, any>) => void;
  onAddConfig?: () => void;
}

const ProjectConfigViewer: React.FC<ProjectConfigViewerProps> = ({ config: initialConfig, name, projectPath, projectLinks, onParentClick, onEditConfig, onAddConfig }) => {
  const [config, setConfig] = useState(initialConfig);

  // Update local state when prop changes
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDependency, setEditingDependency] = useState<{ name: string; details: DependencyDetails } | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);



  const handleVisitProject = async (dependency: Record<string, any>) => {
    try {
      const resolution = await aptService.resolveProjectLink(dependency);
      if (resolution.success && resolution.projectLink) {
        navigate('/project', { state: { projectPath: resolution.projectLink.entryFile } });
      } else {
        console.error('Failed to resolve project link:', resolution.error);
      }
    } catch (error) {
      console.error('Error visiting project:', error);
    }
  };

  const parseGitHubUrl = (remoteUrl: string): string | null => {
    // Skip local paths
    if (remoteUrl.startsWith('/') || remoteUrl.includes(':\\')) {
      return null;
    }

    try {
      // Handle SSH format: git@github.com:username/repo.git
      if (remoteUrl.startsWith('git@github.com:')) {
        const path = remoteUrl.replace('git@github.com:', '').replace(/\.git$/, '');
        return `https://github.com/${path}`;
      }
      
      // Handle HTTPS/HTTP formats
      if (remoteUrl.includes('github.com')) {
        // Convert any http to https and clean up the URL
        return remoteUrl
          .replace(/^git:\/\//, 'https://')
          .replace(/^http:\/\//, 'https://')
          .replace(/\.git$/, '');
      }
    } catch {}
    
    return null;
  };

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <Chip size="small" label="null" color="default" />;
    }

    if (typeof value === 'boolean') {
      return (
        <Chip
          size="small"
          label={value.toString()}
          color={value ? "success" : "default"}
        />
      );
    }

    if (typeof value === 'string') {
      // Check if it's a project path
      if (value.endsWith('APTProject.js')) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {value}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleVisitProject({ EntryFile: value })}
              color="primary"
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }

      // Check if it's a Git URL
      const githubUrl = parseGitHubUrl(value);
      if (githubUrl) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {value}
            </Typography>
            <IconButton
              size="small"
              component="a"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }

      return (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      );
    }

    if (Array.isArray(value)) {
      return (
        <List dense disablePadding>
          {value.map((item, index) => (
            <ListItem key={index} dense>
              <ListItemText
                primary={renderValue(item)}
                sx={{ my: 0 }}
              />
            </ListItem>
          ))}
        </List>
      );
    }

    if (typeof value === 'object') {
      return (
        <Box sx={{ pl: 2 }}>
          {Object.entries(value).map(([key, val]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {key}
              </Typography>
              {renderValue(val)}
            </Box>
          ))}
        </Box>
      );
    }

    return String(value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, dependencyName: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedDependency(dependencyName);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDependency(null);
  };

  const handleAddDependency = () => {
    setEditingDependency(null);
    setDialogOpen(true);
  };

  const handleEditDependency = () => {
    if (selectedDependency && config.Dependencies[selectedDependency]) {
      setEditingDependency({
        name: selectedDependency,
        details: config.Dependencies[selectedDependency]
      });
      setDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteDependency = async () => {
    if (selectedDependency) {
      try {
        // Get current config
        const updatedConfig = { ...config };
        
        // Delete the dependency
        if (updatedConfig.Dependencies) {
          delete updatedConfig.Dependencies[selectedDependency];
        }

        // Save the updated config
        await aptService.addConfig(projectPath, name, updatedConfig);
        
        // Refresh the config data
        await refreshConfig();
      } catch (error) {
        console.error('Error deleting dependency:', error);
      }
      handleMenuClose();
    }
  };

  const refreshConfig = async () => {
    try {
      const updatedConfig = await aptService.getConfig(projectPath, name);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error refreshing config:', error);
    }
  };

  const handleSaveDependency = async (dependencyName: string, details: DependencyDetails) => {
    try {
      // Get current config
      const updatedConfig = { ...config };
      
      // Initialize Dependencies if it doesn't exist
      if (!updatedConfig.Dependencies) {
        updatedConfig.Dependencies = {};
      }

      // If editing and name changed, delete the old dependency
      if (editingDependency && editingDependency.name !== dependencyName) {
        delete updatedConfig.Dependencies[editingDependency.name];
      }

      // Update or add the dependency
      updatedConfig.Dependencies[dependencyName] = details;

      // Save the updated config
      await aptService.addConfig(projectPath, name, updatedConfig);
      
      // Refresh the config data
      await refreshConfig();
      
      // Close the dialog
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving dependency:', error);
      throw error;
    }
  };

  const renderDependencies = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Dependencies</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddDependency}
            size="small"
          >
            Add Dependency
          </Button>
        </Box>
        {!config.Dependencies || Object.keys(config.Dependencies).length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No dependencies added yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddDependency}
              size="small"
            >
              Add Your First Dependency
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {Object.entries(config.Dependencies).map(([name, details]: [string, any]) => {
            const githubUrl = details.GitDetails ? parseGitHubUrl(details.GitDetails.RemoteURL) : null;
            
            return (
              <Grid item xs={12} md={6} key={name}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon color="action" />
                      <Typography variant="subtitle1">{name}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, name)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  {details.GitDetails && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Repository
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GitHubIcon fontSize="small" color="action" />
                        <Link
                          href={githubUrl || details.GitDetails.RemoteURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        >
                          {details.GitDetails.RemoteURL}
                        </Link>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Branch: {details.GitDetails.Branch}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Commit: {details.GitDetails.Commit?.substring(0, 8)}
                      </Typography>
                    </>
                  )}
                  {/* Visit button for Git projects */}
                  {details.GitDetails && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleVisitProject(details)}
                      >
                        Visit Project
                      </Button>
                      {githubUrl && (
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<GitHubIcon />}
                        >
                          GitHub
                        </Button>
                      )}
                    </Box>
                  )}
                  {/* Visit button for local projects */}
                  {!details.GitDetails && details.EntryFile && (
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleVisitProject(details)}
                      sx={{ mt: 1 }}
                    >
                      Visit Project
                    </Button>
                  )}
                </Paper>
              </Grid>
            );
          })}
          </Grid>
        )}
      </Box>
    );
  };

  const handleDeleteConfig = async () => {
    try {
      await aptService.deleteConfig(projectPath, name);
      // Let parent component handle navigation since this component will be unmounted
      window.location.reload();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  return (
    <Box>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditDependency}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteDependency}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

                    <DependencyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveDependency}
        projectLinks={projectLinks}
        initialName={editingDependency?.name || ''}
        initialDetails={editingDependency?.details || {}}
        isEdit={!!editingDependency}
      />

             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <SettingsIcon color="primary" />
           <Typography variant="h5">{name} Config</Typography>
         </Box>
         <Box sx={{ display: 'flex', gap: 1 }}>
           <Box sx={{ display: 'flex', gap: 1 }}>
             {config._parentConfig && (
               <Button
                 size="small"
                 variant="outlined"
                 onClick={() => onParentClick?.(config._parentConfig)}
                 startIcon={<ArrowForwardIcon />}
               >
                 Parent: {config._parentConfig}
               </Button>
             )}
             <Button
               size="small"
               variant="outlined"
               onClick={() => onEditConfig?.(name, config._parentConfig || '', config)}
               startIcon={<EditIcon />}
             >
               {config._parentConfig ? 'Change Parent' : 'Set Parent'}
             </Button>
           </Box>
           <Button
             size="small"
             variant="outlined"
             color="error"
             onClick={handleDeleteConfig}
             startIcon={<DeleteIcon />}
           >
             Delete Config
           </Button>
         </Box>
       </Box>


      
      {renderDependencies()}

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Settings</Typography>
        </Box>
        <Paper sx={{ p: 2 }}>
          {/* Global Default */}
          <Box sx={{ mb: 3 }}>
            <TreeObjectEditor
              name="GlobalDefault"
              value={config['GlobalDefault'] || {}}
              onChange={async (newValue) => {
                const updatedConfig = { ...config };
                updatedConfig.GlobalDefault = newValue;
                await aptService.addConfig(projectPath, name, updatedConfig);
                await refreshConfig();
              }}
            />
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Project Default */}
          <Box>
            <TreeObjectEditor
              name="ProjectDefault"
              value={config['ProjectDefault'] || {}}
              onChange={async (newValue) => {
                const updatedConfig = { ...config };
                updatedConfig.ProjectDefault = newValue;
                await aptService.addConfig(projectPath, name, updatedConfig);
                await refreshConfig();
              }}
            />
          </Box>
        </Paper>
      </Box>


    </Box>
  );
};

export default ProjectConfigViewer;