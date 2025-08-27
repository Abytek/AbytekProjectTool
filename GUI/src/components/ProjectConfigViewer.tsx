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

interface ProjectConfigViewerProps {
  config: Record<string, any>;
  name: string;
}

const ProjectConfigViewer: React.FC<ProjectConfigViewerProps> = ({ config, name }) => {
  const navigate = useNavigate();

  const handleVisitProject = (path: string) => {
    navigate('/project', { state: { projectPath: path } });
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
              onClick={() => handleVisitProject(value)}
              color="primary"
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }

      // Check if it's a Git URL
      if (value.includes('github.com')) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {value}
            </Typography>
            <IconButton
              size="small"
              component="a"
              href={value}
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
          {Object.entries(config.Dependencies).map(([name, details]: [string, any]) => (
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
                        href={details.GitDetails.RemoteURL}
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
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleVisitProject(details.EntryFile)}
                >
                  Visit Project
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {name} Configuration
      </Typography>
      
      {renderDependencies()}

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <Paper sx={{ p: 2 }}>
          {Object.entries(config)
            .filter(([key]) => key !== 'Dependencies')
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
