import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send as SendIcon, Clear as ClearIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import aptService from '../services/aptService';
// @ts-ignore - no types available for ansi-to-html
import Convert from 'ansi-to-html';

interface LogEntry {
  id: string;
  timestamp: Date;
  command: string;
  commandType: string;
  output: string;
  error: boolean;
}

interface ConsolePanelProps {
  projectPath: string;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ projectPath }) => {
  const [commandType, setCommandType] = useState<string>('apt');
  const [command, setCommand] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [consoleHeight, setConsoleHeight] = useState<number>(400); // Fixed height for console output
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [shouldRefocus, setShouldRefocus] = useState<boolean>(false);
  
  const logViewerRef = useRef<HTMLDivElement>(null);
  const logViewerMaximizedRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const commandInputMaximizedRef = useRef<HTMLInputElement>(null);

  const commandTypes = [
    { value: 'native', label: 'Native CLI' },
    { value: 'apt', label: 'APT' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' }
  ];

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    const currentRef = isMaximized ? logViewerMaximizedRef.current : logViewerRef.current;
    if (currentRef) {
      // Delay scroll to avoid interfering with focus restoration
      setTimeout(() => {
        if (currentRef) {
          currentRef.scrollTop = currentRef.scrollHeight;
        }
      }, shouldRefocus ? 200 : 0); // Longer delay when refocusing
    }
  }, [logs, isMaximized, shouldRefocus]);

  // Handle refocusing after command execution
  useEffect(() => {
    if (shouldRefocus) {
      const inputRef = isMaximized ? commandInputMaximizedRef.current : commandInputRef.current;
      if (inputRef) {
        // Get the native input element
        const nativeInput = inputRef.querySelector('input') as HTMLInputElement;
        
        const attemptFocus = () => {
          if (nativeInput) {
            // Use native focus methods
            nativeInput.focus();
            nativeInput.setSelectionRange(nativeInput.value.length, nativeInput.value.length);
          }
          // Also try the MUI ref focus
          inputRef.focus();
        };
        
        // Multiple attempts with different timings
        requestAnimationFrame(() => {
          attemptFocus();
          setTimeout(attemptFocus, 0);
          setTimeout(attemptFocus, 50);
          setTimeout(attemptFocus, 150);
        });
      }
      setShouldRefocus(false);
    }
  }, [shouldRefocus, isMaximized]);

  // Handle console resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const logViewerRect = logViewerRef.current?.getBoundingClientRect();
    if (!logViewerRect) return;
    
    // Calculate new height based on mouse position relative to the top of the log viewer
    const newHeight = Math.max(200, Math.min(800, e.clientY - logViewerRect.top));
    setConsoleHeight(newHeight);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const addLog = (command: string, commandType: string, output: string, error: boolean = false) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      command,
      commandType,
      output,
      error
    };
    setLogs(prev => [...prev, newLog]);
  };

  const executeCommand = async (): Promise<void> => {
    if (!projectPath) return;
    
    setIsExecuting(true);
    const currentCommand = command;
    const currentCommandType = commandType;
    
    // Add command to log immediately - just show the command
    const displayCommand = currentCommand.trim() || '';
    addLog(displayCommand, currentCommandType, '', false);
    
    try {
      const result = await aptService.executeCommand({
        command: currentCommand,
        commandType: currentCommandType,
        projectPath: projectPath
      });
      
      // Add output as a separate log entry without metadata
      if (result.output) {
        addLog('', '', result.output, false);
      }
    } catch (error: any) {
      let errorMessage = 'Command execution failed';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.output) {
        errorMessage = error.response.data.output;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add error as a separate log entry without metadata
      addLog('', '', errorMessage, true);
    }
    
    setIsExecuting(false);
    setCommand(''); // Clear input after execution
    setShouldRefocus(true); // Trigger refocus
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      executeCommand();
    }
  };

  // Handle input blur to refocus immediately
  const handleInputBlur = (event: React.FocusEvent) => {
    // Only refocus if we're not executing and the blur wasn't caused by clicking elsewhere intentionally
    if (!isExecuting) {
      setTimeout(() => {
        const target = event.target as HTMLInputElement;
        if (target && document.activeElement !== target) {
          target.focus();
        }
      }, 10);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  // Handle console panel click to ensure focus
  const handleConsoleClick = (ref: React.RefObject<HTMLDivElement>) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (ref.current) {
      ref.current.focus();
    }
  };

  // Handle mouse enter to focus console for better scroll behavior
  const handleConsoleMouseEnter = (ref: React.RefObject<HTMLDivElement>) => () => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  // Create ANSI to HTML converter with proper terminal colors
  const ansiConverter = new Convert({
    fg: '#f8f8f2',
    bg: '#1e1e1e',
    newline: false,
    escapeXML: false,
    colors: {
      0: '#1e1e1e',   // black
      1: '#cd3131',   // red  
      2: '#16c60c',   // green
      3: '#c19c00',   // yellow
      4: '#2472c8',   // blue
      5: '#bc3fbc',   // magenta
      6: '#61d6d6',   // cyan
      7: '#e5e5e5',   // white
      8: '#666666',   // bright black (gray)
      9: '#ff6e6e',   // bright red
      10: '#69ff94',  // bright green
      11: '#ffffa5',  // bright yellow
      12: '#d6acff',  // bright blue
      13: '#ff92df',  // bright magenta
      14: '#a4ffff',  // bright cyan
      15: '#ffffff',  // bright white
    }
  });

  const parseColoredOutput = (output: string) => {
    // Use the ansi-to-html library for proper ANSI parsing
    return ansiConverter.toHtml(output);
  };

  return (
    <>
      {/* Normal Console Layout */}
      {!isMaximized && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Command Bar */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Command Type</InputLabel>
                <Select
                  value={commandType}
                  onChange={(e) => setCommandType(e.target.value)}
                  label="Command Type"
                >
                  {commandTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                ref={commandInputRef}
                fullWidth
                size="small"
                label="Command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                placeholder={`Enter ${commandTypes.find(t => t.value === commandType)?.label} command...`}
                disabled={isExecuting}
                inputProps={{
                  autoComplete: 'off',
                  spellCheck: false
                }}
              />
              
              <Button
                variant="contained"
                onClick={executeCommand}
                disabled={isExecuting || !projectPath}
                startIcon={<SendIcon />}
                sx={{ 
                  minWidth: 120,
                  height: 40,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: isExecuting 
                    ? 'linear-gradient(45deg, #666 30%, #888 90%)' 
                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: isExecuting
                    ? '0 2px 4px rgba(0,0,0,0.2)'
                    : '0 3px 8px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: isExecuting
                      ? 'linear-gradient(45deg, #666 30%, #888 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    boxShadow: isExecuting
                      ? '0 2px 4px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(33, 150, 243, 0.4)',
                    transform: isExecuting ? 'none' : 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: isExecuting ? 'none' : 'translateY(0px)',
                    boxShadow: isExecuting
                      ? '0 2px 4px rgba(0,0,0,0.2)'
                      : '0 2px 6px rgba(33, 150, 243, 0.3)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #666 30%, #888 90%)',
                    color: '#bbb',
                    boxShadow: 'none'
                  }
                }}
              >
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>
              
              <Tooltip title="Maximize console">
                <IconButton onClick={toggleMaximize}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Clear logs">
                <IconButton onClick={clearLogs} disabled={logs.length === 0}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Log Viewer */}
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Console Output
            </Typography>
            
            <Box
              ref={logViewerRef}
              tabIndex={0}
              onClick={handleConsoleClick(logViewerRef)}
              onMouseEnter={handleConsoleMouseEnter(logViewerRef)}
              sx={{
                height: `${consoleHeight}px`,
                minHeight: `${consoleHeight}px`,
                maxHeight: `${consoleHeight}px`,
                overflow: 'hidden',
                overflowX: 'auto',
                overflowY: 'scroll',
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#666 #1a1a1a', // For Firefox
                backgroundColor: '#1e1e1e',
                color: '#f8f9fa',
                fontFamily: 'monospace',
                fontSize: '11px',
                p: 2,
                borderRadius: 1,
                border: '1px solid #333',
                cursor: 'text',
                position: 'relative',
                boxSizing: 'border-box',
                '&:focus': {
                  outline: '2px solid #2196F3',
                  outlineOffset: -1,
                },
                '&:hover': {
                  borderColor: '#555',
                },
                '&::-webkit-scrollbar': {
                  width: 12,
                  height: 12
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#1a1a1a',
                  borderRadius: 6,
                  border: '1px solid #333'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#666',
                  borderRadius: 6,
                  border: '1px solid #444',
                  '&:hover': {
                    backgroundColor: '#777'
                  },
                  '&:active': {
                    backgroundColor: '#888'
                  }
                },
                '&::-webkit-scrollbar-corner': {
                  backgroundColor: '#1a1a1a'
                },
                '& .log-entry': {
                  mb: 0.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.2
                },
                '& .log-header': {
                  color: '#74c0fc',
                  fontSize: '10px',
                  opacity: 0.8
                },
                '& .log-command': {
                  color: '#ffd43b',
                  fontWeight: 'bold'
                },
                '& .log-output': {
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                },
                '& .log-error': {
                  color: '#ff6b6b'
                }
              }}
            >
              {logs.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#adb5bd', fontStyle: 'italic' }}>
                  No commands executed yet. Enter a command above and press Execute or Enter.
                </Typography>
              ) : (
                logs.map((log) => (
                  <Box key={log.id} className="log-entry">
                    {log.command || log.commandType ? (
                      // Command entry: show $ command
                      <div className="log-command">
                        {log.command ? `$ ${log.command}` : '$'}
                      </div>
                    ) : (
                      // Output entry: just show the output
                      <div 
                        className={`log-output ${log.error ? 'log-error' : ''}`}
                        dangerouslySetInnerHTML={{ 
                          __html: parseColoredOutput(log.output) 
                        }}
                      />
                    )}
                  </Box>
                ))
              )}
            </Box>
            
            {/* Resizer - at the bottom */}
            <Box
              ref={resizerRef}
              onMouseDown={handleMouseDown}
              sx={{
                height: 4,
                backgroundColor: isResizing ? '#2196F3' : '#444',
                cursor: 'ns-resize',
                borderRadius: 2,
                mt: 1,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: '#2196F3'
                }
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Full-Screen Maximized Console */}
      {isMaximized && (
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
          }}
        >
          {/* Full-screen Command Bar */}
          <Paper sx={{ p: 2, m: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Command Type</InputLabel>
                <Select
                  value={commandType}
                  onChange={(e) => setCommandType(e.target.value)}
                  label="Command Type"
                >
                  {commandTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                ref={commandInputMaximizedRef}
                fullWidth
                size="small"
                label="Command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                placeholder={`Enter ${commandTypes.find(t => t.value === commandType)?.label} command...`}
                disabled={isExecuting}
                inputProps={{
                  autoComplete: 'off',
                  spellCheck: false
                }}
              />
              
              <Button
                variant="contained"
                onClick={executeCommand}
                disabled={isExecuting || !projectPath}
                startIcon={<SendIcon />}
                sx={{ 
                  minWidth: 120,
                  height: 40,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: isExecuting 
                    ? 'linear-gradient(45deg, #666 30%, #888 90%)' 
                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: isExecuting
                    ? '0 2px 4px rgba(0,0,0,0.2)'
                    : '0 3px 8px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: isExecuting
                      ? 'linear-gradient(45deg, #666 30%, #888 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    boxShadow: isExecuting
                      ? '0 2px 4px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(33, 150, 243, 0.4)',
                    transform: isExecuting ? 'none' : 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: isExecuting ? 'none' : 'translateY(0px)',
                    boxShadow: isExecuting
                      ? '0 2px 4px rgba(0,0,0,0.2)'
                      : '0 2px 6px rgba(33, 150, 243, 0.3)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #666 30%, #888 90%)',
                    color: '#bbb',
                    boxShadow: 'none'
                  }
                }}
              >
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>
              
              <Tooltip title="Minimize console">
                <IconButton onClick={toggleMaximize}>
                  <FullscreenExitIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Clear logs">
                <IconButton onClick={clearLogs} disabled={logs.length === 0}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Full-screen Log Viewer */}
          <Paper sx={{ mx: 2, mb: 2, flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Console Output - Full Screen
              </Typography>
            </Box>
            
            <Box
              ref={logViewerMaximizedRef}
              tabIndex={0}
              onClick={handleConsoleClick(logViewerMaximizedRef)}
              onMouseEnter={handleConsoleMouseEnter(logViewerMaximizedRef)}
              sx={{
                flex: 1,
                minHeight: 0, // Important for flex containers
                maxHeight: '100%', 
                overflow: 'hidden',
                overflowX: 'auto',
                overflowY: 'scroll',
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#666 #1a1a1a', // For Firefox
                backgroundColor: '#1e1e1e',
                color: '#f8f9fa',
                fontFamily: 'monospace',
                fontSize: '12px',
                p: 2,
                cursor: 'text',
                position: 'relative',
                boxSizing: 'border-box',
                '&:focus': {
                  outline: '2px solid #2196F3',
                  outlineOffset: -1,
                },
                '&:hover': {
                  borderColor: '#555',
                },
                '&::-webkit-scrollbar': {
                  width: 12,
                  height: 12
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#1a1a1a',
                  borderRadius: 6,
                  border: '1px solid #333'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#666',
                  borderRadius: 6,
                  border: '1px solid #444',
                  '&:hover': {
                    backgroundColor: '#777'
                  },
                  '&:active': {
                    backgroundColor: '#888'
                  }
                },
                '&::-webkit-scrollbar-corner': {
                  backgroundColor: '#1a1a1a'
                },
                '& .log-entry': {
                  mb: 0.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.3
                },
                '& .log-header': {
                  color: '#74c0fc',
                  fontSize: '11px',
                  opacity: 0.8
                },
                '& .log-command': {
                  color: '#ffd43b',
                  fontWeight: 'bold'
                },
                '& .log-output': {
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                },
                '& .log-error': {
                  color: '#ff6b6b'
                }
              }}
            >
              {logs.length === 0 ? (
                <Typography variant="body1" sx={{ color: '#adb5bd', fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                  No commands executed yet. Enter a command above and press Execute or Enter.
                </Typography>
              ) : (
                logs.map((log) => (
                  <Box key={log.id} className="log-entry">
                    {log.command || log.commandType ? (
                      // Command entry: show $ command
                      <div className="log-command">
                        {log.command ? `$ ${log.command}` : '$'}
                      </div>
                    ) : (
                      // Output entry: just show the output
                      <div 
                        className={`log-output ${log.error ? 'log-error' : ''}`}
                        dangerouslySetInnerHTML={{ 
                          __html: parseColoredOutput(log.output) 
                        }}
                      />
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default ConsolePanel;
