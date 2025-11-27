// =============================================================================
// PRESTAGO - Plugin Timesheets - Collection: Absences
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const absencesCollection: CollectionOptions = {
  name: COLLECTIONS.ABSENCES,
  title: 'Absences',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type d\'absence',
        'x-component': 'Select',
        enum: [
          { label: 'Congé payé', value: 'vacation' },
          { label: 'Arrêt maladie', value: 'sick_leave' },
          { label: 'RTT', value: 'rtt' },
          { label: 'Sans solde', value: 'unpaid' },
          { label: 'Maternité', value: 'maternity' },
          { label: 'Paternité', value: 'paternity' },
          { label: 'Événement familial', value: 'family_event' },
          { label: 'Formation', value: 'training' },
          { label: 'Autre', value: 'other' }
        ]
      }
    },
    {
      name: 'start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'start_half_day',
      type: 'string',
      defaultValue: 'full',
      interface: 'select',
      uiSchema: {
        title: 'Début',
        'x-component': 'Select',
        enum: [
          { label: 'Journée complète', value: 'full' },
          { label: 'Matin', value: 'morning' },
          { label: 'Après-midi', value: 'afternoon' }
        ]
      }
    },
    {
      name: 'end_half_day',
      type: 'string',
      defaultValue: 'full',
      interface: 'select',
      uiSchema: {
        title: 'Fin',
        'x-component': 'Select',
        enum: [
          { label: 'Journée complète', value: 'full' },
          { label: 'Matin', value: 'morning' },
          { label: 'Après-midi', value: 'afternoon' }
        ]
      }
    },
    {
      name: 'total_days',
      type: 'decimal',
      precision: 5,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de jours',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Motif',
        'x-component': 'Input.TextArea'
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
          { label: 'En attente', value: 'pending' },
          { label: 'Approuvée', value: 'approved' },
          { label: 'Rejetée', value: 'rejected' },
          { label: 'Annulée', value: 'cancelled' }
        ]
      }
    },
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

    // Pièce justificative
    {
      name: 'attachments',
      type: 'json',
      defaultValue: [],
      interface: 'attachment',
      uiSchema: {
        title: 'Justificatifs',
        'x-component': 'Upload.Attachment'
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
    { fields: ['consultant_id'] },
    { fields: ['mission_id'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['start_date', 'end_date'] }
  ]
};
