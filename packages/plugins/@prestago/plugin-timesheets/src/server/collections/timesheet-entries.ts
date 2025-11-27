// =============================================================================
// PRESTAGO - Plugin Timesheets - Collection: Entrées de CRA
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const timesheetEntriesCollection: CollectionOptions = {
  name: COLLECTIONS.TIMESHEET_ENTRIES,
  title: 'Entrées de CRA',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'timesheet_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'CRA',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'timesheet',
      type: 'belongsTo',
      target: COLLECTIONS.TIMESHEETS,
      foreignKey: 'timesheet_id'
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
      name: 'day_of_week',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jour de la semaine',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'day_type',
      type: 'string',
      defaultValue: 'worked',
      interface: 'select',
      uiSchema: {
        title: 'Type de jour',
        'x-component': 'Select',
        enum: [
          { label: 'Travaillé', value: 'worked' },
          { label: 'Week-end', value: 'weekend' },
          { label: 'Férié', value: 'holiday' },
          { label: 'Congé payé', value: 'vacation' },
          { label: 'Maladie', value: 'sick_leave' },
          { label: 'RTT', value: 'rtt' },
          { label: 'Sans solde', value: 'unpaid' },
          { label: 'Télétravail', value: 'remote' },
          { label: 'Sur site', value: 'onsite' },
          { label: 'Formation', value: 'training' },
          { label: 'Autre', value: 'other' }
        ]
      }
    },

    // Temps travaillé
    {
      name: 'hours_worked',
      type: 'decimal',
      precision: 4,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Heures travaillées',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 24,
          step: 0.5,
          precision: 2
        }
      }
    },
    {
      name: 'day_fraction',
      type: 'decimal',
      precision: 3,
      scale: 2,
      defaultValue: 0,
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

    // Lieu de travail
    {
      name: 'work_location',
      type: 'string',
      defaultValue: 'onsite',
      interface: 'select',
      uiSchema: {
        title: 'Lieu de travail',
        'x-component': 'Select',
        enum: [
          { label: 'Sur site', value: 'onsite' },
          { label: 'Télétravail', value: 'remote' },
          { label: 'Déplacement', value: 'travel' }
        ]
      }
    },

    // Description
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

    // Facturable
    {
      name: 'is_billable',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Facturable',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'billable_hours',
      type: 'decimal',
      precision: 4,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Heures facturables',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'billable_day_fraction',
      type: 'decimal',
      precision: 3,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Fraction jour facturable',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },

    // Heures supplémentaires
    {
      name: 'overtime_hours',
      type: 'decimal',
      precision: 4,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Heures supplémentaires',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'overtime_approved',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'HS approuvées',
        'x-component': 'Checkbox'
      }
    },

    // Horaires détaillés (optionnel)
    {
      name: 'start_time',
      type: 'time',
      interface: 'timePicker',
      uiSchema: {
        title: 'Heure de début',
        'x-component': 'TimePicker'
      }
    },
    {
      name: 'end_time',
      type: 'time',
      interface: 'timePicker',
      uiSchema: {
        title: 'Heure de fin',
        'x-component': 'TimePicker'
      }
    },
    {
      name: 'break_duration',
      type: 'decimal',
      precision: 3,
      scale: 2,
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Pause (heures)',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
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
    { fields: ['timesheet_id'] },
    { fields: ['date'] },
    { fields: ['day_type'] },
    { fields: ['timesheet_id', 'date'], unique: true }
  ]
};
