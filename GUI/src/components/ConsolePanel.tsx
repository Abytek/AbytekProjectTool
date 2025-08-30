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
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  showMaximizeButton?: boolean;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ 
  projectPath, 
  isMaximized = false, 
  onToggleMaximize, 
  showMaximizeButton = true 
}) => {
  console.log('🎯 ConsolePanel rendered with props:', { 
    projectPath, 
    isMaximized, 
    hasOnToggleMaximize: !!onToggleMaximize, 
    showMaximizeButton 
  });
  const [commandType, setCommandType] = useState<string>('apt');
  const [command, setCommand] = useState<string>('');
  
  // Add debugging for state changes
  useEffect(() => {
    console.log('🔄 Command state changed to:', `"${command}"`);
  }, [command]);
  
  console.log('🎯 Current command state:', `"${command}"`);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [consoleHeight, setConsoleHeight] = useState<number>(400); // Fixed height for console output
  const [isResizing, setIsResizing] = useState<boolean>(false);

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
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = resizerRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const newHeight = Math.max(200, Math.min(800, e.clientY - rect.top - 100));
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const parseColoredOutput = (output: string) => {
    try {
      const convert = new Convert({
        fg: '#f0f0f0',
        bg: 'transparent',
        newline: true,
        escapeXML: true
      });
      return convert.toHtml(output);
    } catch (error) {
      console.error('Error parsing ANSI colors:', error);
      return output.replace(/\u001b\[[0-9;]*m/g, '');
    }
  };

  const executeCommand = async () => {
    console.log('🚀 executeCommand called', { command: command, projectPath, isExecuting });
    
    if (!projectPath || isExecuting) {
      console.log('❌ executeCommand early return:', { 
        hasProjectPath: !!projectPath, 
        isExecuting 
      });
      return;
    }

    console.log('✅ Proceeding with command execution');
    setShouldRefocus(true);
    setIsExecuting(true);

    const commandId = `${Date.now()}-${Math.random()}`;
    
    // Add command entry to logs
    const commandEntry: LogEntry = {
      id: commandId,
      timestamp: new Date(),
      command: command,
      commandType: commandType,
      output: '',
      error: false
    };
    
    console.log('📝 Adding command entry to logs:', commandEntry);
    setLogs(prev => [...prev, commandEntry]);
    
    try {
      console.log('🌐 Calling aptService.executeCommand with:', {
        command: command.trim(),
        commandType: commandType,
        projectPath: projectPath
      });
      
      const response = await aptService.executeCommand({
        command: command,
        commandType: commandType,
        projectPath: projectPath
      });

      console.log('📥 Response received:', response);

      // Add output entry
      if (response.output || response.error) {
        const outputEntry: LogEntry = {
          id: `${commandId}-output`,
          timestamp: new Date(),
          command: '',
          commandType: '',
          output: response.error || response.output,
          error: !!response.error
        };
        console.log('📝 Adding output entry to logs:', outputEntry);
        setLogs(prev => [...prev, outputEntry]);
      } else {
        console.log('⚠️ No output or error in response');
      }
    } catch (error: any) {
      console.error('❌ Command execution error:', error);
      const errorEntry: LogEntry = {
        id: `${commandId}-error`,
        timestamp: new Date(),
        command: '',
        commandType: '',
        output: error.response?.data?.error || error.message || 'Command execution failed',
        error: true
      };
      console.log('📝 Adding error entry to logs:', errorEntry);
      setLogs(prev => [...prev, errorEntry]);
    } finally {
      setIsExecuting(false);
      setCommand('');
      
      // Set flag to refocus after a short delay
      setTimeout(() => {
        setShouldRefocus(true);
      }, 100);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', event.key, 'Current command:', command);
    if (event.key === 'Enter' && !isExecuting) {
      console.log('🚀 Enter key - executing command');
      executeCommand();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleMaximize = () => {
    if (onToggleMaximize) {
      onToggleMaximize();
    }
  };

  // Handle console panel click to ensure focus
  const handleConsoleClick = (ref: React.RefObject<HTMLDivElement>) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (ref.current) {
      ref.current.focus();
    }
  };

  // Handle console panel mouse enter to ensure focus
  const handleConsoleMouseEnter = (ref: React.RefObject<HTMLDivElement>) => (event: React.MouseEvent) => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Immediately refocus if input loses focus (prevents losing focus during command execution)
    setTimeout(() => {
      if (event.target) {
        event.target.focus();
      }
    }, 0);
  };

  return (
    <>
      {/* Normal Console Layout */}
      {(
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
                fullWidth
                size="small"
                label="Command"
                value={command}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('📝 TextField onChange fired! Value:', newValue);
                  setCommand(newValue);
                }}
                onFocus={() => console.log('🎯 TextField focused')}
                onBlur={() => console.log('🎯 TextField blurred')}
                onClick={() => console.log('🖱️ TextField clicked')}
                onInput={(e) => console.log('⌨️ TextField onInput:', (e.target as HTMLInputElement).value)}
                onKeyPress={handleKeyPress}
                onKeyDown={(e) => console.log('⌨️ KeyDown:', e.key)}
                placeholder={`Enter ${commandTypes.find(t => t.value === commandType)?.label} command...`}
                disabled={isExecuting}
                inputProps={{
                  autoComplete: 'off',
                  spellCheck: false,
                  onChange: (e: any) => console.log('🔧 Native onChange:', e.target.value)
                }}
              />
              
              <Button
                variant="contained"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('🖱️ Execute button clicked!', { command, projectPath, isExecuting });
                  executeCommand();
                }}
                disabled={isExecuting || !projectPath}
                style={{ 
                  opacity: (isExecuting || !projectPath) ? 0.5 : 1,
                  pointerEvents: (isExecuting || !projectPath) ? 'none' : 'auto',
                  backgroundColor: (isExecuting || !projectPath) ? '#ccc' : undefined
                }}
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
                }}
              >
                {isExecuting ? 'Running...' : !projectPath ? 'No Project' : 'Execute'}
              </Button>
              
              {showMaximizeButton && (
                <Tooltip title="Maximize console">
                  <IconButton onClick={toggleMaximize}>
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Clear logs">
                <IconButton onClick={clearLogs} disabled={logs.length === 0}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Log Viewer */}
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            backgroundColor: isMaximized ? '#1a1a1a' : 'inherit',
            color: isMaximized ? '#fff' : 'inherit'
          }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: isMaximized ? '#fff' : 'inherit' }}>
              {isMaximized ? 'Console Output - Full Screen' : 'Console Output'}
            </Typography>
            
            <Box
              ref={isMaximized ? logViewerMaximizedRef : logViewerRef}
              tabIndex={0}
              onClick={handleConsoleClick(isMaximized ? logViewerMaximizedRef : logViewerRef)}
              onMouseEnter={handleConsoleMouseEnter(isMaximized ? logViewerMaximizedRef : logViewerRef)}
              sx={{
                height: `${consoleHeight}px`,
                minHeight: isMaximized ? '100%' : `${consoleHeight}px`,
                maxHeight: isMaximized ? '100%' : `${consoleHeight}px`,
                overflow: 'hidden',
                overflowX: 'auto',
                overflowY: 'scroll',
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#666 #1a1a1a', // For Firefox
                backgroundColor: '#1e1e1e',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '14px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                p: 2,
                boxSizing: 'border-box',
                position: 'relative',
                outline: 'none',
                '&:focus': {
                  outline: '2px solid #2196F3',
                  outlineOffset: '-2px'
                },
                // Scrollbar styling
                '::-webkit-scrollbar': {
                  width: '12px',
                  height: '12px'
                },
                '::-webkit-scrollbar-track': {
                  background: '#2b2b2b',
                  borderRadius: '10px',
                  border: '1px solid #1e1e1e'
                },
                '::-webkit-scrollbar-thumb': {
                  background: '#555',
                  borderRadius: '10px',
                  border: '2px solid #2b2b2b',
                  '&:hover': {
                    background: '#777'
                  },
                  '&:active': {
                    background: '#999'
                  }
                },
                '::-webkit-scrollbar-corner': {
                  background: '#2b2b2b'
                },
                // Log styling
                '& .log-entry': {
                  marginBottom: '8px',
                  '&:last-child': {
                    marginBottom: 0
                  }
                },
                '& .log-command': {
                  color: '#4CAF50',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  userSelect: 'text'
                },
                '& .log-output': {
                  color: '#f0f0f0',
                  paddingLeft: '8px',
                  userSelect: 'text',
                  '& pre': {
                    margin: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }
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
                logs.map((log) => {
                  console.log('📊 Rendering log:', log);
                  return (
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
                  );
                })
              )}
            </Box>
          </Paper>

          {/* Console Resizer - only show in normal mode */}
          {!isMaximized && (
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
          )}
        </Box>
      )}

    </>
  );
};

export default ConsolePanel;
