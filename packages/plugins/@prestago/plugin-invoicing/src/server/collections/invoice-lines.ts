// =============================================================================
// PRESTAGO - Plugin Invoicing - Collection: Lignes de facture
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const invoiceLinesCollection: CollectionOptions = {
  name: COLLECTIONS.INVOICE_LINES,
  title: 'Lignes de facture',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
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
      name: 'order',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Ordre',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Description',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'quantity',
      type: 'decimal',
      precision: 10,
      scale: 2,
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Quantité',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'unit',
      type: 'string',
      defaultValue: 'jour',
      interface: 'select',
      uiSchema: {
        title: 'Unité',
        'x-component': 'Select',
        enum: [
          { label: 'Jour', value: 'jour' },
          { label: 'Heure', value: 'heure' },
          { label: 'Forfait', value: 'forfait' },
          { label: 'Unité', value: 'unité' }
        ]
      }
    },
    {
      name: 'unit_price',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Prix unitaire HT',
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
      name: 'line_total',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Total ligne HT',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 },
        'x-read-pretty': true
      }
    },

    // Lien optionnel avec une entrée de CRA
    {
      name: 'timesheet_entry_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Entrée CRA',
        'x-component': 'RecordPicker'
      }
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
    { fields: ['invoice_id', 'order'] }
  ]
};
