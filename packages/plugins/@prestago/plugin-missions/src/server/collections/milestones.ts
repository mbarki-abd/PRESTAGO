// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Jalons (Milestones)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const milestonesCollection: CollectionOptions = {
  name: COLLECTIONS.MILESTONES,
  title: 'Jalons',
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
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom',
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
      name: 'completed_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de complétion',
        'x-component': 'DatePicker'
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
          { label: 'En cours', value: 'in_progress' },
          { label: 'Terminé', value: 'completed' },
          { label: 'En retard', value: 'overdue' },
          { label: 'Annulé', value: 'cancelled' }
        ]
      }
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
      name: 'deliverables_required',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Livrables requis',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'payment_trigger',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Déclenche un paiement',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'payment_percentage',
      type: 'decimal',
      precision: 5,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: '% du paiement',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 100,
          addonAfter: '%'
        }
      }
    },

    // Livrables associés
    {
      name: 'deliverables',
      type: 'hasMany',
      target: COLLECTIONS.DELIVERABLES,
      foreignKey: 'milestone_id'
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
    { fields: ['due_date'] },
    { fields: ['mission_id', 'order'] }
  ]
};
