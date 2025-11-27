// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Saved (Favorites/Bookmarks)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_SAVED,
  title: 'RFP Sauvegardés',
  fields: [
    {
      name: 'rfp_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'RFP ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'rfp',
      type: 'belongsTo',
      target: COLLECTIONS.RFPS,
      foreignKey: 'rfp_id',
      targetKey: 'id',
    },
    {
      name: 'user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Utilisateur ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'user_id',
      targetKey: 'id',
    },
    {
      name: 'profile_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Profil ID',
        'x-component': 'Input',
      },
    },
    {
      name: 'profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'profile_id',
      targetKey: 'id',
    },
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes personnelles',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'notify_on_update',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Notifier en cas de mise à jour',
        'x-component': 'Checkbox',
      },
      defaultValue: true,
    },
    {
      name: 'saved_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Sauvegardé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['rfp_id', 'user_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['profile_id'] },
    { fields: ['saved_at'] },
  ],
} as CollectionOptions;
