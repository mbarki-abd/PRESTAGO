// =============================================================================
// PRESTAGO - Plugin Notifications - Collection: Messages
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const messagesCollection: CollectionOptions = {
  name: COLLECTIONS.MESSAGES,
  title: 'Messages',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'conversation_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Conversation',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'conversation',
      type: 'belongsTo',
      target: COLLECTIONS.CONVERSATIONS,
      foreignKey: 'conversation_id'
    },
    {
      name: 'sender_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Expéditeur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'sender',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'sender_id'
    },
    {
      name: 'status',
      type: 'string',
      defaultValue: 'sent',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'Brouillon', value: 'draft' },
          { label: 'Envoyé', value: 'sent' },
          { label: 'Délivré', value: 'delivered' },
          { label: 'Lu', value: 'read' },
          { label: 'Supprimé', value: 'deleted' }
        ]
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
      name: 'attachments',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Pièces jointes',
        'x-component': 'Upload.Attachment'
      }
    },

    // Réponse à un message
    {
      name: 'reply_to_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'En réponse à',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'reply_to',
      type: 'belongsTo',
      target: COLLECTIONS.MESSAGES,
      foreignKey: 'reply_to_id'
    },

    // Dates
    {
      name: 'sent_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Envoyé le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'delivered_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Délivré le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },

    // Lecture par les participants
    {
      name: 'read_by',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Lu par',
        'x-component': 'Input.JSON'
      }
    },

    // Édition
    {
      name: 'is_edited',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Modifié',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'edited_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Modifié le',
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
    { fields: ['conversation_id'] },
    { fields: ['sender_id'] },
    { fields: ['status'] },
    { fields: ['sent_at'] },
    { fields: ['conversation_id', 'sent_at'] }
  ]
};
