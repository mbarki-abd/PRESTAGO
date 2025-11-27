// =============================================================================
// PRESTAGO - Plugin Notifications - Collection: Conversations
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const conversationsCollection: CollectionOptions = {
  name: COLLECTIONS.CONVERSATIONS,
  title: 'Conversations',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: 'direct',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Direct', value: 'direct' },
          { label: 'Groupe', value: 'group' },
          { label: 'Mission', value: 'mission' },
          { label: 'RFP', value: 'rfp' },
          { label: 'Support', value: 'support' }
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

    // Liens avec entités
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
      name: 'rfp_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'RFP',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'rfp',
      type: 'belongsTo',
      target: 'prestago_rfps',
      foreignKey: 'rfp_id'
    },

    // Dernier message
    {
      name: 'last_message_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Dernier message',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'last_message_preview',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Aperçu',
        'x-component': 'Input'
      }
    },

    // Paramètres
    {
      name: 'is_archived',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Archivée',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'is_muted',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Muette',
        'x-component': 'Checkbox'
      }
    },

    // Relations
    {
      name: 'messages',
      type: 'hasMany',
      target: COLLECTIONS.MESSAGES,
      foreignKey: 'conversation_id'
    },
    {
      name: 'participants',
      type: 'hasMany',
      target: COLLECTIONS.CONVERSATION_PARTICIPANTS,
      foreignKey: 'conversation_id'
    },

    // Créateur
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'created_by',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'created_by_id'
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
    { fields: ['type'] },
    { fields: ['mission_id'] },
    { fields: ['rfp_id'] },
    { fields: ['last_message_at'] },
    { fields: ['is_archived'] }
  ]
};

export const conversationParticipantsCollection: CollectionOptions = {
  name: COLLECTIONS.CONVERSATION_PARTICIPANTS,
  title: 'Participants aux conversations',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'conversation_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'conversation',
      type: 'belongsTo',
      target: COLLECTIONS.CONVERSATIONS,
      foreignKey: 'conversation_id'
    },
    {
      name: 'user_id',
      type: 'uuid',
      interface: 'linkTo'
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'user_id'
    },
    {
      name: 'role',
      type: 'string',
      defaultValue: 'member',
      interface: 'select',
      uiSchema: {
        title: 'Rôle',
        'x-component': 'Select',
        enum: [
          { label: 'Admin', value: 'admin' },
          { label: 'Membre', value: 'member' }
        ]
      }
    },
    {
      name: 'joined_at',
      type: 'date',
      interface: 'datetime'
    },
    {
      name: 'last_read_at',
      type: 'date',
      interface: 'datetime'
    },
    {
      name: 'unread_count',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber'
    },
    {
      name: 'is_muted',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox'
    },
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt'
    }
  ],
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['user_id'] },
    { fields: ['conversation_id', 'user_id'], unique: true }
  ]
};
