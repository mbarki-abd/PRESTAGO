// =============================================================================
// PRESTAGO - Plugin Invoicing - Collection: Paramètres de facturation
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS, DEFAULT_LEGAL_MENTIONS } from '../../shared/constants';

export const billingSettingsCollection: CollectionOptions = {
  name: COLLECTIONS.BILLING_SETTINGS,
  title: 'Paramètres de facturation',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'organization_id',
      type: 'uuid',
      unique: true,
      interface: 'linkTo',
      uiSchema: {
        title: 'Organisation',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'organization_id'
    },

    // Numérotation
    {
      name: 'invoice_prefix',
      type: 'string',
      defaultValue: 'FAC',
      interface: 'input',
      uiSchema: {
        title: 'Préfixe facture',
        'x-component': 'Input'
      }
    },
    {
      name: 'credit_note_prefix',
      type: 'string',
      defaultValue: 'AV',
      interface: 'input',
      uiSchema: {
        title: 'Préfixe avoir',
        'x-component': 'Input'
      }
    },
    {
      name: 'next_invoice_number',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Prochain numéro',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'next_credit_note_number',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Prochain numéro avoir',
        'x-component': 'InputNumber'
      }
    },

    // Conditions par défaut
    {
      name: 'default_payment_terms',
      type: 'integer',
      defaultValue: 30,
      interface: 'select',
      uiSchema: {
        title: 'Conditions de paiement par défaut',
        'x-component': 'Select',
        enum: [
          { label: 'Immédiat', value: 0 },
          { label: '15 jours', value: 15 },
          { label: '30 jours', value: 30 },
          { label: '45 jours', value: 45 },
          { label: '60 jours', value: 60 }
        ]
      }
    },
    {
      name: 'default_vat_rate',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 20,
      interface: 'select',
      uiSchema: {
        title: 'Taux TVA par défaut',
        'x-component': 'Select',
        enum: [
          { label: '20%', value: 20 },
          { label: '10%', value: 10 },
          { label: '5.5%', value: 5.5 },
          { label: '0%', value: 0 }
        ]
      }
    },
    {
      name: 'default_currency',
      type: 'string',
      defaultValue: 'EUR',
      interface: 'select',
      uiSchema: {
        title: 'Devise par défaut',
        'x-component': 'Select',
        enum: [
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'GBP (£)', value: 'GBP' }
        ]
      }
    },

    // Coordonnées bancaires
    {
      name: 'bank_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Banque',
        'x-component': 'Input'
      }
    },
    {
      name: 'bank_iban',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'IBAN',
        'x-component': 'Input'
      }
    },
    {
      name: 'bank_bic',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'BIC',
        'x-component': 'Input'
      }
    },

    // Mentions légales
    {
      name: 'legal_mentions',
      type: 'text',
      defaultValue: DEFAULT_LEGAL_MENTIONS,
      interface: 'textarea',
      uiSchema: {
        title: 'Mentions légales',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'footer_text',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Texte de pied de page',
        'x-component': 'Input.TextArea'
      }
    },

    // Logo et personnalisation
    {
      name: 'logo_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'Logo',
        'x-component': 'Upload.URL'
      }
    },
    {
      name: 'primary_color',
      type: 'string',
      defaultValue: '#1890ff',
      interface: 'colorPicker',
      uiSchema: {
        title: 'Couleur principale',
        'x-component': 'ColorPicker'
      }
    },

    // Email
    {
      name: 'invoice_email_subject',
      type: 'string',
      defaultValue: 'Facture {number} - {company}',
      interface: 'input',
      uiSchema: {
        title: 'Sujet email facture',
        'x-component': 'Input'
      }
    },
    {
      name: 'invoice_email_template',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Template email facture',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'reminder_email_template',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Template email relance',
        'x-component': 'Input.TextArea'
      }
    },

    // Auto-facturation
    {
      name: 'auto_generate_invoices',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Génération automatique',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'auto_send_invoices',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Envoi automatique',
        'x-component': 'Checkbox'
      }
    },

    // Rappels
    {
      name: 'send_reminders',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Envoyer des rappels',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'reminder_days',
      type: 'json',
      defaultValue: [7, 14, 30],
      interface: 'json',
      uiSchema: {
        title: 'Jours de rappel',
        'x-component': 'Input.JSON'
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
    { fields: ['organization_id'], unique: true }
  ]
};
