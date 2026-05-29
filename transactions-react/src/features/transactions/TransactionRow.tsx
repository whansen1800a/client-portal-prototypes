import React from 'react';
import {
  TableRow, TableCell, Checkbox, Avatar,
  Box, Typography
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ITransaction } from './transactions.types';

interface TransactionRowProps {
  transaction: ITransaction;
  selected: boolean;
  onToggle: (id: string) => void;
}

const STATUS_CONFIG = {
  reconciled: { label: 'R', bgcolor: '#DBF6E7', color: '#2DA38D' },
  transfer:   { label: 'T', bgcolor: '#EBF3FF', color: '#1776B6' },
  duplicate:  { label: 'D', bgcolor: '#FFCF7C', color: '#784E03' },
} as const;

function formatAmount(amount: number, isIncome: boolean): string {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isIncome ? `+$${abs}` : `$${abs}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TransactionRow({ transaction: tx, selected, onToggle }: TransactionRowProps) {
  return (
    <TableRow
      hover
      selected={selected}
      onClick={() => onToggle(tx.id)}
      sx={{
        cursor: 'pointer',
        '&.Mui-selected': { bgcolor: 'rgba(219,246,231,0.25)' },
        '&.Mui-selected:hover': { bgcolor: 'rgba(219,246,231,0.4)' },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
      }}
    >
      {/* Checkbox */}
      <TableCell padding="checkbox" sx={{ pl: 2 }}>
        <Checkbox
          checked={selected}
          color="secondary"
          size="small"
          onClick={e => e.stopPropagation()}
          onChange={() => onToggle(tx.id)}
        />
      </TableCell>

      {/* Date */}
      <TableCell sx={{ width: 60, color: 'text.secondary', typography: 'caption', fontWeight: 500 }}>
        {formatDate(tx.date)}
      </TableCell>

      {/* Merchant */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: tx.merchantColor, width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700 }}>
            {tx.merchantInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {tx.merchantName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {tx.accountMask}
              {tx.categorizationState === 'needs_review' && (
                <>
                  &nbsp;·&nbsp;
                  <Box component="span" sx={{ color: 'warning.main', fontWeight: 500 }}>
                    Needs review
                  </Box>
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Category */}
      <TableCell sx={{ width: 220 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              bgcolor: tx.categoryColor,
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            fontStyle={tx.categorizationState !== 'categorized' ? 'italic' : 'normal'}
            noWrap
          >
            {tx.categorizationState !== 'categorized' ? 'Uncategorized' : tx.categoryName}
          </Typography>
        </Box>
      </TableCell>

      {/* Status badges */}
      <TableCell sx={{ width: 100 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {tx.statuses.map(status => {
            const cfg = STATUS_CONFIG[status];
            return (
              <Box
                key={status}
                sx={{
                  width: 18, height: 18,
                  borderRadius: '50%',
                  bgcolor: cfg.bgcolor,
                  color: cfg.color,
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {cfg.label}
              </Box>
            );
          })}
        </Box>
      </TableCell>

      {/* Amount */}
      <TableCell align="right" sx={{ width: 120 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          fontFamily="Menlo, 'source-code-pro', monospace"
          color={tx.isIncome ? 'success.main' : 'text.primary'}
        >
          {formatAmount(tx.amount, tx.isIncome)}
        </Typography>
      </TableCell>

      {/* Chevron */}
      <TableCell sx={{ width: 36, pr: 1 }}>
        <ChevronRightIcon
          className="row-actions"
          sx={{ color: 'text.disabled', fontSize: 18, transition: 'opacity 120ms ease', display: 'block' }}
        />
      </TableCell>
    </TableRow>
  );
}
