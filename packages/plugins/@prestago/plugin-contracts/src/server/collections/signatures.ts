// =============================================================================
// PRESTAGO - Plugin Contracts - Collection: Signatures
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const signaturesCollection: CollectionOptions = {
  name: COLLECTIONS.SIGNATURES,
  title: 'Signatures',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'contract_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Contrat',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'contract',
      type: 'belongsTo',
      target: COLLECTIONS.CONTRACTS,
      foreignKey: 'contract_id'
    },
    {
      name: 'signer_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Signataire',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'signer',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'signer_id'
    },
    {
      name: 'signer_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de signataire',
        'x-component': 'Select',
        enum: [
          { label: 'Partie A', value: 'party_a' },
          { label: 'Partie B', value: 'party_b' }
        ]
      }
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: 'electronic',
      interface: 'select',
      uiSchema: {
        title: 'Type de signature',
        'x-component': 'Select',
        enum: [
          { label: 'Électronique', value: 'electronic' },
          { label: 'Manuscrite', value: 'handwritten' },
          { label: 'Certificat numérique', value: 'digital_certificate' }
        ]
      }
    },
    {
      name: 'status',
      type: 'string',
      defaultValue: 'pending',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'En attente', value: 'pending' },
          { label: 'Envoyé', value: 'sent' },
          { label: 'Consulté', value: 'viewed' },
          { label: 'Signé', value: 'signed' },
          { label: 'Refusé', value: 'declined' },
          { label: 'Expiré', value: 'expired' }
        ]
      }
    },
    {
      name: 'email',
      type: 'string',
      interface: 'email',
      uiSchema: {
        title: 'Email',
        'x-component': 'Input'
      }
    },
    {
      name: 'order',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Ordre',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'requested_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de demande',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'sent_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date d\'envoi',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'viewed_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de consultation',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'signed_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de signature',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'declined_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de refus',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'expires_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date d\'expiration',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'decline_reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Motif de refus',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'signature_url',
      type: 'string',
      interface: 'attachment',
      uiSchema: {
        title: 'Image de signature',
        'x-component': 'Upload.Attachment'
      }
    },
    {
      name: 'signature_data',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Données de signature (Base64)',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'ip_address',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Adresse IP',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'user_agent',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'User Agent',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'token',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Token de signature',
        'x-component': 'Input',
        'x-read-pretty': true
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
    { fields: ['contract_id'] },
    { fields: ['signer_id'] },
    { fields: ['status'] },
    { fields: ['token'], unique: true },
    { fields: ['contract_id', 'signer_type'] }
  ]
};
