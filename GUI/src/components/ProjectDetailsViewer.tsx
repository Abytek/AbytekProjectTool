import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Info as InfoIcon,
  Extension as ComponentIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { ProjectData } from '../services/aptService';

interface ProjectDetailsViewerProps {
  project: ProjectData;
}

const ProjectDetailsViewer: React.FC<ProjectDetailsViewerProps> = ({ project }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Only show if we have meaningful metadata to display
  const hasMetadata = project.components && project.components.length > 0;
  const hasGitDetails = project.gitDetails;
  const hasTemplateInfo = project.templateInfo;
  const hasPrototypeInfo = project.prototypeInfo;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getGitHubInfo = (remoteUrl?: string) => {
    if (!remoteUrl) return { isGitHub: false };
    
    try {
      // Handle different GitHub URL formats
      let cleanUrl = remoteUrl.replace(/\.git$/, '');
      
      // Convert SSH format to HTTPS for URL parsing
      if (cleanUrl.startsWith('git@github.com:')) {
        cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
      }
      
      const url = new URL(cleanUrl);
      if (url.hostname === 'github.com') {
        return {
          isGitHub: true,
          repoUrl: url.href
        };
      }
    } catch {}
    return { isGitHub: false };
  };

  // Don't render if no metadata
  if (!hasMetadata && !hasGitDetails && !hasTemplateInfo && !hasPrototypeInfo) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon sx={{ mr: 1, color: '#74c0fc' }} />
        <Typography variant="h6" sx={{ color: '#f8f9fa' }}>
          Project Metadata
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Git Details */}
        {hasGitDetails && project.gitDetails && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GitHubIcon sx={{ mr: 1, color: '#ffffff' }} />
                <Typography variant="subtitle1" sx={{ color: '#f8f9fa', fontWeight: 600 }}>
                  Git Repository
                </Typography>
              </Box>
              {(() => {
                const gitHubInfo = getGitHubInfo(project.gitDetails?.remoteUrl);
                return gitHubInfo.isGitHub ? (
                  <Button
                    component="a"
                    href={gitHubInfo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                    size="small"
                    sx={{
                      color: '#74c0fc',
                      borderColor: '#74c0fc',
                      '&:hover': {
                        backgroundColor: 'rgba(116, 192, 252, 0.1)',
                        borderColor: '#74c0fc'
                      }
                    }}
                    variant="outlined"
                  >
                    View on GitHub
                  </Button>
                ) : null;
              })()}
            </Box>
            <List dense>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 80, color: '#ffffff', fontWeight: 500 }}>
                        Remote:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        onClick={() => copyToClipboard(project.gitDetails?.remoteUrl || '', 'Remote URL')}
                        sx={{ 
                          fontFamily: 'monospace', 
                          color: '#e5e5e5',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {project.gitDetails.remoteUrl}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {project.gitDetails.branch && (
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText
                    primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 80, color: '#ffffff', fontWeight: 500 }}>
                        Branch:
                      </Typography>
                      <Chip 
                        label={project.gitDetails.branch} 
                        size="small" 
                        onClick={() => copyToClipboard(project.gitDetails?.branch || '', 'Branch')}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#cccccc',
                          border: '1px solid #666666',
                          fontWeight: 600,
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            borderColor: '#888888'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        variant="outlined"
                      />
                    </Box>
                    }
                  />
                </ListItem>
              )}
              {project.gitDetails.commit && (
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText
                    primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 80, color: '#ffffff', fontWeight: 500 }}>
                        Commit:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        onClick={() => copyToClipboard(project.gitDetails?.commit || '', 'Commit Hash')}
                        sx={{ 
                          fontFamily: 'monospace',
                          color: '#e5e5e5',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {project.gitDetails.commit.substring(0, 8)}...
                      </Typography>
                    </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Grid>
        )}

        {/* Template/Prototype Information */}
        {(hasTemplateInfo || hasPrototypeInfo) && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinkIcon sx={{ mr: 1, color: '#40e0d0' }} />
              <Typography variant="subtitle1" sx={{ color: '#f8f9fa', fontWeight: 600 }}>
                Template Configuration
              </Typography>
            </Box>
            <List dense>
              {project.templateInfo && (
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 80, color: '#8be9fd', fontWeight: 500 }}>
                          Template:
                        </Typography>
                        <Chip 
                          label={project.templateInfo} 
                          size="small" 
                          sx={{
                            backgroundColor: 'rgba(116, 192, 252, 0.2)',
                            color: '#74c0fc',
                            border: '1px solid #74c0fc',
                            fontWeight: 600
                          }}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              )}
              {project.prototypeInfo && (
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 80, color: '#8be9fd', fontWeight: 500 }}>
                          Prototype:
                        </Typography>
                        <Chip 
                          label={project.prototypeInfo} 
                          size="small" 
                          sx={{
                            backgroundColor: 'rgba(116, 192, 252, 0.2)',
                            color: '#74c0fc',
                            border: '1px solid #74c0fc',
                            fontWeight: 600
                          }}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Grid>
        )}

        {/* Components */}
        {hasMetadata && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ComponentIcon sx={{ mr: 1, color: '#007fff' }} />
              <Typography variant="subtitle1" sx={{ color: '#f8f9fa', fontWeight: 600 }}>
                Project Components ({project.components!.length})
              </Typography>
            </Box>
            <List dense>
              {project.components!.map((component, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={component.type} 
                          size="small" 
                          sx={{
                            backgroundColor: 'rgba(0, 127, 255, 0.2)',
                            color: '#007fff',
                            border: '1px solid #007fff',
                            fontWeight: 600
                          }}
                          variant="outlined"
                          icon={<SettingsIcon sx={{ color: '#007fff' }} />}
                        />
                        {component.data && typeof component.data === 'object' && (
                          <Typography variant="body2" sx={{ color: '#8be9fd' }}>
                            {Object.keys(component.data).length} properties
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={component.data && typeof component.data === 'string' ? component.data : undefined}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={`${copiedText} copied to clipboard!`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default ProjectDetailsViewer;
