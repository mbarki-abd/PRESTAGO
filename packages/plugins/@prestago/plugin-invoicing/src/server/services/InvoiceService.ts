// =============================================================================
// PRESTAGO - Plugin Invoicing - Service: Gestion des factures
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  STATUS_TRANSITIONS,
  DEFAULTS,
  generateInvoiceNumber,
  calculateDueDate,
  calculateTotalWithVAT,
  calculateLineTotal,
  isOverdue
} from '../../shared/constants';
import {
  InvoiceStatus,
  InvoiceType,
  PaymentTerms,
  VATRate,
  PaymentMethod,
  PaymentStatus,
  INVOICE_EVENTS
} from '../../shared/types';

export class InvoiceService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Générer une facture à partir d'un CRA approuvé
   */
  async generateFromTimesheet(timesheetId: string, userId: string): Promise<any> {
    const timesheetCollection = this.db.getCollection('prestago_timesheets');
    const missionCollection = this.db.getCollection('prestago_missions');
    const invoiceCollection = this.db.getCollection(COLLECTIONS.INVOICES);
    const lineCollection = this.db.getCollection(COLLECTIONS.INVOICE_LINES);

    // Récupérer le CRA
    const timesheet = await timesheetCollection.repository.findOne({
      filter: { id: timesheetId },
      appends: ['consultant', 'mission']
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    if (timesheet.status !== 'approved') {
      throw new Error('Le CRA doit être approuvé pour générer une facture');
    }

    // Vérifier qu'une facture n'existe pas déjà
    const existingInvoice = await invoiceCollection.repository.findOne({
      filter: { timesheet_id: timesheetId }
    });

    if (existingInvoice) {
      throw new Error('Une facture existe déjà pour ce CRA');
    }

    // Récupérer la mission
    const mission = await missionCollection.repository.findOne({
      filter: { id: timesheet.mission_id }
    });

    // Récupérer les paramètres de facturation
    const settings = await this.getBillingSettings(mission.consultant_organization_id);

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const invoiceNumber = generateInvoiceNumber(
      settings.invoice_prefix,
      year,
      settings.next_invoice_number
    );

    // Calculer les montants
    const subtotal = timesheet.total_billable_days * mission.daily_rate;
    const { vatAmount, total } = calculateTotalWithVAT(subtotal, settings.default_vat_rate);

    // Calculer la date d'échéance
    const issueDate = new Date();
    const dueDate = calculateDueDate(issueDate, settings.default_payment_terms);

    // Créer la facture
    const invoice = await invoiceCollection.repository.create({
      values: {
        number: invoiceNumber,
        type: InvoiceType.STANDARD,
        status: InvoiceStatus.DRAFT,

        mission_id: mission.id,
        timesheet_id: timesheetId,
        client_organization_id: mission.client_organization_id,
        consultant_organization_id: mission.consultant_organization_id,

        issue_date: issueDate,
        due_date: dueDate,
        period_start: timesheet.period_start,
        period_end: timesheet.period_end,

        subtotal,
        vat_rate: settings.default_vat_rate,
        vat_amount: vatAmount,
        total_amount: total,
        paid_amount: 0,
        balance_due: total,
        currency: settings.default_currency || DEFAULTS.CURRENCY,

        payment_terms: settings.default_payment_terms,

        created_by_id: userId
      }
    });

    // Créer la ligne de facture
    await lineCollection.repository.create({
      values: {
        invoice_id: invoice.id,
        order: 1,
        description: `Prestation de conseil - ${mission.title}\nPériode: ${this.formatPeriod(timesheet.period_start, timesheet.period_end)}`,
        quantity: timesheet.total_billable_days,
        unit: 'jour',
        unit_price: mission.daily_rate,
        vat_rate: settings.default_vat_rate,
        line_total: subtotal
      }
    });

    // Incrémenter le numéro de facture
    await this.incrementInvoiceNumber(settings.id);

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_CREATED, { invoice, timesheet, userId });
    }

    return invoice;
  }

  /**
   * Créer une facture manuelle
   */
  async createInvoice(data: {
    type?: InvoiceType;
    mission_id: string;
    client_organization_id: string;
    consultant_organization_id: string;
    period_start?: Date;
    period_end?: Date;
    payment_terms?: PaymentTerms;
    notes?: string;
    lines: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      vat_rate?: VATRate;
    }>;
  }, userId: string): Promise<any> {
    const invoiceCollection = this.db.getCollection(COLLECTIONS.INVOICES);
    const lineCollection = this.db.getCollection(COLLECTIONS.INVOICE_LINES);

    // Récupérer les paramètres de facturation
    const settings = await this.getBillingSettings(data.consultant_organization_id);

    // Générer le numéro
    const year = new Date().getFullYear();
    const invoiceNumber = generateInvoiceNumber(
      settings.invoice_prefix,
      year,
      settings.next_invoice_number
    );

    // Calculer les totaux
    let subtotal = 0;
    for (const line of data.lines) {
      subtotal += calculateLineTotal(line.quantity, line.unit_price);
    }

    const vatRate = settings.default_vat_rate;
    const { vatAmount, total } = calculateTotalWithVAT(subtotal, vatRate);

    const issueDate = new Date();
    const paymentTerms = data.payment_terms ?? settings.default_payment_terms;
    const dueDate = calculateDueDate(issueDate, paymentTerms);

    // Créer la facture
    const invoice = await invoiceCollection.repository.create({
      values: {
        number: invoiceNumber,
        type: data.type || InvoiceType.STANDARD,
        status: InvoiceStatus.DRAFT,

        mission_id: data.mission_id,
        client_organization_id: data.client_organization_id,
        consultant_organization_id: data.consultant_organization_id,

        issue_date: issueDate,
        due_date: dueDate,
        period_start: data.period_start,
        period_end: data.period_end,

        subtotal,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: total,
        paid_amount: 0,
        balance_due: total,
        currency: settings.default_currency || DEFAULTS.CURRENCY,

        payment_terms: paymentTerms,
        notes: data.notes,

        created_by_id: userId
      }
    });

    // Créer les lignes
    for (let i = 0; i < data.lines.length; i++) {
      const line = data.lines[i];
      const lineVatRate = line.vat_rate ?? vatRate;
      const lineTotal = calculateLineTotal(line.quantity, line.unit_price);

      await lineCollection.repository.create({
        values: {
          invoice_id: invoice.id,
          order: i + 1,
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          unit_price: line.unit_price,
          vat_rate: lineVatRate,
          line_total: lineTotal
        }
      });
    }

    // Incrémenter le numéro
    await this.incrementInvoiceNumber(settings.id);

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_CREATED, { invoice, userId });
    }

    return invoice;
  }

  /**
   * Valider une facture
   */
  async validateInvoice(invoiceId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);

    const invoice = await collection.repository.findOne({
      filter: { id: invoiceId }
    });

    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    this.validateStatusTransition(invoice.status, InvoiceStatus.VALIDATED);

    const updated = await collection.repository.update({
      filter: { id: invoiceId },
      values: {
        status: InvoiceStatus.VALIDATED,
        validated_by_id: userId,
        validated_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_VALIDATED, { invoice: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Envoyer une facture
   */
  async sendInvoice(invoiceId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);

    const invoice = await collection.repository.findOne({
      filter: { id: invoiceId }
    });

    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    this.validateStatusTransition(invoice.status, InvoiceStatus.SENT);

    const updated = await collection.repository.update({
      filter: { id: invoiceId },
      values: {
        status: InvoiceStatus.SENT,
        sent_date: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_SENT, { invoice: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Enregistrer un paiement
   */
  async recordPayment(data: {
    invoice_id: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    received_date?: Date;
    notes?: string;
  }, userId: string): Promise<any> {
    const invoiceCollection = this.db.getCollection(COLLECTIONS.INVOICES);
    const paymentCollection = this.db.getCollection(COLLECTIONS.PAYMENTS);

    const invoice = await invoiceCollection.repository.findOne({
      filter: { id: data.invoice_id }
    });

    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    // Créer le paiement
    const payment = await paymentCollection.repository.create({
      values: {
        invoice_id: data.invoice_id,
        amount: data.amount,
        currency: invoice.currency,
        method: data.method,
        status: PaymentStatus.RECEIVED,
        reference: data.reference,
        received_date: data.received_date || new Date(),
        notes: data.notes,
        recorded_by_id: userId
      }
    });

    // Mettre à jour la facture
    const newPaidAmount = (invoice.paid_amount || 0) + data.amount;
    const newBalanceDue = invoice.total_amount - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0 && newStatus !== InvoiceStatus.PARTIALLY_PAID) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoiceCollection.repository.update({
      filter: { id: data.invoice_id },
      values: {
        paid_amount: newPaidAmount,
        balance_due: Math.max(0, newBalanceDue),
        status: newStatus,
        paid_date: newStatus === InvoiceStatus.PAID ? new Date() : null
      }
    });

    if (this.eventEmitter) {
      const event = newStatus === InvoiceStatus.PAID
        ? INVOICE_EVENTS.INVOICE_PAID
        : INVOICE_EVENTS.PAYMENT_RECEIVED;
      this.eventEmitter.emit(event, { invoice, payment, userId });
    }

    return payment;
  }

  /**
   * Annuler une facture
   */
  async cancelInvoice(invoiceId: string, userId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);

    const invoice = await collection.repository.findOne({
      filter: { id: invoiceId }
    });

    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    if (invoice.paid_amount > 0) {
      throw new Error('Impossible d\'annuler une facture avec des paiements. Créez un avoir.');
    }

    this.validateStatusTransition(invoice.status, InvoiceStatus.CANCELLED);

    const updated = await collection.repository.update({
      filter: { id: invoiceId },
      values: {
        status: InvoiceStatus.CANCELLED,
        internal_notes: reason ? `Annulée: ${reason}` : 'Annulée'
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_CANCELLED, { invoice: updated[0], reason, userId });
    }

    return updated[0];
  }

  /**
   * Créer un avoir
   */
  async createCreditNote(invoiceId: string, userId: string, reason: string): Promise<any> {
    const invoiceCollection = this.db.getCollection(COLLECTIONS.INVOICES);
    const lineCollection = this.db.getCollection(COLLECTIONS.INVOICE_LINES);

    const originalInvoice = await invoiceCollection.repository.findOne({
      filter: { id: invoiceId },
      appends: ['lines']
    });

    if (!originalInvoice) {
      throw new Error('Facture non trouvée');
    }

    // Récupérer les paramètres
    const settings = await this.getBillingSettings(originalInvoice.consultant_organization_id);

    // Générer le numéro d'avoir
    const year = new Date().getFullYear();
    const creditNoteNumber = generateInvoiceNumber(
      settings.credit_note_prefix || 'AV',
      year,
      settings.next_credit_note_number || 1
    );

    // Créer l'avoir (montants négatifs)
    const creditNote = await invoiceCollection.repository.create({
      values: {
        number: creditNoteNumber,
        type: InvoiceType.CREDIT_NOTE,
        status: InvoiceStatus.DRAFT,

        mission_id: originalInvoice.mission_id,
        timesheet_id: originalInvoice.timesheet_id,
        client_organization_id: originalInvoice.client_organization_id,
        consultant_organization_id: originalInvoice.consultant_organization_id,
        related_invoice_id: invoiceId,

        issue_date: new Date(),
        due_date: new Date(),
        period_start: originalInvoice.period_start,
        period_end: originalInvoice.period_end,

        subtotal: -originalInvoice.subtotal,
        vat_rate: originalInvoice.vat_rate,
        vat_amount: -originalInvoice.vat_amount,
        total_amount: -originalInvoice.total_amount,
        paid_amount: 0,
        balance_due: -originalInvoice.total_amount,
        currency: originalInvoice.currency,

        notes: `Avoir sur facture ${originalInvoice.number}\nMotif: ${reason}`,

        created_by_id: userId
      }
    });

    // Créer les lignes de l'avoir
    if (originalInvoice.lines) {
      for (let i = 0; i < originalInvoice.lines.length; i++) {
        const line = originalInvoice.lines[i];
        await lineCollection.repository.create({
          values: {
            invoice_id: creditNote.id,
            order: i + 1,
            description: `Annulation: ${line.description}`,
            quantity: -line.quantity,
            unit: line.unit,
            unit_price: line.unit_price,
            vat_rate: line.vat_rate,
            line_total: -line.line_total
          }
        });
      }
    }

    // Marquer la facture originale comme ayant un avoir
    await invoiceCollection.repository.update({
      filter: { id: invoiceId },
      values: { status: InvoiceStatus.CREDITED }
    });

    // Incrémenter le numéro d'avoir
    if (settings.id) {
      const settingsCollection = this.db.getCollection(COLLECTIONS.BILLING_SETTINGS);
      await settingsCollection.repository.update({
        filter: { id: settings.id },
        values: {
          next_credit_note_number: (settings.next_credit_note_number || 1) + 1
        }
      });
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_CREDITED, {
        creditNote,
        originalInvoice,
        reason,
        userId
      });
    }

    return creditNote;
  }

  /**
   * Marquer les factures en retard
   */
  async markOverdueInvoices(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await collection.repository.find({
      filter: {
        status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID] },
        due_date: { $lt: today }
      }
    });

    let count = 0;
    for (const invoice of overdueInvoices) {
      await collection.repository.update({
        filter: { id: invoice.id },
        values: { status: InvoiceStatus.OVERDUE }
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(INVOICE_EVENTS.INVOICE_OVERDUE, { invoice });
      }

      count++;
    }

    return count;
  }

  /**
   * Obtenir les factures en retard
   */
  async getOverdueInvoices(): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);

    return collection.repository.find({
      filter: { status: InvoiceStatus.OVERDUE },
      appends: ['client_organization', 'mission'],
      sort: ['due_date']
    });
  }

  /**
   * Obtenir les statistiques de facturation
   */
  async getBillingStats(organizationId?: string, year?: number): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INVOICES);

    const filter: any = {};
    if (organizationId) {
      filter.$or = [
        { client_organization_id: organizationId },
        { consultant_organization_id: organizationId }
      ];
    }
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      filter.issue_date = { $gte: startOfYear, $lte: endOfYear };
    }

    const invoices = await collection.repository.find({ filter });

    const stats: any = {
      total_invoiced: 0,
      total_paid: 0,
      total_pending: 0,
      total_overdue: 0,
      invoices_count: invoices.length,
      paid_count: 0,
      pending_count: 0,
      overdue_count: 0,
      by_status: {},
      by_month: {}
    };

    for (const invoice of invoices) {
      // Par statut
      stats.by_status[invoice.status] = (stats.by_status[invoice.status] || 0) + 1;

      // Totaux
      if (invoice.type !== 'credit') {
        stats.total_invoiced += invoice.total_amount || 0;
      }

      if (invoice.status === InvoiceStatus.PAID) {
        stats.total_paid += invoice.total_amount || 0;
        stats.paid_count++;
      } else if (invoice.status === InvoiceStatus.OVERDUE) {
        stats.total_overdue += invoice.balance_due || 0;
        stats.overdue_count++;
      } else if ([InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID].includes(invoice.status as InvoiceStatus)) {
        stats.total_pending += invoice.balance_due || 0;
        stats.pending_count++;
      }

      // Par mois
      if (invoice.issue_date) {
        const month = new Date(invoice.issue_date).getMonth() + 1;
        const key = `${year || new Date(invoice.issue_date).getFullYear()}-${month.toString().padStart(2, '0')}`;
        if (!stats.by_month[key]) {
          stats.by_month[key] = { count: 0, total: 0 };
        }
        stats.by_month[key].count++;
        stats.by_month[key].total += invoice.total_amount || 0;
      }
    }

    return stats;
  }

  /**
   * Obtenir les paramètres de facturation
   */
  private async getBillingSettings(organizationId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.BILLING_SETTINGS);

    let settings = await collection.repository.findOne({
      filter: { organization_id: organizationId }
    });

    if (!settings) {
      // Créer des paramètres par défaut
      settings = await collection.repository.create({
        values: {
          organization_id: organizationId,
          invoice_prefix: DEFAULTS.INVOICE_PREFIX,
          next_invoice_number: 1,
          next_credit_note_number: 1,
          default_payment_terms: DEFAULTS.PAYMENT_TERMS,
          default_vat_rate: DEFAULTS.VAT_RATE,
          default_currency: DEFAULTS.CURRENCY
        }
      });
    }

    return settings;
  }

  /**
   * Incrémenter le numéro de facture
   */
  private async incrementInvoiceNumber(settingsId: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.BILLING_SETTINGS);

    await collection.repository.update({
      filter: { id: settingsId },
      values: {
        next_invoice_number: this.db.sequelize.literal('next_invoice_number + 1')
      }
    });
  }

  /**
   * Formater une période
   */
  private formatPeriod(start: Date, end: Date): string {
    const formatDate = (d: Date) => {
      const date = new Date(d);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    return `${formatDate(start)} au ${formatDate(end)}`;
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): void {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }
}
