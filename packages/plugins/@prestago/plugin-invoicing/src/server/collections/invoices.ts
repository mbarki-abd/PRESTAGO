// =============================================================================
// PRESTAGO - Plugin Invoicing - Collection: Factures
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const invoicesCollection: CollectionOptions = {
  name: COLLECTIONS.INVOICES,
  title: 'Factures',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'number',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Numéro',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: 'standard',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Standard', value: 'standard' },
          { label: 'Proforma', value: 'proforma' },
          { label: 'Avoir', value: 'credit' },
          { label: 'Acompte', value: 'advance' },
          { label: 'Solde', value: 'final' }
        ]
      }
    },
    {
      name: 'status',
      type: 'string',
      defaultValue: 'draft',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'Brouillon', value: 'draft' },
          { label: 'En validation', value: 'pending_validation' },
          { label: 'Validée', value: 'validated' },
          { label: 'Envoyée', value: 'sent' },
          { label: 'Partiellement payée', value: 'partially_paid' },
          { label: 'Payée', value: 'paid' },
          { label: 'En retard', value: 'overdue' },
          { label: 'Annulée', value: 'cancelled' },
          { label: 'Avoir émis', value: 'credited' }
        ]
      }
    },

    // Relations
    {
      name: 'mission_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Mission',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'mission',
      type: 'belongsTo',
      target: 'prestago_missions',
      foreignKey: 'mission_id'
    },
    {
      name: 'timesheet_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'CRA',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'timesheet',
      type: 'belongsTo',
      target: 'prestago_timesheets',
      foreignKey: 'timesheet_id'
    },
    {
      name: 'client_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Client',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'client_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'client_organization_id'
    },
    {
      name: 'consultant_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Émetteur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'consultant_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'consultant_organization_id'
    },

    // Facture liée (pour les avoirs)
    {
      name: 'related_invoice_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Facture liée',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'related_invoice',
      type: 'belongsTo',
      target: COLLECTIONS.INVOICES,
      foreignKey: 'related_invoice_id'
    },

    // Dates
    {
      name: 'issue_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'émission',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'due_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'échéance',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'sent_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'envoi',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'paid_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de paiement',
        'x-component': 'DatePicker'
      }
    },

    // Période facturée
    {
      name: 'period_start',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Début de période',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'period_end',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Fin de période',
        'x-component': 'DatePicker'
      }
    },

    // Montants
    {
      name: 'subtotal',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Sous-total HT',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'discount_amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Remise',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'discount_percentage',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Remise %',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'vat_rate',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 20,
      interface: 'select',
      uiSchema: {
        title: 'Taux TVA',
        'x-component': 'Select',
        enum: [
          { label: '20%', value: 20 },
          { label: '10%', value: 10 },
          { label: '5.5%', value: 5.5 },
          { label: '2.1%', value: 2.1 },
          { label: '0%', value: 0 }
        ]
      }
    },
    {
      name: 'vat_amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Montant TVA',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'total_amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Total TTC',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'paid_amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Montant payé',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'balance_due',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Reste à payer',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'currency',
      type: 'string',
      defaultValue: 'EUR',
      interface: 'select',
      uiSchema: {
        title: 'Devise',
        'x-component': 'Select',
        enum: [
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'GBP (£)', value: 'GBP' },
          { label: 'CHF', value: 'CHF' }
        ]
      }
    },

    // Conditions de paiement
    {
      name: 'payment_terms',
      type: 'integer',
      defaultValue: 30,
      interface: 'select',
      uiSchema: {
        title: 'Conditions de paiement',
        'x-component': 'Select',
        enum: [
          { label: 'Immédiat', value: 0 },
          { label: '15 jours', value: 15 },
          { label: '30 jours', value: 30 },
          { label: '45 jours', value: 45 },
          { label: '60 jours', value: 60 },
          { label: 'Fin de mois', value: -1 }
        ]
      }
    },
    {
      name: 'payment_method',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Mode de paiement',
        'x-component': 'Select',
        enum: [
          { label: 'Virement bancaire', value: 'bank_transfer' },
          { label: 'Chèque', value: 'check' },
          { label: 'Carte bancaire', value: 'card' },
          { label: 'Prélèvement', value: 'direct_debit' }
        ]
      }
    },

    // Notes et documents
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'internal_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes internes',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'pdf_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'PDF',
        'x-component': 'Input'
      }
    },

    // Relations enfants
    {
      name: 'lines',
      type: 'hasMany',
      target: COLLECTIONS.INVOICE_LINES,
      foreignKey: 'invoice_id'
    },
    {
      name: 'payments',
      type: 'hasMany',
      target: COLLECTIONS.PAYMENTS,
      foreignKey: 'invoice_id'
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt'
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt'
    },
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'createdBy'
    },
    {
      name: 'validated_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'validated_at',
      type: 'date',
      interface: 'datetime'
    }
  ],
  indexes: [
    { fields: ['number'], unique: true },
    { fields: ['status'] },
    { fields: ['mission_id'] },
    { fields: ['timesheet_id'] },
    { fields: ['client_organization_id'] },
    { fields: ['consultant_organization_id'] },
    { fields: ['issue_date'] },
    { fields: ['due_date'] },
    { fields: ['type'] }
  ]
};
