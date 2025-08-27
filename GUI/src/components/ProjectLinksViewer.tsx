import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProjectLink } from '../services/aptService';

interface ProjectLinksViewerProps {
  links: ProjectLink[];
}

const ProjectLinksViewer: React.FC<ProjectLinksViewerProps> = ({ links }) => {
  const navigate = useNavigate();

  const handleVisitProject = (path: string) => {
    navigate('/project', { state: { projectPath: path } });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Project Links
      </Typography>
      <Paper>
        <List>
          {links.map((link, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleVisitProject(link.entryFile)}
                >
                  Visit
                </Button>
              }
            >
              <ListItemText
                primary={link.name}
                secondary={`Type: ${link.type} | Path: ${link.path}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ProjectLinksViewer;