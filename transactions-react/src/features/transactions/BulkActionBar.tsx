import React from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
import CategoryIcon from '@mui/icons-material/LabelOutlined';
import ExcludeIcon from '@mui/icons-material/BlockOutlined';

interface BulkActionBarProps {
  selectedCount: number;
  onCategorize: () => void;
  onExclude: () => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, onCategorize, onExclude, onClear }: BulkActionBarProps) {
  const open = selectedCount > 0;

  return (
    <Collapse in={open}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: '10px',
          bgcolor: 'action.selected',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{ flexGrow: 1, color: 'secondary.main', fontWeight: 500 }}
        >
          {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<CategoryIcon />}
          onClick={onCategorize}
          sx={{ borderRadius: '4px' }}
        >
          Categorize
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<ExcludeIcon />}
          onClick={onExclude}
          sx={{ borderRadius: '4px' }}
        >
          Exclude
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={onClear}
          sx={{ color: 'text.secondary', minWidth: 'auto' }}
        >
          Clear
        </Button>
      </Box>
    </Collapse>
  );
}
