// =============================================================================
// PRESTAGO - Plugin Contracts - Collection: Clauses
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const clausesCollection: CollectionOptions = {
  name: COLLECTIONS.CLAUSES,
  title: 'Clauses Contractuelles',
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de clause',
        'x-component': 'Select',
        enum: [
          { label: 'Standard', value: 'standard' },
          { label: 'Confidentialité', value: 'confidentiality' },
          { label: 'Non-concurrence', value: 'non_compete' },
          { label: 'Propriété intellectuelle', value: 'intellectual_property' },
          { label: 'Responsabilité', value: 'liability' },
          { label: 'Résiliation', value: 'termination' },
          { label: 'Paiement', value: 'payment' },
          { label: 'Pénalités', value: 'penalties' },
          { label: 'Force majeure', value: 'force_majeure' },
          { label: 'Litiges', value: 'dispute' },
          { label: 'RGPD', value: 'gdpr' },
          { label: 'Personnalisée', value: 'custom' }
        ]
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
      name: 'content',
      type: 'text',
      interface: 'richText',
      uiSchema: {
        title: 'Contenu',
        'x-component': 'RichText'
      }
    },
    {
      name: 'is_mandatory',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Obligatoire',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'risk_level',
      type: 'string',
      defaultValue: 'low',
      interface: 'select',
      uiSchema: {
        title: 'Niveau de risque',
        'x-component': 'Select',
        enum: [
          { label: 'Faible', value: 'low' },
          { label: 'Moyen', value: 'medium' },
          { label: 'Élevé', value: 'high' },
          { label: 'Critique', value: 'critical' }
        ]
      }
    },
    {
      name: 'applicable_contract_types',
      type: 'json',
      defaultValue: [],
      interface: 'multipleSelect',
      uiSchema: {
        title: 'Types de contrat applicables',
        'x-component': 'Select',
        'x-component-props': { mode: 'multiple' },
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
      name: 'is_active',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Active',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'order',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Ordre d\'affichage',
        'x-component': 'InputNumber'
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

    // Notes juridiques
    {
      name: 'legal_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes juridiques',
        'x-component': 'Input.TextArea'
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
    { fields: ['code'], unique: true },
    { fields: ['type'] },
    { fields: ['is_active'] },
    { fields: ['is_mandatory'] },
    { fields: ['risk_level'] },
    { fields: ['type', 'language'] }
  ]
};
