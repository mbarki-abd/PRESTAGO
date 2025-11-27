// =============================================================================
// PRESTAGO - Plugin Timesheets - Collection: CRA
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const timesheetsCollection: CollectionOptions = {
  name: COLLECTIONS.TIMESHEETS,
  title: 'CRA',
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

    // Relations
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

    // Période
    {
      name: 'period_type',
      type: 'string',
      defaultValue: 'monthly',
      interface: 'select',
      uiSchema: {
        title: 'Type de période',
        'x-component': 'Select',
        enum: [
          { label: 'Hebdomadaire', value: 'weekly' },
          { label: 'Bihebdomadaire', value: 'biweekly' },
          { label: 'Mensuel', value: 'monthly' }
        ]
      }
    },
    {
      name: 'period_start',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Début de période',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'period_end',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Fin de période',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'year',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Année',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'month',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Mois',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'week_number',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Numéro de semaine',
        'x-component': 'InputNumber'
      }
    },

    // Totaux
    {
      name: 'total_worked_days',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours travaillés',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'total_worked_hours',
      type: 'decimal',
      precision: 6,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Heures travaillées',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'total_billable_days',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours facturables',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'total_billable_hours',
      type: 'decimal',
      precision: 6,
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
      name: 'total_absence_days',
      type: 'decimal',
      precision: 5,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours d\'absence',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'total_overtime_hours',
      type: 'decimal',
      precision: 6,
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
      name: 'total_amount',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Montant total',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2, addonAfter: '€' }
      }
    },

    // Statut et approbation
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
          { label: 'Approbation niveau 1', value: 'pending_level_1' },
          { label: 'Approbation niveau 2', value: 'pending_level_2' },
          { label: 'Approbation niveau 3', value: 'pending_level_3' },
          { label: 'Approuvé', value: 'approved' },
          { label: 'Rejeté', value: 'rejected' },
          { label: 'Révision demandée', value: 'revision_requested' }
        ]
      }
    },
    {
      name: 'current_approval_level',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Niveau d\'approbation actuel',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'required_approval_levels',
      type: 'integer',
      defaultValue: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Niveaux d\'approbation requis',
        'x-component': 'InputNumber'
      }
    },

    // Dates importantes
    {
      name: 'submitted_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Soumis le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'approved_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Approuvé le',
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
      name: 'revision_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes de révision',
        'x-component': 'Input.TextArea'
      }
    },

    // Commentaires
    {
      name: 'consultant_comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires consultant',
        'x-component': 'Input.TextArea'
      }
    },

    // Relations enfants
    {
      name: 'entries',
      type: 'hasMany',
      target: COLLECTIONS.TIMESHEET_ENTRIES,
      foreignKey: 'timesheet_id'
    },
    {
      name: 'approvals',
      type: 'hasMany',
      target: COLLECTIONS.TIMESHEET_APPROVALS,
      foreignKey: 'timesheet_id'
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
    },
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'createdBy'
    }
  ],
  indexes: [
    { fields: ['reference'], unique: true },
    { fields: ['consultant_id'] },
    { fields: ['mission_id'] },
    { fields: ['status'] },
    { fields: ['year', 'month'] },
    { fields: ['period_start', 'period_end'] },
    { fields: ['consultant_id', 'year', 'month'], unique: true }
  ]
};
