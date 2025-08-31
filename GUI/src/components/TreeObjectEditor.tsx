import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

interface TreeNodeProps {
  name: string;
  value: any;
  isRoot?: boolean;
  onDelete?: () => void;
  onAddChild?: (type: 'string' | 'number' | 'boolean' | 'object') => void;
  onValueChange?: (newValue: any) => void;
  onNameChange?: (newName: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  isRoot = false,
  onDelete,
  onAddChild,
  onValueChange,
  onNameChange
}) => {
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const isObject = typeof value === 'object' && value !== null;

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddType = (type: 'string' | 'number' | 'boolean' | 'object') => {
    onAddChild?.(type);
    handleAddMenuClose();
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: any = e.target.value;
    // Try to parse numbers and booleans
    if (!isNaN(Number(newValue))) {
      newValue = Number(newValue);
    } else if (newValue === 'true') {
      newValue = true;
    } else if (newValue === 'false') {
      newValue = false;
    }
    onValueChange?.(newValue);
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Name field (editable if not root) */}
        {isRoot ? (
          <Typography variant="subtitle1" color="primary" sx={{ minWidth: 150 }}>
            {name}
          </Typography>
        ) : (
          <TextField
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
            inputProps={{ style: { padding: '4px 8px', fontSize: '0.875rem' } }}
          />
        )}

        {/* Value field (if not an object) */}
        {!isObject && (
          <TextField
            value={value}
            onChange={handleValueChange}
            size="small"
            fullWidth
            inputProps={{ style: { padding: '4px 8px', fontSize: '0.875rem' } }}
          />
        )}

        {/* Delete button (if not root) */}
        {!isRoot && (
          <IconButton size="small" onClick={onDelete} color="error" sx={{ p: 0.5 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Add child button and menu (if object) */}
      {isObject && (
        <Box sx={{ mt: 0.5, ml: 2 }}>
          <Box sx={{ mb: 0.5 }}>
            <Tooltip title="Add Child">
              <IconButton
                size="small"
                onClick={handleAddClick}
                color="primary"
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={handleAddMenuClose}
          >
            <MenuItem onClick={() => handleAddType('string')}>Add String</MenuItem>
            <MenuItem onClick={() => handleAddType('number')}>Add Number</MenuItem>
            <MenuItem onClick={() => handleAddType('boolean')}>Add Boolean</MenuItem>
            <MenuItem onClick={() => handleAddType('object')}>Add Object</MenuItem>
          </Menu>

          {/* Children */}
          <Box sx={{ pl: 1.5 }}>
            {Object.entries(value).map(([childName, childValue]) => (
              <TreeNode
                key={childName}
                name={childName}
                value={childValue}
                onDelete={() => {
                  const newValue = { ...value };
                  delete newValue[childName];
                  onValueChange?.(newValue);
                }}
                onAddChild={(type) => {
                  const newValue = { ...value };
                  const childObj = newValue[childName];
                  if (typeof childObj === 'object' && childObj !== null) {
                    const newChildName = `new${type.charAt(0).toUpperCase()}${type.slice(1)}`;
                    childObj[newChildName] = type === 'object' ? {} : type === 'number' ? 0 : type === 'boolean' ? false : '';
                    onValueChange?.(newValue);
                  }
                }}
                onValueChange={(newChildValue) => {
                  const newValue = { ...value };
                  newValue[childName] = newChildValue;
                  onValueChange?.(newValue);
                }}
                onNameChange={(newChildName) => {
                  if (newChildName !== childName) {
                    const newValue = { ...value };
                    const childValue = newValue[childName];
                    delete newValue[childName];
                    newValue[newChildName] = childValue;
                    onValueChange?.(newValue);
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

interface TreeObjectEditorProps {
  name: string;
  value: Record<string, any>;
  onChange: (newValue: Record<string, any>) => void;
}

const TreeObjectEditor: React.FC<TreeObjectEditorProps> = ({
  name,
  value,
  onChange
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <TreeNode
        name={name}
        value={value}
        isRoot={true}
        onValueChange={onChange}
        onAddChild={(type) => {
          const newValue = { ...value };
          const newChildName = `new${type.charAt(0).toUpperCase()}${type.slice(1)}`;
          newValue[newChildName] = type === 'object' ? {} : type === 'number' ? 0 : type === 'boolean' ? false : '';
          onChange(newValue);
        }}
      />
    </Paper>
  );
};

export default TreeObjectEditor;
