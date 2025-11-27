// =============================================================================
// PRESTAGO - Plugin Invoicing - Collection: Paiements
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const paymentsCollection: CollectionOptions = {
  name: COLLECTIONS.PAYMENTS,
  title: 'Paiements',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'reference',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Référence',
        'x-component': 'Input'
      }
    },
    {
      name: 'invoice_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Facture',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'invoice',
      type: 'belongsTo',
      target: COLLECTIONS.INVOICES,
      foreignKey: 'invoice_id'
    },
    {
      name: 'amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Montant',
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
    {
      name: 'method',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Mode de paiement',
        'x-component': 'Select',
        enum: [
          { label: 'Virement bancaire', value: 'bank_transfer' },
          { label: 'Chèque', value: 'check' },
          { label: 'Carte bancaire', value: 'card' },
          { label: 'Espèces', value: 'cash' },
          { label: 'Prélèvement', value: 'direct_debit' }
        ]
      }
    },
    {
      name: 'status',
      type: 'string',
      defaultValue: 'received',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'En attente', value: 'pending' },
          { label: 'Reçu', value: 'received' },
          { label: 'Échoué', value: 'failed' },
          { label: 'Remboursé', value: 'refunded' }
        ]
      }
    },
    {
      name: 'received_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de réception',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'bank_reference',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Référence bancaire',
        'x-component': 'Input'
      }
    },
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes',
        'x-component': 'Input.TextArea'
      }
    },

    // Pièce jointe
    {
      name: 'attachments',
      type: 'json',
      defaultValue: [],
      interface: 'attachment',
      uiSchema: {
        title: 'Justificatifs',
        'x-component': 'Upload.Attachment'
      }
    },

    // Enregistré par
    {
      name: 'recorded_by_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Enregistré par',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'recorded_by',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'recorded_by_id'
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
    }
  ],
  indexes: [
    { fields: ['invoice_id'] },
    { fields: ['reference'] },
    { fields: ['status'] },
    { fields: ['received_date'] }
  ]
};
