import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Chip,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GitHub as GitHubIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ProjectLink } from '../services/aptService';

interface ProjectLinksViewerProps {
  links: ProjectLink[];
}

const ProjectLinksViewer: React.FC<ProjectLinksViewerProps> = ({ links }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleVisitProject = (path: string) => {
    navigate('/project', { state: { projectPath: path } });
  };

  const handleToggleExpand = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const getGitHubInfo = (remoteUrl: string) => {
    try {
      // Handle different GitHub URL formats
      const url = new URL(remoteUrl.replace(/\.git$/, ''));
      if (url.hostname === 'github.com') {
        return {
          isGitHub: true,
          repoUrl: url.href
        };
      }
    } catch {}
    return { isGitHub: false };
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Project Links
      </Typography>
      <Paper>
        <List>
          {links.map((link) => {
            const isExpanded = expandedItems.includes(link.path);
            const gitHubInfo = link.gitDetails ? getGitHubInfo(link.gitDetails.RemoteURL) : null;
            
            return (
              <React.Fragment key={link.path}>
                <ListItem
                  sx={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    {/* Project Name and Type */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      {link.type === 'Git' ? (
                        <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ) : (
                        <FolderIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )}
                      <ListItemText
                        primary={link.name}
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem'
                            }}
                          >
                            {link.path}
                          </Typography>
                        }
                      />
                    </Box>

                    {/* Type Badge */}
                    <Chip
                      label={link.type}
                      size="small"
                      color={link.type === 'Git' ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />

                    {/* Expand/Collapse Button (only for Git projects) */}
                    {link.gitDetails && (
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(link.path)}
                        sx={{ mr: 1 }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}

                    {/* Visit Button */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleVisitProject(link.entryFile)}
                    >
                      Visit
                    </Button>
                  </Box>

                  {/* Git Details */}
                  {link.gitDetails && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
                        {gitHubInfo?.isGitHub && (
                          <Button
                            component="a"
                            href={gitHubInfo.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<GitHubIcon />}
                            size="small"
                            sx={{ mb: 1 }}
                          >
                            View on GitHub
                          </Button>
                        )}
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                          Remote: {link.gitDetails.RemoteURL}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                          Branch: {link.gitDetails.Branch}
                        </Typography>
                        <Tooltip title="Commit Hash" arrow>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            Commit: {link.gitDetails.Commit}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Collapse>
                  )}
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default ProjectLinksViewer;