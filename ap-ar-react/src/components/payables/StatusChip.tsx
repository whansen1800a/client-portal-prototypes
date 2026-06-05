import React from 'react';
import { Chip } from '@mui/material';
import { InvoiceStatus } from '../../types/invoice.types';
import { statusColor } from '../../utils/invoiceHelpers';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:            'Draft',
  pending_approval: 'Pending Approval',
  approved:         'Approved',
  scheduled:        'Scheduled',
  paid:             'Paid',
  overdue:          'Overdue',
  disputed:         'Disputed',
};

interface Props { status: InvoiceStatus }

export default function StatusChip({ status }: Props) {
  const { bg, color } = statusColor(status);
  return (
    <Chip
      label={STATUS_LABELS[status]}
      size="small"
      sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: 11, height: 22, borderRadius: 999 }}
    />
  );
}
