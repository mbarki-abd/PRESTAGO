// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Evaluations
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.EVALUATIONS,
  title: 'Évaluations',
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
      name: 'evaluator_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Évaluateur ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'evaluator',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'evaluator_id',
      targetKey: 'id',
    },

    // Scores by category
    {
      name: 'score_technical_skills',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Compétences techniques',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_experience',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Expérience',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_communication',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Communication',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_cultural_fit',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Adéquation culturelle',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_motivation',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Motivation',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_availability',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Disponibilité',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'score_rate_fit',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Adéquation tarif',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },

    // Overall
    {
      name: 'overall_score',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Score global',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 },
        'x-read-pretty': true,
      },
    },
    {
      name: 'overall_rating',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Note globale',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },

    // Feedback
    {
      name: 'strengths',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Points forts',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
      },
    },
    {
      name: 'weaknesses',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Points faibles',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
      },
    },
    {
      name: 'recommendation',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Recommandation',
        'x-component': 'Select',
        enum: [
          { value: 'strong_hire', label: 'Recruter fortement' },
          { value: 'hire', label: 'Recruter' },
          { value: 'consider', label: 'À considérer' },
          { value: 'no_hire', label: 'Ne pas recruter' },
          { value: 'strong_no_hire', label: 'Ne pas recruter (fortement)' },
        ],
        required: true,
      },
    },
    {
      name: 'comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires',
        'x-component': 'Input.TextArea',
      },
    },

    // Timestamps
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
    { fields: ['application_id', 'evaluator_id'], unique: true },
    { fields: ['application_id'] },
    { fields: ['evaluator_id'] },
    { fields: ['recommendation'] },
  ],
} as CollectionOptions;
