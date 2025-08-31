import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  Collapse,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { DependencyDetails, ProjectLink } from '../services/aptService';

interface DependencyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, details: DependencyDetails) => Promise<void>;
  projectLinks: ProjectLink[];
  initialName?: string;
  initialDetails?: DependencyDetails;
  isEdit?: boolean;
}

const DependencyDialog: React.FC<DependencyDialogProps> = ({
  open,
  onClose,
  onSave,
  projectLinks,
  initialName = '',
  initialDetails = {},
  isEdit = false
}) => {
  const [name, setName] = useState(initialName);
  const [isGitDependency, setIsGitDependency] = useState(!!initialDetails.GitDetails);
  const [gitUrl, setGitUrl] = useState(initialDetails.GitDetails?.RemoteURL || '');
  const [gitBranch, setGitBranch] = useState(initialDetails.GitDetails?.Branch || '');
  const [gitCommit, setGitCommit] = useState(initialDetails.GitDetails?.Commit || '');
  const [entryDirectory, setEntryDirectory] = useState(initialDetails.EntryDirectory || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!!initialDetails.GitDetails?.Commit);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setIsGitDependency(!!initialDetails.GitDetails);
      setGitUrl(initialDetails.GitDetails?.RemoteURL || '');
      setGitBranch(initialDetails.GitDetails?.Branch || '');
      setGitCommit(initialDetails.GitDetails?.Commit || '');
      setEntryDirectory(initialDetails.EntryDirectory || '');
      setShowAdvanced(!!initialDetails.GitDetails?.Commit);
      setError(null);
    }
  }, [open, initialName, initialDetails]);

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);

      // Validate inputs
      const details: DependencyDetails = isGitDependency
        ? {
            GitDetails: {
              RemoteURL: gitUrl.trim(),
              ...(gitBranch.trim() && { Branch: gitBranch.trim() }),
              ...(gitCommit.trim() && { Commit: gitCommit.trim() })
            }
          }
        : {
            EntryDirectory: entryDirectory.trim()
          };

      await onSave(name.trim(), details);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearField = (setter: React.Dispatch<React.SetStateAction<string>>) => () => {
    setter('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Dependency' : 'Add Dependency'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Dependency Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth

            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Import from Project Link</InputLabel>
            <Select
              value=""
              onChange={(e) => {
                const selectedLink = projectLinks.find(link => link.path === e.target.value);
                if (selectedLink) {
                  if (selectedLink.gitDetails) {
                    setIsGitDependency(true);
                    setGitUrl(selectedLink.gitDetails.RemoteURL);
                    setGitBranch(selectedLink.gitDetails.Branch || '');
                    setGitCommit(selectedLink.gitDetails.Commit || '');
                  } else {
                    setIsGitDependency(false);
                    setEntryDirectory(selectedLink.entryDirectory);
                  }
                }
              }}

              label="Import from Project Link"
            >
              <MenuItem value="">
                <em>Custom Settings</em>
              </MenuItem>
              {projectLinks.map((link) => (
                <MenuItem key={link.path} value={link.path}>
                  <Box>
                    <Typography variant="subtitle2">{link.name}</Typography>
                    {link.gitDetails ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <GitHubIcon fontSize="small" color="action" />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {link.gitDetails.RemoteURL}
                          {link.gitDetails.Branch && ` (${link.gitDetails.Branch})`}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                        {link.entryDirectory}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isGitDependency}
                onChange={(e) => setIsGitDependency(e.target.checked)}
              />
            }
            label="Git Dependency"
            sx={{ mb: 2 }}
          />
          {isGitDependency ? (
            <>
              <TextField
                label="Git URL"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., git@github.com:username/repo.git"
                required
              />
              <TextField
                label="Branch"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., main (leave empty for default branch)"
                InputProps={{
                  endAdornment: gitBranch && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear branch"
                        onClick={handleClearField(setGitBranch)}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                <Button
                  size="small"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  Advanced Options
                </Button>
              </Box>
              <Collapse in={showAdvanced}>
                <TextField
                  label="Commit Hash"
                  value={gitCommit}
                  onChange={(e) => setGitCommit(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Optional: Specific commit hash"
                  InputProps={{
                    endAdornment: gitCommit && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear commit"
                          onClick={handleClearField(setGitCommit)}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  If a commit hash is specified, it will override the branch selection
                </Typography>
              </Collapse>
            </>
          ) : (
            <TextField
              label="Project Directory Path"
              value={entryDirectory}
              onChange={(e) => setEntryDirectory(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="e.g., /path/to/project"
              required
            />
          )}
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

export default DependencyDialog;