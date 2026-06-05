export type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'paid'
  | 'overdue'
  | 'disputed';

export type UserRole = 'submitter' | 'approver' | 'payer';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface APInvoice {
  id: string;
  invoiceNumber: string;
  vendor: Vendor;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  poMatched: boolean;
  receiptMatched: boolean;
  approver?: string;
  paymentDate?: string;
  notes?: string;
  agingDays: number;
}

export interface ARInvoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  sentDate?: string;
  paidDate?: string;
  notes?: string;
  agingDays: number;
}

export interface AgingSummary {
  current: number;
  days30: number;
  days60: number;
  days90plus: number;
  total: number;
}

export interface APARState {
  userRole: UserRole;
  apInvoices: APInvoice[];
  arInvoices: ARInvoice[];
  selectedAPInvoiceId: string | null;
  selectedARInvoiceId: string | null;
  apDetailOpen: boolean;
  arDetailOpen: boolean;
  arCreateOpen: boolean;
}
