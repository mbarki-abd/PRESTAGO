// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Évaluations de mission
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const evaluationsCollection: CollectionOptions = {
  name: COLLECTIONS.EVALUATIONS,
  title: 'Évaluations de mission',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'mission_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Mission',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'mission',
      type: 'belongsTo',
      target: COLLECTIONS.MISSIONS,
      foreignKey: 'mission_id'
    },
    {
      name: 'evaluator_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Évaluateur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'evaluator',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'evaluator_id'
    },
    {
      name: 'evaluator_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type d\'évaluateur',
        'x-component': 'Select',
        enum: [
          { label: 'Client', value: 'client' },
          { label: 'Consultant', value: 'consultant' }
        ]
      }
    },
    {
      name: 'evaluation_period',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Période d\'évaluation',
        'x-component': 'Select',
        enum: [
          { label: 'Intermédiaire', value: 'interim' },
          { label: 'Finale', value: 'final' }
        ]
      }
    },

    // Scores (1-5)
    {
      name: 'quality_score',
      type: 'integer',
      interface: 'rate',
      uiSchema: {
        title: 'Qualité du travail',
        'x-component': 'Rate',
        'x-component-props': { count: 5 }
      }
    },
    {
      name: 'communication_score',
      type: 'integer',
      interface: 'rate',
      uiSchema: {
        title: 'Communication',
        'x-component': 'Rate',
        'x-component-props': { count: 5 }
      }
    },
    {
      name: 'reliability_score',
      type: 'integer',
      interface: 'rate',
      uiSchema: {
        title: 'Fiabilité',
        'x-component': 'Rate',
        'x-component-props': { count: 5 }
      }
    },
    {
      name: 'expertise_score',
      type: 'integer',
      interface: 'rate',
      uiSchema: {
        title: 'Expertise technique',
        'x-component': 'Rate',
        'x-component-props': { count: 5 }
      }
    },
    {
      name: 'collaboration_score',
      type: 'integer',
      interface: 'rate',
      uiSchema: {
        title: 'Collaboration',
        'x-component': 'Rate',
        'x-component-props': { count: 5 }
      }
    },
    {
      name: 'overall_score',
      type: 'decimal',
      precision: 3,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Score global',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    },

    // Feedback qualitatif
    {
      name: 'strengths',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Points forts',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'improvements',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Axes d\'amélioration',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'comments',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaires',
        'x-component': 'Input.TextArea'
      }
    },

    // Recommandations
    {
      name: 'would_recommend',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Recommanderait',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'would_work_again',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Retravaillerait ensemble',
        'x-component': 'Checkbox'
      }
    },

    // Visibilité
    {
      name: 'is_public',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Évaluation publique',
        'x-component': 'Checkbox'
      }
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
    { fields: ['mission_id'] },
    { fields: ['evaluator_id'] },
    { fields: ['evaluator_type'] },
    { fields: ['mission_id', 'evaluator_id'], unique: true }
  ]
};
