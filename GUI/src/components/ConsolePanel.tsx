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
import { Send as SendIcon, Clear as ClearIcon } from '@mui/icons-material';
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
  
  const logViewerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const commandTypes = [
    { value: 'native', label: 'Native CLI' },
    { value: 'apt', label: 'APT' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' }
  ];

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logViewerRef.current) {
      logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
    }
  }, [logs]);

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

  const executeCommand = async () => {
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
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      executeCommand();
    }
  };

  const clearLogs = () => {
    setLogs([]);
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
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Enter ${commandTypes.find(t => t.value === commandType)?.label} command...`}
            disabled={isExecuting}
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
          
          <Tooltip title="Clear logs">
            <IconButton onClick={clearLogs} disabled={logs.length === 0}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Log Viewer */}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Console Output
        </Typography>
        
        <Box
          ref={logViewerRef}
          sx={{
            height: `${consoleHeight}px`,
            overflow: 'auto',
            backgroundColor: '#1e1e1e',
            color: '#f8f9fa',
            fontFamily: 'monospace',
            fontSize: '11px',
            p: 2,
            borderRadius: 1,
            border: '1px solid #333',
            '&::-webkit-scrollbar': {
              width: 8
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#2e2e2e',
              borderRadius: 4
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#555',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: '#666'
              }
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
  );
};

export default ConsolePanel;
