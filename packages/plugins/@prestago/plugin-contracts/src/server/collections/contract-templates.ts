// =============================================================================
// PRESTAGO - Plugin Contracts - Collection: Modèles de Contrat
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const contractTemplatesCollection: CollectionOptions = {
  name: COLLECTIONS.CONTRACT_TEMPLATES,
  title: 'Modèles de Contrat',
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
        title: 'Type de contrat',
        'x-component': 'Select',
        enum: [
          { label: 'Contrat de prestation', value: 'service_agreement' },
          { label: 'Contrat cadre', value: 'framework_agreement' },
          { label: 'Avenant', value: 'amendment' },
          { label: 'CDI', value: 'cdi' },
          { label: 'CDD', value: 'cdd' },
          { label: 'Freelance', value: 'freelance' },
          { label: 'Portage salarial', value: 'portage' },
          { label: 'NDA', value: 'nda' },
          { label: 'Partenariat', value: 'partnership' },
          { label: 'Sous-traitance', value: 'subcontracting' }
        ]
      }
    },
    {
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nom du modèle',
        'x-component': 'Input'
      }
    },
    {
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Description',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'content',
      type: 'text',
      interface: 'richText',
      uiSchema: {
        title: 'Contenu du modèle',
        'x-component': 'RichText'
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
      name: 'clauses',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Clauses incluses',
        'x-component': 'Input.JSON'
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
    {
      name: 'is_default',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Modèle par défaut',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'version',
      type: 'integer',
      defaultValue: 1,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Version',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    },

    // Organisation propriétaire (optionnel, si null = modèle global)
    {
      name: 'organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Organisation propriétaire',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'organization_id'
    },

    // Langue
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

    // Métadonnées
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
    { fields: ['is_active'] },
    { fields: ['organization_id'] },
    { fields: ['type', 'is_default'] },
    { fields: ['type', 'language'] }
  ]
};
