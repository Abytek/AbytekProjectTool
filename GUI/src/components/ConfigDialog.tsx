import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert
} from '@mui/material';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, parent: string) => Promise<void>;
  availableConfigs: string[];
  configParents: Record<string, string>;
  initialName?: string;
  initialParent?: string;
  isEdit?: boolean;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  availableConfigs,
  configParents,
  initialName = '',
  initialParent = '',
  isEdit = false
}) => {

  // Check if setting this parent would create a cycle
  const wouldCreateCycle = (configName: string, parentName: string): boolean => {
    if (!parentName) return false;
    
    let currentParent = parentName;
    const visited = new Set<string>();

    while (currentParent) {
      if (currentParent === configName) return true;
      if (visited.has(currentParent)) return true;
      visited.add(currentParent);
      currentParent = configParents[currentParent];
    }

    return false;
  };
  const [name, setName] = useState(initialName);
  const [parent, setParent] = useState(initialParent);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setParent(initialParent);
      setError(null);
    }
  }, [open, initialName, initialParent]);

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);

      if (!name.trim()) {
        throw new Error('Configuration name is required');
      }

      // Parent can be empty/none

      await onSave(name.trim(), parent);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Configuration' : 'Add New Configuration'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Configuration Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            disabled={isEdit}
            margin="normal"
            placeholder="e.g., Development, Production, etc."
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Parent Configuration</InputLabel>
            <Select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              label="Parent Configuration"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableConfigs.map((configName) => (
                <MenuItem 
                  key={configName} 
                  value={configName}
                  disabled={
                    (isEdit && configName === name) || // Prevent self-reference
                    wouldCreateCycle(name || initialName, configName) // Prevent circular dependencies
                  }
                >
                  {configName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;
