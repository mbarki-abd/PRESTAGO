// =============================================================================
// PRESTAGO - Plugin Notifications - Collection: Préférences
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const notificationPreferencesCollection: CollectionOptions = {
  name: COLLECTIONS.NOTIFICATION_PREFERENCES,
  title: 'Préférences de notification',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'user_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Utilisateur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'user_id'
    },
    {
      name: 'notification_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de notification',
        'x-component': 'Select'
      }
    },

    // Canaux activés
    {
      name: 'in_app_enabled',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Application',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'email_enabled',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Email',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'sms_enabled',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'SMS',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'push_enabled',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Push',
        'x-component': 'Checkbox'
      }
    },

    // Heures de silence
    {
      name: 'quiet_hours_enabled',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Heures de silence',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'quiet_hours_start',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Début',
        'x-component': 'TimePicker'
      }
    },
    {
      name: 'quiet_hours_end',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Fin',
        'x-component': 'TimePicker'
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
    { fields: ['user_id'] },
    { fields: ['notification_type'] },
    { fields: ['user_id', 'notification_type'], unique: true }
  ]
};

export const emailTemplatesCollection: CollectionOptions = {
  name: COLLECTIONS.EMAIL_TEMPLATES,
  title: 'Templates Email',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'code',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Code',
        'x-component': 'Input'
      }
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
      name: 'subject',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Sujet',
        'x-component': 'Input'
      }
    },
    {
      name: 'content_html',
      type: 'text',
      interface: 'richText',
      uiSchema: {
        title: 'Contenu HTML',
        'x-component': 'RichText'
      }
    },
    {
      name: 'content_text',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Contenu texte',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'variables',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Variables',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'language',
      type: 'string',
      defaultValue: 'fr',
      interface: 'select',
      uiSchema: {
        title: 'Langue',
        'x-component': 'Select',
        enum: [
          { label: 'Français', value: 'fr' },
          { label: 'English', value: 'en' }
        ]
      }
    },
    {
      name: 'is_active',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Actif',
        'x-component': 'Checkbox'
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
    { fields: ['code'], unique: true },
    { fields: ['is_active'] },
    { fields: ['code', 'language'] }
  ]
};
