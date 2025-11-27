// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFP History (Audit Trail)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFP_HISTORY,
  title: 'Historique RFP',
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
      name: 'action',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Action',
        'x-component': 'Select',
        enum: [
          { value: 'created', label: 'Créé' },
          { value: 'edited', label: 'Modifié' },
          { value: 'status_changed', label: 'Statut changé' },
          { value: 'published', label: 'Publié' },
          { value: 'closed', label: 'Fermé' },
          { value: 'cancelled', label: 'Annulé' },
          { value: 'awarded', label: 'Attribué' },
          { value: 'skill_added', label: 'Compétence ajoutée' },
          { value: 'skill_removed', label: 'Compétence supprimée' },
          { value: 'document_added', label: 'Document ajouté' },
          { value: 'document_removed', label: 'Document supprimé' },
          { value: 'invitation_sent', label: 'Invitation envoyée' },
          { value: 'question_answered', label: 'Question répondue' },
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
        title: 'Effectué par (user ID)',
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
      name: 'changes',
      type: 'json',
      interface: 'json',
      uiSchema: {
        title: 'Changements détaillés',
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
    { fields: ['rfp_id'] },
    { fields: ['action'] },
    { fields: ['performed_by_user_id'] },
    { fields: ['created_at'] },
  ],
} as CollectionOptions;
