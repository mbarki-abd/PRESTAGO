// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Historique de mission
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const historyCollection: CollectionOptions = {
  name: COLLECTIONS.HISTORY,
  title: 'Historique de mission',
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
      name: 'user_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Utilisateur',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'user_id'
    },
    {
      name: 'action',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Action',
        'x-component': 'Select',
        enum: [
          // Mission lifecycle
          { label: 'Création', value: 'created' },
          { label: 'Démarrage', value: 'started' },
          { label: 'Suspension', value: 'on_hold' },
          { label: 'Reprise', value: 'resumed' },
          { label: 'Complétion', value: 'completed' },
          { label: 'Annulation', value: 'cancelled' },
          { label: 'Terminaison', value: 'terminated' },
          // Modifications
          { label: 'Modification', value: 'updated' },
          { label: 'Extension', value: 'extended' },
          // Milestones
          { label: 'Jalon créé', value: 'milestone_created' },
          { label: 'Jalon complété', value: 'milestone_completed' },
          // Deliverables
          { label: 'Livrable soumis', value: 'deliverable_submitted' },
          { label: 'Livrable approuvé', value: 'deliverable_approved' },
          { label: 'Livrable rejeté', value: 'deliverable_rejected' },
          // Evaluations
          { label: 'Évaluation ajoutée', value: 'evaluation_added' },
          // Notes
          { label: 'Note ajoutée', value: 'note_added' }
        ]
      }
    },
    {
      name: 'entity_type',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Type d\'entité',
        'x-component': 'Input'
      }
    },
    {
      name: 'entity_id',
      type: 'uuid',
      interface: 'input',
      uiSchema: {
        title: 'ID de l\'entité',
        'x-component': 'Input'
      }
    },
    {
      name: 'old_value',
      type: 'json',
      interface: 'json',
      uiSchema: {
        title: 'Ancienne valeur',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'new_value',
      type: 'json',
      interface: 'json',
      uiSchema: {
        title: 'Nouvelle valeur',
        'x-component': 'Input.JSON'
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
      name: 'ip_address',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Adresse IP',
        'x-component': 'Input'
      }
    },

    // Timestamp
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Date',
        'x-component': 'DatePicker',
        'x-read-pretty': true
      }
    }
  ],
  indexes: [
    { fields: ['mission_id'] },
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
    { fields: ['entity_type', 'entity_id'] }
  ]
};
