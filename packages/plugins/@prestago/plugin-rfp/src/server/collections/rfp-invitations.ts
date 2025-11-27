// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Invitations
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_INVITATIONS,
  title: 'Invitations RFP',
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
      name: 'invited_organization_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Organisation invitée (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'invited_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'invited_organization_id',
      targetKey: 'id',
    },
    {
      name: 'invited_profile_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Profil invité (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'invited_profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'invited_profile_id',
      targetKey: 'id',
    },
    {
      name: 'invited_by_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Invité par (user ID)',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'invited_by_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'invited_by_user_id',
      targetKey: 'id',
    },
    {
      name: 'message',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Message d\'invitation',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { value: 'pending', label: 'En attente' },
          { value: 'accepted', label: 'Acceptée' },
          { value: 'declined', label: 'Refusée' },
          { value: 'expired', label: 'Expirée' },
        ],
      },
      defaultValue: 'pending',
    },
    {
      name: 'responded_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Répondu le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Invité le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'expires_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Expire le',
        'x-component': 'DatePicker',
      },
    },
  ],
  indexes: [
    { fields: ['rfp_id'] },
    { fields: ['invited_organization_id'] },
    { fields: ['invited_profile_id'] },
    { fields: ['status'] },
    { fields: ['expires_at'] },
  ],
} as CollectionOptions;
