// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Application History
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.APPLICATION_HISTORY,
  title: 'Historique des candidatures',
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
      name: 'action',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Action',
        'x-component': 'Select',
        enum: [
          { value: 'created', label: 'Créé' },
          { value: 'submitted', label: 'Soumis' },
          { value: 'status_changed', label: 'Statut changé' },
          { value: 'under_review', label: 'En évaluation' },
          { value: 'shortlisted', label: 'Présélectionné' },
          { value: 'rejected', label: 'Rejeté' },
          { value: 'withdrawn', label: 'Retiré' },
          { value: 'on_hold', label: 'En attente' },
          { value: 'interview_scheduled', label: 'Entretien planifié' },
          { value: 'interview_completed', label: 'Entretien terminé' },
          { value: 'evaluation_added', label: 'Évaluation ajoutée' },
          { value: 'offer_created', label: 'Offre créée' },
          { value: 'offer_sent', label: 'Offre envoyée' },
          { value: 'offer_accepted', label: 'Offre acceptée' },
          { value: 'offer_declined', label: 'Offre refusée' },
          { value: 'note_added', label: 'Note ajoutée' },
          { value: 'document_uploaded', label: 'Document téléversé' },
        ],
        required: true,
      },
    },
    {
      name: 'from_status',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Ancien statut',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'to_status',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Nouveau statut',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'performed_by_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Effectué par (ID)',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'performed_by_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'performed_by_user_id',
      targetKey: 'id',
    },
    {
      name: 'comment',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Commentaire',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      interface: 'json',
      uiSchema: {
        title: 'Métadonnées',
        'x-component': 'Input.JSON',
        'x-read-pretty': true,
      },
    },
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Date',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['application_id'] },
    { fields: ['action'] },
    { fields: ['performed_by_user_id'] },
    { fields: ['created_at'] },
  ],
} as CollectionOptions;
