import React, { useState, useEffect, useRef } from 'react';
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
  FullscreenExit as FullscreenExitIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import aptService, { ProjectAction } from '../services/aptService';
import socketService from '../services/socketService';
import ConsolePanel from './ConsolePanel';

interface LogEntry {
  id: string;
  timestamp: Date;
  command: string;
  commandType: string;
  output: string;
  error: boolean;
}

interface ProjectActionsViewerProps {
  projectPath: string;
}

const ProjectActionsViewer: React.FC<ProjectActionsViewerProps> = ({ projectPath }) => {
  const consoleSetLogs = useRef<React.Dispatch<React.SetStateAction<LogEntry[]>> | null>(null);
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
      // Log action start
      if (consoleSetLogs.current) {
        consoleSetLogs.current(prev => [...prev, {
          id: `action-${Date.now()}-start`,
          timestamp: new Date(),
          command: `Running action: ${action.Name}`,
          commandType: 'action',
          output: `🚀 Starting action: ${action.Name}\n📝 Description: ${action.Description}\n📋 Commands: ${action.Commands.length}`,
          error: false
        }]);
      }

      for (const command of action.Commands) {
        // Parse command to determine type (apt commands vs native commands)
        const isAptCommand = command.trim().startsWith('apt ');
        const commandType = isAptCommand ? 'apt' : 'native';
        const actualCommand = isAptCommand ? command.trim().substring(4) : command.trim();

        const sessionId = socketService.generateSessionId();

        // Execute command with real-time Socket.IO
        await new Promise<void>((resolve, reject) => {
          socketService.executeCommand(
            {
              command: actualCommand,
              commandType: commandType,
              projectPath: projectPath,
              sessionId: sessionId
            },
            {
              onStart: (data) => {
                console.log('🚀 Action command started:', data);
                if (consoleSetLogs.current) {
                  consoleSetLogs.current(prev => [...prev, {
                    id: `${sessionId}-start`,
                    timestamp: new Date(),
                    command: data.command,
                    commandType: data.commandType,
                    output: '',
                    error: false
                  }]);
                }
              },
              
              onOutput: (data) => {
                console.log('📝 Action command output:', data);
                if (consoleSetLogs.current) {
                  consoleSetLogs.current(prev => [...prev, {
                    id: `${sessionId}-output-${Date.now()}`,
                    timestamp: new Date(),
                    command: '',
                    commandType: '',
                    output: data.output, // Raw ANSI output - console will handle parsing
                    error: data.error
                  }]);
                }
              },
              
              onComplete: (data) => {
                console.log('✅ Action command completed:', data);
                if (consoleSetLogs.current) {
                  consoleSetLogs.current(prev => [...prev, {
                    id: `${sessionId}-complete`,
                    timestamp: new Date(),
                    command: '',
                    commandType: '',
                    output: `Command completed with exit code: ${data.exitCode}${data.success ? ' (Success)' : ' (Failed)'}`,
                    error: !data.success
                  }]);
                }
                
                if (data.success) {
                  resolve();
                } else {
                  reject(new Error(`Command failed with exit code: ${data.exitCode}`));
                }
              },
              
              onError: (data) => {
                console.error('💥 Action command error:', data);
                if (consoleSetLogs.current) {
                  consoleSetLogs.current(prev => [...prev, {
                    id: `${sessionId}-error`,
                    timestamp: new Date(),
                    command: '',
                    commandType: '',
                    output: `Error: ${data.error}`,
                    error: true
                  }]);
                }
                reject(new Error(data.error));
              }
            }
          ).catch(reject);
        });
      }

      // Log action completion
      if (consoleSetLogs.current) {
        consoleSetLogs.current(prev => [...prev, {
          id: `action-${Date.now()}-complete`,
          timestamp: new Date(),
          command: '',
          commandType: '',
          output: `✅ Action "${action.Name}" completed successfully`,
          error: false
        }]);
      }
    } catch (err) {
      console.error('Error executing action:', err);
      
      // Log action error
      if (consoleSetLogs.current) {
        consoleSetLogs.current(prev => [...prev, {
          id: `action-${Date.now()}-error`,
          timestamp: new Date(),
          command: '',
          commandType: '',
          output: `❌ Action "${action.Name}" failed: ${err}`,
          error: true
        }]);
      }
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
            flexWrap: 'wrap',
            gap: 1,
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
          {actions.map((action) => {
            const isExecuting = executingActions.has(action.Name);
            
            return (
              <Box key={action.Name} sx={{ position: 'relative', display: 'inline-block' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => executeAction(action)}
                  disabled={isExecuting}
                  startIcon={isExecuting ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                  endIcon={
                    <Tooltip 
                      title={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {action.Name}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {action.Description}
                          </Typography>
                          <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Commands:
                          </Typography>
                          {action.Commands.map((command, idx) => (
                            <Typography 
                              key={idx}
                              variant="caption" 
                              sx={{ 
                                fontFamily: 'monospace',
                                display: 'block',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                mb: 0.25,
                                fontSize: '0.7rem'
                              }}
                            >
                              $ {command}
                            </Typography>
                          ))}
                        </Box>
                      }
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Tooltip>
                  }
                  sx={{ 
                    textTransform: 'none',
                    minWidth: 'auto',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    '& .MuiButton-endIcon': {
                      ml: 1,
                      mr: 0
                    }
                  }}
                >
                  {action.Name}
                </Button>
              </Box>
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
           onLogEntry={(setLogs) => {
             // Store the setLogs function for action execution
             consoleSetLogs.current = setLogs;
           }}
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
