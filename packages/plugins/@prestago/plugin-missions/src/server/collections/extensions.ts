// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Extensions de mission
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const extensionsCollection: CollectionOptions = {
  name: COLLECTIONS.EXTENSIONS,
  title: 'Extensions de mission',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
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
      target: COLLECTIONS.MISSIONS,
      foreignKey: 'mission_id'
    },
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Extension de durée', value: 'duration' },
          { label: 'Extension de périmètre', value: 'scope' },
          { label: 'Modification de tarif', value: 'rate' },
          { label: 'Combinée', value: 'combined' }
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
          { label: 'En attente d\'approbation', value: 'pending_approval' },
          { label: 'Approuvée', value: 'approved' },
          { label: 'Rejetée', value: 'rejected' },
          { label: 'Appliquée', value: 'applied' }
        ]
      }
    },

    // Extension de durée
    {
      name: 'original_end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin originale',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'new_end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Nouvelle date de fin',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'additional_days',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours additionnels',
        'x-component': 'InputNumber'
      }
    },

    // Modification de tarif
    {
      name: 'original_daily_rate',
      type: 'decimal',
      precision: 10,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM original',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'new_daily_rate',
      type: 'decimal',
      precision: 10,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nouveau TJM',
        'x-component': 'InputNumber'
      }
    },

    // Extension de périmètre
    {
      name: 'scope_changes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Modifications du périmètre',
        'x-component': 'Input.TextArea'
      }
    },

    // Budget additionnel
    {
      name: 'additional_budget',
      type: 'decimal',
      precision: 12,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Budget additionnel',
        'x-component': 'InputNumber'
      }
    },

    // Justification
    {
      name: 'reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Justification',
        'x-component': 'Input.TextArea'
      }
    },

    // Demandeur
    {
      name: 'requested_by_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Demandé par',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'requested_by',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'requested_by_id'
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

    // Approbateur
    {
      name: 'approved_by_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Approuvé par',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'approved_by',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'approved_by_id'
    },
    {
      name: 'approved_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date d\'approbation',
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
    {
      name: 'applied_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date d\'application',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
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
    { fields: ['mission_id'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['requested_by_id'] }
  ]
};
