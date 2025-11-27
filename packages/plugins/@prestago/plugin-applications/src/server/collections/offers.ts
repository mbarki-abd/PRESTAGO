// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Offers
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.OFFERS,
  title: 'Offres',
  fields: [
    {
      name: 'application_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Candidature ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'application',
      type: 'belongsTo',
      target: COLLECTIONS.APPLICATIONS,
      foreignKey: 'application_id',
      targetKey: 'id',
    },
    {
      name: 'rfp_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'RFP ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'rfp',
      type: 'belongsTo',
      target: 'prestago_rfps',
      foreignKey: 'rfp_id',
      targetKey: 'id',
    },
    {
      name: 'profile_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Profil ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'profile_id',
      targetKey: 'id',
    },

    // Status
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { value: 'draft', label: 'Brouillon' },
          { value: 'pending_approval', label: 'En attente d\'approbation' },
          { value: 'approved', label: 'Approuvée' },
          { value: 'sent', label: 'Envoyée' },
          { value: 'viewed', label: 'Vue' },
          { value: 'accepted', label: 'Acceptée' },
          { value: 'declined', label: 'Refusée' },
          { value: 'expired', label: 'Expirée' },
          { value: 'withdrawn', label: 'Retirée' },
        ],
      },
      defaultValue: 'draft',
    },

    // Offer details
    {
      name: 'position_title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Titre du poste',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'daily_rate',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, precision: 2 },
        required: true,
      },
    },
    {
      name: 'rate_currency',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Devise',
        'x-component': 'Input',
      },
      defaultValue: 'EUR',
    },

    // Dates
    {
      name: 'start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début',
        'x-component': 'DatePicker',
        required: true,
      },
    },
    {
      name: 'end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'duration_months',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Durée (mois)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1 },
      },
    },

    // Work conditions
    {
      name: 'work_mode',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Mode de travail',
        'x-component': 'Select',
        enum: [
          { value: 'onsite', label: 'Sur site' },
          { value: 'remote', label: 'Télétravail' },
          { value: 'hybrid', label: 'Hybride' },
        ],
        required: true,
      },
    },
    {
      name: 'remote_percentage',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: '% Télétravail',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, max: 100 },
      },
    },
    {
      name: 'location',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Lieu',
        'x-component': 'Input',
      },
    },
    {
      name: 'contract_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de contrat',
        'x-component': 'Select',
        enum: [
          { value: 'freelance', label: 'Freelance' },
          { value: 'portage', label: 'Portage' },
          { value: 'cdi', label: 'CDI' },
          { value: 'cdd', label: 'CDD' },
        ],
        required: true,
      },
    },

    // Terms
    {
      name: 'notice_period_days',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Préavis (jours)',
        'x-component': 'InputNumber',
      },
    },
    {
      name: 'termination_clause',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Clause de résiliation',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'special_conditions',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Conditions particulières',
        'x-component': 'Input.TextArea',
      },
    },

    // Approval workflow
    {
      name: 'approved_by_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Approuvé par (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'approved_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'approved_by_id',
      targetKey: 'id',
    },
    {
      name: 'approved_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Approuvée le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },

    // Sending
    {
      name: 'sent_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Envoyée le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'sent_by_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Envoyée par (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'sent_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'sent_by_id',
      targetKey: 'id',
    },
    {
      name: 'viewed_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Vue le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },

    // Response
    {
      name: 'response_deadline',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date limite de réponse',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'responded_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Répondu le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'response_comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires de réponse',
        'x-component': 'Input.TextArea',
      },
    },

    // Documents
    {
      name: 'offer_document_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'Document d\'offre',
        'x-component': 'Input.URL',
      },
    },
    {
      name: 'signed_document_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'Document signé',
        'x-component': 'Input.URL',
      },
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Créé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt',
      uiSchema: {
        title: 'Modifié le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['application_id'] },
    { fields: ['rfp_id'] },
    { fields: ['profile_id'] },
    { fields: ['status'] },
    { fields: ['response_deadline'] },
  ],
} as CollectionOptions;
