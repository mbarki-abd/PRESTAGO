// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Views (Analytics)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_VIEWS,
  title: 'Vues RFP',
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
      name: 'viewer_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Utilisateur (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'viewer_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'viewer_user_id',
      targetKey: 'id',
    },
    {
      name: 'viewer_profile_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Profil consultant (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'viewer_profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'viewer_profile_id',
      targetKey: 'id',
    },
    {
      name: 'viewer_organization_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Organisation (ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'viewer_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'viewer_organization_id',
      targetKey: 'id',
    },
    {
      name: 'ip_address',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Adresse IP',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'user_agent',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'User Agent',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'referer',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Referer',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'duration_seconds',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Durée (secondes)',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'viewed_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Vu le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['rfp_id'] },
    { fields: ['viewer_user_id'] },
    { fields: ['viewer_profile_id'] },
    { fields: ['viewed_at'] },
  ],
} as CollectionOptions;
