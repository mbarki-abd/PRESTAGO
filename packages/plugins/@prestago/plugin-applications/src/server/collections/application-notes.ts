// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Application Notes
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.APPLICATION_NOTES,
  title: 'Notes de candidature',
  fields: [
    {
      name: 'application_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Candidature ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'application',
      type: 'belongsTo',
      target: COLLECTIONS.APPLICATIONS,
      foreignKey: 'application_id',
      targetKey: 'id',
    },
    {
      name: 'author_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Auteur ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'author',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'author_id',
      targetKey: 'id',
    },
    {
      name: 'content',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Contenu',
        'x-component': 'Input.TextArea',
        required: true,
      },
    },
    {
      name: 'is_private',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Note privée',
        'x-component': 'Checkbox',
      },
      defaultValue: true,
    },
    {
      name: 'is_pinned',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Épinglée',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Créé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt',
      uiSchema: {
        title: 'Modifié le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['application_id'] },
    { fields: ['author_id'] },
    { fields: ['is_pinned'] },
    { fields: ['created_at'] },
  ],
} as CollectionOptions;
