import React from 'react';
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
  Link
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Link as LinkIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import aptService from '../services/aptService';

interface ProjectConfigViewerProps {
  config: Record<string, any>;
  name: string;
  onParentClick?: (parentName: string) => void;
}

const ProjectConfigViewer: React.FC<ProjectConfigViewerProps> = ({ config, name, onParentClick }) => {
  const navigate = useNavigate();

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

  const renderDependencies = () => {
    if (!config.Dependencies) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Dependencies
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(config.Dependencies).map(([name, details]: [string, any]) => {
            const githubUrl = details.GitDetails ? parseGitHubUrl(details.GitDetails.RemoteURL) : null;
            
            return (
              <Grid item xs={12} md={6} key={name}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinkIcon color="action" />
                    <Typography variant="subtitle1">{name}</Typography>
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
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">
          {name} Configuration
        </Typography>
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
      </Box>
      
      {renderDependencies()}

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <Paper sx={{ p: 2 }}>
          {Object.entries(config)
            .filter(([key]) => key !== 'Dependencies' && key !== '_parentConfig' && key !== 'Parent')
            .map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  {key}
                </Typography>
                {renderValue(value)}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default ProjectConfigViewer;