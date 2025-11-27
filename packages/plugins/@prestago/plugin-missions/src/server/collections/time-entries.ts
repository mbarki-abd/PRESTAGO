// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Entrées de temps (préparation CRA)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const timeEntriesCollection: CollectionOptions = {
  name: COLLECTIONS.TIME_ENTRIES,
  title: 'Entrées de temps',
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
      name: 'consultant_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Consultant',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'consultant',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'consultant_id'
    },
    {
      name: 'date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'hours',
      type: 'decimal',
      precision: 4,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Heures',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 24,
          step: 0.5
        }
      }
    },
    {
      name: 'day_fraction',
      type: 'decimal',
      precision: 3,
      scale: 2,
      interface: 'select',
      uiSchema: {
        title: 'Fraction de jour',
        'x-component': 'Select',
        enum: [
          { label: '0', value: 0 },
          { label: '0.25', value: 0.25 },
          { label: '0.5', value: 0.5 },
          { label: '0.75', value: 0.75 },
          { label: '1', value: 1 }
        ]
      }
    },
    {
      name: 'work_type',
      type: 'string',
      defaultValue: 'regular',
      interface: 'select',
      uiSchema: {
        title: 'Type de travail',
        'x-component': 'Select',
        enum: [
          { label: 'Régulier', value: 'regular' },
          { label: 'Heures sup.', value: 'overtime' },
          { label: 'Nuit', value: 'night' },
          { label: 'Week-end', value: 'weekend' },
          { label: 'Férié', value: 'holiday' },
          { label: 'Astreinte', value: 'on_call' }
        ]
      }
    },
    {
      name: 'location',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Lieu',
        'x-component': 'Select',
        enum: [
          { label: 'Sur site', value: 'onsite' },
          { label: 'Télétravail', value: 'remote' },
          { label: 'Déplacement', value: 'travel' }
        ]
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
      name: 'task_reference',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Référence tâche',
        'x-component': 'Input'
      }
    },

    // Lien vers le CRA (sera utilisé par plugin-timesheets)
    {
      name: 'timesheet_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'CRA',
        'x-component': 'RecordPicker'
      }
    },

    // Statut
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
          { label: 'Soumis', value: 'submitted' },
          { label: 'Approuvé', value: 'approved' },
          { label: 'Rejeté', value: 'rejected' }
        ]
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
    { fields: ['consultant_id'] },
    { fields: ['date'] },
    { fields: ['timesheet_id'] },
    { fields: ['status'] },
    { fields: ['mission_id', 'consultant_id', 'date'], unique: true }
  ]
};
