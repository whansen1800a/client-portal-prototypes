import type { APInvoice, ARInvoice, AgingSummary, InvoiceStatus } from '../types/invoice.types';

export function getAPAgingSummary(invoices: APInvoice[]): AgingSummary {
  const unpaid = invoices.filter(i => i.status !== 'paid');
  return {
    current:    unpaid.filter(i => i.agingDays <= 0).reduce((s, i) => s + i.amount, 0),
    days30:     unpaid.filter(i => i.agingDays > 0 && i.agingDays <= 30).reduce((s, i) => s + i.amount, 0),
    days60:     unpaid.filter(i => i.agingDays > 30 && i.agingDays <= 60).reduce((s, i) => s + i.amount, 0),
    days90plus: unpaid.filter(i => i.agingDays > 60).reduce((s, i) => s + i.amount, 0),
    total:      unpaid.reduce((s, i) => s + i.amount, 0),
  };
}

export function getARAgingSummary(invoices: ARInvoice[]): AgingSummary {
  const unpaid = invoices.filter(i => i.status !== 'paid');
  return {
    current:    unpaid.filter(i => i.agingDays <= 0).reduce((s, i) => s + (i.amount - i.amountPaid), 0),
    days30:     unpaid.filter(i => i.agingDays > 0  && i.agingDays <= 30).reduce((s, i) => s + (i.amount - i.amountPaid), 0),
    days60:     unpaid.filter(i => i.agingDays > 30 && i.agingDays <= 60).reduce((s, i) => s + (i.amount - i.amountPaid), 0),
    days90plus: unpaid.filter(i => i.agingDays > 60).reduce((s, i) => s + (i.amount - i.amountPaid), 0),
    total:      unpaid.reduce((s, i) => s + (i.amount - i.amountPaid), 0),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function statusColor(status: InvoiceStatus): { bg: string; color: string } {
  const map: Record<InvoiceStatus, { bg: string; color: string }> = {
    draft:            { bg: '#F5F5F5',  color: '#757575' },
    pending_approval: { bg: '#EBF3FF',  color: '#1776B6' },
    approved:         { bg: '#E8F5E9',  color: '#2E7D32' },
    scheduled:        { bg: '#F3E5F5',  color: '#7B1FA2' },
    paid:             { bg: '#DBF6E7',  color: '#2DA38D' },
    overdue:          { bg: '#FFF0F0',  color: '#E0284A' },
    disputed:         { bg: '#FFF3E0',  color: '#784E03' },
  };
  return map[status];
}
