// =============================================================================
// PRESTAGO - Plugin Contracts - Collection: Contrats
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const contractsCollection: CollectionOptions = {
  name: COLLECTIONS.CONTRACTS,
  title: 'Contrats',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'reference',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Référence',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de contrat',
        'x-component': 'Select',
        enum: [
          { label: 'Contrat de prestation', value: 'service_agreement' },
          { label: 'Contrat cadre', value: 'framework_agreement' },
          { label: 'Avenant', value: 'amendment' },
          { label: 'CDI', value: 'cdi' },
          { label: 'CDD', value: 'cdd' },
          { label: 'Freelance', value: 'freelance' },
          { label: 'Portage salarial', value: 'portage' },
          { label: 'NDA', value: 'nda' },
          { label: 'Partenariat', value: 'partnership' },
          { label: 'Sous-traitance', value: 'subcontracting' }
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
          { label: 'En révision', value: 'pending_review' },
          { label: 'En approbation', value: 'pending_approval' },
          { label: 'En signature', value: 'pending_signature' },
          { label: 'Actif', value: 'active' },
          { label: 'Suspendu', value: 'suspended' },
          { label: 'Expiré', value: 'expired' },
          { label: 'Résilié', value: 'terminated' },
          { label: 'Annulé', value: 'cancelled' }
        ]
      }
    },
    {
      name: 'title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Titre',
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

    // Relations - Partie A (Client)
    {
      name: 'party_a_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Partie A (Organisation)',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'party_a_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'party_a_organization_id'
    },
    {
      name: 'party_a_signatory_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Signataire A',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'party_a_signatory',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'party_a_signatory_id'
    },

    // Relations - Partie B (Prestataire)
    {
      name: 'party_b_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Partie B (Organisation)',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'party_b_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'party_b_organization_id'
    },
    {
      name: 'party_b_signatory_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Signataire B',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'party_b_signatory',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'party_b_signatory_id'
    },

    // Lien avec mission
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

    // Contrat parent (pour les avenants)
    {
      name: 'parent_contract_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Contrat parent',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'parent_contract',
      type: 'belongsTo',
      target: COLLECTIONS.CONTRACTS,
      foreignKey: 'parent_contract_id'
    },

    // Template utilisé
    {
      name: 'template_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Modèle',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'template',
      type: 'belongsTo',
      target: COLLECTIONS.CONTRACT_TEMPLATES,
      foreignKey: 'template_id'
    },

    // Dates
    {
      name: 'effective_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'effet',
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
    {
      name: 'termination_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de résiliation',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'signed_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de signature',
        'x-component': 'DatePicker'
      }
    },

    // Montants
    {
      name: 'total_value',
      type: 'decimal',
      precision: 12,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Valeur totale',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          precision: 2
        }
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
          { label: 'Euro (€)', value: 'EUR' },
          { label: 'Dollar ($)', value: 'USD' },
          { label: 'Livre (£)', value: 'GBP' },
          { label: 'Franc Suisse (CHF)', value: 'CHF' }
        ]
      }
    },

    // Documents
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
      name: 'signed_document_url',
      type: 'string',
      interface: 'attachment',
      uiSchema: {
        title: 'Document signé',
        'x-component': 'Upload.Attachment'
      }
    },
    {
      name: 'content',
      type: 'text',
      interface: 'richText',
      uiSchema: {
        title: 'Contenu',
        'x-component': 'RichText'
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
    {
      name: 'internal_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes internes',
        'x-component': 'Input.TextArea'
      }
    },

    // Versioning
    {
      name: 'version',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Version',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    },

    // Relations
    {
      name: 'signatures',
      type: 'hasMany',
      target: COLLECTIONS.SIGNATURES,
      foreignKey: 'contract_id'
    },
    {
      name: 'amendments',
      type: 'hasMany',
      target: COLLECTIONS.CONTRACTS,
      foreignKey: 'parent_contract_id'
    },

    // Audit
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'created_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'created_by_id'
    },
    {
      name: 'approved_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'approved_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'approved_by_id'
    },
    {
      name: 'approved_at',
      type: 'date',
      interface: 'datetime'
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
    { fields: ['reference'], unique: true },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['party_a_organization_id'] },
    { fields: ['party_b_organization_id'] },
    { fields: ['mission_id'] },
    { fields: ['effective_date'] },
    { fields: ['expiry_date'] }
  ]
};
