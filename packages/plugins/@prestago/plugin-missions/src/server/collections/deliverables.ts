// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Livrables
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const deliverablesCollection: CollectionOptions = {
  name: COLLECTIONS.DELIVERABLES,
  title: 'Livrables',
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
      name: 'milestone_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Jalon',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'milestone',
      type: 'belongsTo',
      target: COLLECTIONS.MILESTONES,
      foreignKey: 'milestone_id'
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Document', value: 'document' },
          { label: 'Code', value: 'code' },
          { label: 'Présentation', value: 'presentation' },
          { label: 'Rapport', value: 'report' },
          { label: 'Prototype', value: 'prototype' },
          { label: 'Formation', value: 'training' },
          { label: 'Support', value: 'support' },
          { label: 'Autre', value: 'other' }
        ]
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
      name: 'submitted_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de soumission',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'approved_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'approbation',
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
          { label: 'Soumis', value: 'submitted' },
          { label: 'En revue', value: 'under_review' },
          { label: 'Approuvé', value: 'approved' },
          { label: 'Rejeté', value: 'rejected' },
          { label: 'Révision demandée', value: 'revision_requested' }
        ]
      }
    },
    {
      name: 'file_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'Fichier',
        'x-component': 'Upload.URL'
      }
    },
    {
      name: 'attachments',
      type: 'json',
      defaultValue: [],
      interface: 'attachment',
      uiSchema: {
        title: 'Pièces jointes',
        'x-component': 'Upload.Attachment'
      }
    },
    {
      name: 'reviewer_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Réviseur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'reviewer',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'reviewer_id'
    },
    {
      name: 'review_comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires de revue',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'version',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Version',
        'x-component': 'InputNumber'
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
    },
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'createdBy'
    }
  ],
  indexes: [
    { fields: ['mission_id'] },
    { fields: ['milestone_id'] },
    { fields: ['status'] },
    { fields: ['due_date'] },
    { fields: ['type'] }
  ]
};
