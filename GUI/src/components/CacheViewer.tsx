import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import aptService from '../services/aptService';

interface CacheViewerProps {
  cache: Record<string, any>;
  onUpdate?: () => void;
}

const CacheViewer: React.FC<CacheViewerProps> = ({ cache, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success'
  });

  const handleEdit = (key: string, value: any) => {
    setSelectedKey(key);
    setEditValue(JSON.stringify(value, null, 2));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const parsedValue = JSON.parse(editValue);
      await aptService.updateCache(selectedKey, parsedValue);
      setDialogOpen(false);
      setSnackbar({ open: true, message: 'Cache updated successfully', type: 'success' });
      if (onUpdate) onUpdate();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to update cache', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await aptService.deleteCache(key);
      setSnackbar({ open: true, message: 'Cache entry deleted successfully', type: 'success' });
      if (onUpdate) onUpdate();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to delete cache entry', 
        type: 'error' 
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cache Contents
      </Typography>
      <Paper sx={{ maxHeight: '400px', overflow: 'auto' }}>
        <List>
          {Object.entries(cache).map(([key, value]) => (
            <ListItem
              key={key}
              secondaryAction={
                <Box>
                  <Tooltip title="Edit">
                    <IconButton edge="end" onClick={() => handleEdit(key, value)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton edge="end" onClick={() => handleDelete(key)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={key}
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: '500px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace'
                    }}
                  >
                    {JSON.stringify(value)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Cache Value</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Key: {selectedKey}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            variant="outlined"
            sx={{ fontFamily: 'monospace' }}
            error={(() => {
              try {
                JSON.parse(editValue);
                return false;
              } catch {
                return true;
              }
            })()}
            helperText={(() => {
              try {
                JSON.parse(editValue);
                return '';
              } catch (e) {
                return 'Invalid JSON format';
              }
            })()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            startIcon={<SaveIcon />} 
            variant="contained"
            disabled={(() => {
              try {
                JSON.parse(editValue);
                return false;
              } catch {
                return true;
              }
            })()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.type}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CacheViewer;