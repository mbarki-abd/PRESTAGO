// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Documents
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_DOCUMENTS,
  title: 'Documents RFP',
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de document',
        'x-component': 'Select',
        enum: [
          { value: 'specification', label: 'Cahier des charges' },
          { value: 'context', label: 'Document de contexte' },
          { value: 'contract_template', label: 'Modèle de contrat' },
          { value: 'nda', label: 'NDA' },
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
      name: 'is_public',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Visible avant candidature',
        'x-component': 'Checkbox',
      },
      defaultValue: true,
    },
    {
      name: 'requires_nda',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Nécessite NDA',
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
    { fields: ['rfp_id'] },
    { fields: ['type'] },
  ],
} as CollectionOptions;
