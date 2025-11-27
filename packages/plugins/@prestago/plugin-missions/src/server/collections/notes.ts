// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Notes de mission
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const notesCollection: CollectionOptions = {
  name: COLLECTIONS.NOTES,
  title: 'Notes de mission',
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
      name: 'author_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Auteur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'author',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'author_id'
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: 'general',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Général', value: 'general' },
          { label: 'Avancement', value: 'progress' },
          { label: 'Problème', value: 'issue' },
          { label: 'Risque', value: 'risk' },
          { label: 'Décision', value: 'decision' },
          { label: 'Feedback', value: 'feedback' }
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
      name: 'content',
      type: 'text',
      interface: 'richText',
      uiSchema: {
        title: 'Contenu',
        'x-component': 'RichText'
      }
    },
    {
      name: 'is_private',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Note privée',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'is_pinned',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Épinglée',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'priority',
      type: 'string',
      defaultValue: 'normal',
      interface: 'select',
      uiSchema: {
        title: 'Priorité',
        'x-component': 'Select',
        enum: [
          { label: 'Basse', value: 'low' },
          { label: 'Normale', value: 'normal' },
          { label: 'Haute', value: 'high' },
          { label: 'Urgente', value: 'urgent' }
        ]
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
    { fields: ['author_id'] },
    { fields: ['type'] },
    { fields: ['is_pinned'] },
    { fields: ['created_at'] }
  ]
};
