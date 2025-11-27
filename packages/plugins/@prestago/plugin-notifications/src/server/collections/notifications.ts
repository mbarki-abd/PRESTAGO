// =============================================================================
// PRESTAGO - Plugin Notifications - Collection: Notifications
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const notificationsCollection: CollectionOptions = {
  name: COLLECTIONS.NOTIFICATIONS,
  title: 'Notifications',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select'
      }
    },
    {
      name: 'channel',
      type: 'string',
      defaultValue: 'in_app',
      interface: 'select',
      uiSchema: {
        title: 'Canal',
        'x-component': 'Select',
        enum: [
          { label: 'Application', value: 'in_app' },
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms' },
          { label: 'Push', value: 'push' }
        ]
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
      name: 'status',
      type: 'string',
      defaultValue: 'pending',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'En attente', value: 'pending' },
          { label: 'Envoyée', value: 'sent' },
          { label: 'Délivrée', value: 'delivered' },
          { label: 'Lue', value: 'read' },
          { label: 'Échec', value: 'failed' },
          { label: 'Archivée', value: 'archived' }
        ]
      }
    },

    // Destinataire
    {
      name: 'recipient_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Destinataire',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'recipient',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'recipient_id'
    },

    // Expéditeur (optionnel)
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

    // Contenu
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
      interface: 'textarea',
      uiSchema: {
        title: 'Contenu',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'data',
      type: 'json',
      defaultValue: {},
      interface: 'json',
      uiSchema: {
        title: 'Données',
        'x-component': 'Input.JSON'
      }
    },

    // Lien d'action
    {
      name: 'action_url',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'URL d\'action',
        'x-component': 'Input'
      }
    },
    {
      name: 'action_label',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Label d\'action',
        'x-component': 'Input'
      }
    },

    // Dates
    {
      name: 'scheduled_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Programmée pour',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'sent_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Envoyée le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'delivered_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Délivrée le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'read_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Lue le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'expires_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Expire le',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },

    // Erreur
    {
      name: 'error_message',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Message d\'erreur',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'retry_count',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Tentatives',
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
    }
  ],
  indexes: [
    { fields: ['recipient_id'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['channel'] },
    { fields: ['recipient_id', 'status'] },
    { fields: ['scheduled_at'] },
    { fields: ['created_at'] }
  ]
};
