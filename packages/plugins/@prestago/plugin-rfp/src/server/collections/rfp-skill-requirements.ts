// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP Skill Requirements
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_SKILL_REQUIREMENTS,
  title: 'Compétences requises pour RFP',
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
      name: 'skill_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Compétence ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'skill',
      type: 'belongsTo',
      target: 'prestago_skills',
      foreignKey: 'skill_id',
      targetKey: 'id',
    },
    {
      name: 'requirement_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de requirement',
        'x-component': 'Select',
        enum: [
          { value: 'mandatory', label: 'Obligatoire' },
          { value: 'preferred', label: 'Préférée' },
          { value: 'nice_to_have', label: 'Appréciée' },
        ],
        required: true,
      },
      defaultValue: 'mandatory',
    },
    {
      name: 'minimum_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Niveau minimum',
        'x-component': 'Select',
        enum: [
          { value: 'beginner', label: 'Débutant' },
          { value: 'intermediate', label: 'Intermédiaire' },
          { value: 'advanced', label: 'Avancé' },
          { value: 'expert', label: 'Expert' },
        ],
      },
    },
    {
      name: 'minimum_years',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Années minimum',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, max: 30 },
      },
    },
    {
      name: 'weight',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Poids (matching)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 10 },
      },
      defaultValue: 5,
    },
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes',
        'x-component': 'Input.TextArea',
      },
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
  ],
  indexes: [
    { fields: ['rfp_id', 'skill_id'], unique: true },
    { fields: ['requirement_type'] },
  ],
} as CollectionOptions;
