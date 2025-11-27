// =============================================================================
// PRESTAGO - Plugin Invoicing - Types et Énumérations
// =============================================================================

/**
 * Statuts de facture
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  SENT = 'sent',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  CREDITED = 'credited'
}

/**
 * Types de facture
 */
export enum InvoiceType {
  STANDARD = 'standard',    // Facture standard
  PROFORMA = 'proforma',    // Facture proforma
  CREDIT_NOTE = 'credit',   // Avoir
  ADVANCE = 'advance',      // Acompte
  FINAL = 'final'           // Facture de solde
}

/**
 * Modes de paiement
 */
export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CARD = 'card',
  CASH = 'cash',
  DIRECT_DEBIT = 'direct_debit'
}

/**
 * Statuts de paiement
 */
export enum PaymentStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * Termes de paiement
 */
export enum PaymentTerms {
  IMMEDIATE = 0,
  NET_15 = 15,
  NET_30 = 30,
  NET_45 = 45,
  NET_60 = 60,
  NET_90 = 90,
  END_OF_MONTH = -1,
  END_OF_MONTH_30 = -30
}

/**
 * Taux de TVA
 */
export enum VATRate {
  STANDARD = 20,
  INTERMEDIATE = 10,
  REDUCED = 5.5,
  SUPER_REDUCED = 2.1,
  ZERO = 0
}

/**
 * Événements de facturation
 */
export const INVOICE_EVENTS = {
  // Lifecycle
  INVOICE_CREATED: 'invoice.created',
  INVOICE_VALIDATED: 'invoice.validated',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PARTIALLY_PAID: 'invoice.partially_paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  INVOICE_CANCELLED: 'invoice.cancelled',
  INVOICE_CREDITED: 'invoice.credited',

  // Paiements
  PAYMENT_RECEIVED: 'invoice.payment.received',
  PAYMENT_FAILED: 'invoice.payment.failed',
  PAYMENT_REFUNDED: 'invoice.payment.refunded',

  // Rappels
  PAYMENT_REMINDER_SENT: 'invoice.reminder.sent',
  PAYMENT_DUE_SOON: 'invoice.payment.due_soon'
} as const;

/**
 * Interface Facture
 */
export interface IInvoice {
  id: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;

  // Relations
  mission_id: string;
  timesheet_id?: string;
  client_organization_id: string;
  consultant_organization_id?: string;

  // Dates
  issue_date: Date;
  due_date: Date;
  sent_date?: Date;
  paid_date?: Date;

  // Période facturée
  period_start: Date;
  period_end: Date;

  // Montants
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  currency: string;

  // Informations de paiement
  payment_terms: PaymentTerms;
  payment_method?: PaymentMethod;
  bank_details?: any;

  // Métadonnées
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface Ligne de facture
 */
export interface IInvoiceLine {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: VATRate;
  line_total: number;
  timesheet_entry_id?: string;
}

/**
 * Interface Paiement
 */
export interface IPayment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  received_date: Date;
  notes?: string;
}

/**
 * Interface Conditions de facturation
 */
export interface IBillingSettings {
  id: string;
  organization_id: string;
  default_payment_terms: PaymentTerms;
  default_vat_rate: VATRate;
  invoice_prefix: string;
  next_invoice_number: number;
  bank_name: string;
  bank_iban: string;
  bank_bic: string;
  legal_mentions?: string;
  logo_url?: string;
}

/**
 * Interface Récapitulatif de facturation
 */
export interface IBillingSummary {
  total_invoiced: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  invoices_count: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}
