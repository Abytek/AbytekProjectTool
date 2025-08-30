import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import aptService, { ProjectAction } from '../services/aptService';
import ConsolePanel from './ConsolePanel';

interface ProjectActionsViewerProps {
  projectPath: string;
}

const ProjectActionsViewer: React.FC<ProjectActionsViewerProps> = ({ projectPath }) => {
  const [actions, setActions] = useState<ProjectAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());
  const [actionResults, setActionResults] = useState<Map<string, { success: boolean; output: string }>>(new Map());
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    loadActions();
  }, [projectPath]);

  const loadActions = async () => {
    if (!projectPath) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await aptService.getProjectActions(projectPath);
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project actions');
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: ProjectAction) => {
    if (!projectPath) return;

    const actionKey = action.Name;
    setExecutingActions(prev => new Set(prev).add(actionKey));

    try {
      for (const command of action.Commands) {
        // Parse command to determine type (apt commands vs native commands)
        const isAptCommand = command.trim().startsWith('apt ');
        const commandType = isAptCommand ? 'apt' : 'native';
        const actualCommand = isAptCommand ? command.trim().substring(4) : command.trim();

        await aptService.executeCommand({
          command: actualCommand,
          commandType: commandType,
          projectPath: projectPath
        });
      }
    } catch (err) {
      console.error('Error executing action:', err);
      // Note: We're not showing error UI here since the console will show the output
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  const getStatusIcon = (actionName: string) => {
    if (executingActions.has(actionName)) {
      return <CircularProgress size={20} />;
    }
    
    const result = actionResults.get(actionName);
    if (result) {
      return result.success 
        ? <CheckCircleIcon color="success" /> 
        : <ErrorIcon color="error" />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading project actions...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={loadActions} variant="outlined">
          Retry
        </Button>
      </Paper>
    );
  }

  const renderContent = () => (
    <>
      {/* Header - Always visible */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        flexShrink: 0, // Prevent header from shrinking
        backgroundColor: isMaximized ? '#0a0a0a' : 'transparent',
        position: isMaximized ? 'sticky' : 'static',
        top: isMaximized ? 0 : 'auto',
        zIndex: isMaximized ? 1000 : 'auto',
        py: isMaximized ? 1 : 0
      }}>
        <TerminalIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: isMaximized ? '#fff' : 'inherit' }}>
          Project Actions & Console
        </Typography>
        <Chip 
          label={`${actions.length} action${actions.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{ ml: 2 }}
          color="primary"
          variant="outlined"
        />
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title={isMaximized ? "Minimize panel" : "Maximize panel"}>
            <IconButton onClick={toggleMaximize} sx={{ color: isMaximized ? '#fff' : 'inherit' }}>
              {isMaximized ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Actions Section */}
      <Box sx={{ 
        flexShrink: 0, // Don't let actions section shrink
        maxHeight: isMaximized ? '30vh' : 'none',
        mb: 2
      }}>
        {actions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color={isMaximized ? '#ccc' : 'text.secondary'} sx={{ mb: 2 }}>
              No actions available for this project
            </Typography>
            <Typography variant="body2" color={isMaximized ? '#aaa' : 'text.secondary'}>
              Actions are automatically generated when the project is imported through APT
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            maxHeight: isMaximized ? '25vh' : 'none', 
            overflow: isMaximized ? 'auto' : 'visible',
            ...(isMaximized && {
              '::-webkit-scrollbar': {
                width: '8px',
              },
              '::-webkit-scrollbar-track': {
                backgroundColor: '#2b2b2b',
              },
              '::-webkit-scrollbar-thumb': {
                backgroundColor: '#555',
                borderRadius: '4px',
              },
              '::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#777',
              },
            })
          }}>
          {actions.map((action, index) => {
            const isExecuting = executingActions.has(action.Name);
            
            return (
              <Accordion key={action.Name} defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {action.Name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.Description}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion toggle
                        executeAction(action);
                      }}
                      disabled={isExecuting}
                      startIcon={isExecuting ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                      sx={{ ml: 2 }}
                    >
                      {isExecuting ? 'Executing...' : 'Run'}
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CodeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Commands to execute:
                      </Typography>
                    </Box>
                    <List dense disablePadding>
                      {action.Commands.map((command, cmdIndex) => (
                        <ListItem key={cmdIndex} sx={{ pl: 0 }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.8125rem'
                                }}
                              >
                                $ {command}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    {action.Commands.length > 1 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Commands will be executed sequentially in the order shown above.
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
          </Box>
        )}
      </Box>

      {/* Integrated Console */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0, // Allow flex child to shrink
        height: isMaximized ? 'calc(70vh - 100px)' : 'auto' // Give console most of the space in maximized mode
      }}>
        <ConsolePanel 
          projectPath={projectPath} 
          isMaximized={isMaximized}
          onToggleMaximize={toggleMaximize}
          showMaximizeButton={false}
        />
      </Box>
    </>
  );

  if (isMaximized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0a0a0a',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'auto', // Allow scrolling if needed
          color: '#fff' // White text for dark background
        }}
      >
        {renderContent()}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {renderContent()}
    </Paper>
  );
};

export default ProjectActionsViewer;
