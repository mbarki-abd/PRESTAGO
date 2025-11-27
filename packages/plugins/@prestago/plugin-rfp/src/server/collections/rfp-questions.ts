// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Questions (Q&A)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_QUESTIONS,
  title: 'Questions RFP',
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
      name: 'asked_by_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Posée par (user ID)',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'asked_by_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'asked_by_user_id',
      targetKey: 'id',
    },
    {
      name: 'asked_by_organization_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Organisation du demandeur',
        'x-component': 'Input',
      },
    },
    {
      name: 'asked_by_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'asked_by_organization_id',
      targetKey: 'id',
    },
    {
      name: 'question',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Question',
        'x-component': 'Input.TextArea',
        required: true,
      },
    },
    {
      name: 'answer',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Réponse',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'answered_by_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Répondu par (user ID)',
        'x-component': 'Input',
      },
    },
    {
      name: 'answered_by_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'answered_by_user_id',
      targetKey: 'id',
    },
    {
      name: 'answered_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Répondu le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'is_public',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Visible par tous',
        'x-component': 'Checkbox',
      },
      defaultValue: true,
    },
    {
      name: 'is_anonymous',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Question anonyme',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Posée le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['rfp_id'] },
    { fields: ['asked_by_user_id'] },
    { fields: ['is_public'] },
    { fields: ['answered_at'] },
  ],
} as CollectionOptions;
