import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Divider, Button, Stack } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { APARState } from '../../types/invoice.types';
import { ActiveView } from '../shell/AppShell';
import { getAPAgingSummary, getARAgingSummary, formatCurrency } from '../../utils/invoiceHelpers';

interface Props {
  state: APARState;
  onNavigate: (v: ActiveView) => void;
}

interface AgingBucketProps {
  label: string;
  amount: number;
  color: string;
  bgColor: string;
}

function AgingBucket({ label, amount, color, bgColor }: AgingBucketProps) {
  return (
    <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: bgColor, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700, color }}>{formatCurrency(amount)}</Typography>
    </Box>
  );
}

export default function APARDashboard({ state, onNavigate }: Props) {
  const apAging = getAPAgingSummary(state.apInvoices);
  const arAging = getARAgingSummary(state.arInvoices);
  const pendingApproval = state.apInvoices.filter(i => i.status === 'pending_approval').length;
  const overdueAP = state.apInvoices.filter(i => i.status === 'overdue').length;
  const overdueAR = state.arInvoices.filter(i => i.status === 'overdue').length;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Overview</Typography>

      <Grid container spacing={3}>
        {/* AP Summary Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <TrendingDownIcon sx={{ color: '#E0284A' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Accounts Payable</Typography>
                </Stack>
                <Button size="small" onClick={() => onNavigate('payables')} sx={{ color: 'secondary.main' }}>View All</Button>
              </Stack>

              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {formatCurrency(apAging.total)}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Total outstanding · {pendingApproval} pending approval{overdueAP > 0 ? ` · ${overdueAP} overdue` : ''}
              </Typography>

              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>AGING</Typography>
              <Stack direction="row" gap={1}>
                <AgingBucket label="Current"   amount={apAging.current}     color="#2E7D32" bgColor="#E8F5E9" />
                <AgingBucket label="1-30 days" amount={apAging.days30}      color="#1776B6" bgColor="#EBF3FF" />
                <AgingBucket label="31-60 days" amount={apAging.days60}     color="#784E03" bgColor="#FFF3E0" />
                <AgingBucket label="60+ days"  amount={apAging.days90plus}  color="#E0284A" bgColor="#FFF0F0" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* AR Summary Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <TrendingUpIcon sx={{ color: '#2DA38D' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Accounts Receivable</Typography>
                </Stack>
                <Button size="small" onClick={() => onNavigate('receivables')} sx={{ color: 'secondary.main' }}>View All</Button>
              </Stack>

              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {formatCurrency(arAging.total)}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Total outstanding · {overdueAR} overdue
              </Typography>

              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>AGING</Typography>
              <Stack direction="row" gap={1}>
                <AgingBucket label="Current"   amount={arAging.current}     color="#2E7D32" bgColor="#E8F5E9" />
                <AgingBucket label="1-30 days" amount={arAging.days30}      color="#1776B6" bgColor="#EBF3FF" />
                <AgingBucket label="31-60 days" amount={arAging.days60}     color="#784E03" bgColor="#FFF3E0" />
                <AgingBucket label="60+ days"  amount={arAging.days90plus}  color="#E0284A" bgColor="#FFF0F0" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent AP Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Recent Payables</Typography>
              {state.apInvoices.slice(0, 4).map(inv => (
                <Stack key={inv.id} direction="row" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{inv.vendor.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{inv.invoiceNumber} · Due {inv.dueDate}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(inv.amount)}</Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent AR Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Recent Receivables</Typography>
              {state.arInvoices.slice(0, 4).map(inv => (
                <Stack key={inv.id} direction="row" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{inv.customer.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{inv.invoiceNumber} · Due {inv.dueDate}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(inv.amount)}</Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
