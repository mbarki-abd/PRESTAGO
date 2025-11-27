// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Application Documents
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.APPLICATION_DOCUMENTS,
  title: 'Documents de candidature',
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de document',
        'x-component': 'Select',
        enum: [
          { value: 'cv', label: 'CV' },
          { value: 'cover_letter', label: 'Lettre de motivation' },
          { value: 'portfolio', label: 'Portfolio' },
          { value: 'certification', label: 'Certification' },
          { value: 'reference', label: 'Référence' },
          { value: 'other', label: 'Autre' },
        ],
        required: true,
      },
    },
    {
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom du document',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Description',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'file_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'URL du fichier',
        'x-component': 'Input.URL',
        required: true,
      },
    },
    {
      name: 'file_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom du fichier',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'file_size',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Taille (bytes)',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'file_mime_type',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Type MIME',
        'x-component': 'Input',
      },
    },
    {
      name: 'is_primary',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Document principal',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    {
      name: 'uploaded_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Téléversé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['application_id'] },
    { fields: ['type'] },
  ],
} as CollectionOptions;
