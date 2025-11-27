// =============================================================================
// PRESTAGO - Plugin Invoicing - Constantes
// =============================================================================

import { InvoiceStatus, PaymentTerms, VATRate } from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  INVOICES: 'prestago_invoices',
  INVOICE_LINES: 'prestago_invoice_lines',
  PAYMENTS: 'prestago_payments',
  BILLING_SETTINGS: 'prestago_billing_settings',
  PAYMENT_REMINDERS: 'prestago_payment_reminders'
};

/**
 * Transitions de statut facture
 */
export const STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.PENDING_VALIDATION, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PENDING_VALIDATION]: [InvoiceStatus.VALIDATED, InvoiceStatus.DRAFT, InvoiceStatus.CANCELLED],
  [InvoiceStatus.VALIDATED]: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
  [InvoiceStatus.SENT]: [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
  [InvoiceStatus.PAID]: [InvoiceStatus.CREDITED],
  [InvoiceStatus.OVERDUE]: [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
  [InvoiceStatus.CANCELLED]: [],
  [InvoiceStatus.CREDITED]: []
};

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  CURRENCY: 'EUR',
  VAT_RATE: VATRate.STANDARD,
  PAYMENT_TERMS: PaymentTerms.NET_30,
  INVOICE_PREFIX: 'FAC',
  OVERDUE_GRACE_DAYS: 0,
  REMINDER_DAYS: [7, 14, 30], // Jours après échéance pour les rappels
  DUE_SOON_DAYS: 7 // Alerte X jours avant échéance
};

/**
 * Règles de validation
 */
export const VALIDATION = {
  INVOICE: {
    NUMBER_MAX_LENGTH: 50,
    NOTES_MAX_LENGTH: 2000,
    MIN_AMOUNT: 0.01
  },
  LINE: {
    DESCRIPTION_MAX_LENGTH: 500,
    MIN_QUANTITY: 0.01,
    MIN_UNIT_PRICE: 0
  }
};

/**
 * Couleurs de statut pour l'UI
 */
export const STATUS_COLORS = {
  [InvoiceStatus.DRAFT]: 'default',
  [InvoiceStatus.PENDING_VALIDATION]: 'processing',
  [InvoiceStatus.VALIDATED]: 'processing',
  [InvoiceStatus.SENT]: 'warning',
  [InvoiceStatus.PARTIALLY_PAID]: 'warning',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.OVERDUE]: 'error',
  [InvoiceStatus.CANCELLED]: 'default',
  [InvoiceStatus.CREDITED]: 'default'
};

/**
 * Générer un numéro de facture
 */
export function generateInvoiceNumber(
  prefix: string,
  year: number,
  sequence: number
): string {
  const seq = sequence.toString().padStart(5, '0');
  return `${prefix}-${year}-${seq}`;
}

/**
 * Calculer la date d'échéance
 */
export function calculateDueDate(
  issueDate: Date,
  paymentTerms: PaymentTerms
): Date {
  const dueDate = new Date(issueDate);

  if (paymentTerms === PaymentTerms.END_OF_MONTH) {
    // Fin du mois en cours
    dueDate.setMonth(dueDate.getMonth() + 1, 0);
  } else if (paymentTerms === PaymentTerms.END_OF_MONTH_30) {
    // Fin du mois + 30 jours
    dueDate.setMonth(dueDate.getMonth() + 1, 0);
    dueDate.setDate(dueDate.getDate() + 30);
  } else if (paymentTerms >= 0) {
    dueDate.setDate(dueDate.getDate() + paymentTerms);
  }

  return dueDate;
}

/**
 * Calculer le montant TTC
 */
export function calculateTotalWithVAT(
  subtotal: number,
  vatRate: VATRate
): { vatAmount: number; total: number } {
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

/**
 * Calculer le montant d'une ligne
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number
): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Vérifier si une facture est en retard
 */
export function isOverdue(dueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Calculer le nombre de jours de retard
 */
export function getOverdueDays(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due >= today) return 0;

  const diffTime = today.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formater un montant
 */
export function formatAmount(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Mentions légales par défaut
 */
export const DEFAULT_LEGAL_MENTIONS = `
En cas de retard de paiement, seront exigibles, conformément à l'article L 441-6 du code de commerce, une indemnité calculée sur la base de trois fois le taux de l'intérêt légal en vigueur ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

Pas d'escompte pour règlement anticipé.
`.trim();
