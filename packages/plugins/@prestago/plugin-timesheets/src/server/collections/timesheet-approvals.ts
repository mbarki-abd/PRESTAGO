// =============================================================================
// PRESTAGO - Plugin Timesheets - Collection: Approbations de CRA
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const timesheetApprovalsCollection: CollectionOptions = {
  name: COLLECTIONS.TIMESHEET_APPROVALS,
  title: 'Approbations de CRA',
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
      name: 'level',
      type: 'integer',
      interface: 'select',
      uiSchema: {
        title: 'Niveau',
        'x-component': 'Select',
        enum: [
          { label: 'Niveau 1 (Manager)', value: 1 },
          { label: 'Niveau 2 (Client)', value: 2 },
          { label: 'Niveau 3 (Admin)', value: 3 }
        ]
      }
    },
    {
      name: 'approver_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Approbateur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'approver',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'approver_id'
    },
    {
      name: 'decision',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Décision',
        'x-component': 'Select',
        enum: [
          { label: 'Approuvé', value: 'approved' },
          { label: 'Rejeté', value: 'rejected' },
          { label: 'Révision demandée', value: 'revision_requested' }
        ]
      }
    },
    {
      name: 'comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'decided_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Date de décision',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt'
    }
  ],
  indexes: [
    { fields: ['timesheet_id'] },
    { fields: ['approver_id'] },
    { fields: ['level'] },
    { fields: ['timesheet_id', 'level'], unique: true }
  ]
};
