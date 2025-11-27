// =============================================================================
// PRESTAGO - Plugin Contracts - Collection: Documents de Conformité
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const complianceDocumentsCollection: CollectionOptions = {
  name: COLLECTIONS.COMPLIANCE_DOCUMENTS,
  title: 'Documents de Conformité',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de document',
        'x-component': 'Select',
        enum: [
          { label: 'Extrait Kbis', value: 'kbis' },
          { label: 'Certificat INSEE', value: 'insee' },
          { label: 'Attestation URSSAF', value: 'urssaf' },
          { label: 'Attestation fiscale', value: 'fiscal' },
          { label: 'Assurance RC Pro', value: 'insurance_rc' },
          { label: 'Assurance décennale', value: 'insurance_decennale' },
          { label: 'Carte d\'identité', value: 'id_card' },
          { label: 'Passeport', value: 'passport' },
          { label: 'Permis de travail', value: 'work_permit' },
          { label: 'Diplôme', value: 'diploma' },
          { label: 'Certification', value: 'certification' },
          { label: 'CV', value: 'cv' },
          { label: 'RIB', value: 'bank_details' },
          { label: 'Justificatif de domicile', value: 'proof_of_address' },
          { label: 'Autre', value: 'other' }
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
          { label: 'Valide', value: 'valid' },
          { label: 'Expiré', value: 'expired' },
          { label: 'Rejeté', value: 'rejected' },
          { label: 'Expire bientôt', value: 'expiring_soon' }
        ]
      }
    },
    {
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom du document',
        'x-component': 'Input'
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

    // Propriétaire (organisation OU utilisateur)
    {
      name: 'organization_id',
      type: 'uuid',
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
    {
      name: 'user_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Utilisateur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'user_id'
    },

    // Fichier
    {
      name: 'document_url',
      type: 'string',
      interface: 'attachment',
      uiSchema: {
        title: 'Document',
        'x-component': 'Upload.Attachment'
      }
    },
    {
      name: 'file_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom du fichier',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'file_size',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Taille (octets)',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    },
    {
      name: 'mime_type',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Type MIME',
        'x-component': 'Input',
        'x-read-pretty': true
      }
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
      name: 'expiry_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'expiration',
        'x-component': 'DatePicker'
      }
    },

    // Détails spécifiques
    {
      name: 'reference_number',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Numéro de référence',
        'x-component': 'Input'
      }
    },
    {
      name: 'issuing_authority',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Organisme émetteur',
        'x-component': 'Input'
      }
    },

    // Validation
    {
      name: 'validated_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'validated_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'validated_by_id'
    },
    {
      name: 'validated_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de validation',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'rejection_reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Motif de rejet',
        'x-component': 'Input.TextArea'
      }
    },

    // Upload
    {
      name: 'uploaded_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'uploaded_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'uploaded_by_id'
    },

    // Rappels
    {
      name: 'reminder_sent_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Dernier rappel envoyé',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'reminder_count',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de rappels',
        'x-component': 'InputNumber'
      }
    },

    // Notes
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes',
        'x-component': 'Input.TextArea'
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
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['organization_id'] },
    { fields: ['user_id'] },
    { fields: ['expiry_date'] },
    { fields: ['organization_id', 'type'] },
    { fields: ['user_id', 'type'] }
  ]
};
