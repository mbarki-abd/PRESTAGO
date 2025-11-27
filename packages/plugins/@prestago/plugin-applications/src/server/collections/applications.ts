// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Applications
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.APPLICATIONS,
  title: 'Candidatures',
  fields: [
    // References
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
      target: 'prestago_rfps',
      foreignKey: 'rfp_id',
      targetKey: 'id',
    },
    {
      name: 'profile_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Profil ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'profile_id',
      targetKey: 'id',
    },
    {
      name: 'user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Utilisateur ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'user_id',
      targetKey: 'id',
    },
    {
      name: 'organization_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Organisation ID (ESN)',
        'x-component': 'Input',
      },
    },
    {
      name: 'organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'organization_id',
      targetKey: 'id',
    },

    // Status & Source
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { value: 'draft', label: 'Brouillon' },
          { value: 'submitted', label: 'Soumis' },
          { value: 'under_review', label: 'En cours d\'évaluation' },
          { value: 'shortlisted', label: 'Présélectionné' },
          { value: 'interview_scheduled', label: 'Entretien planifié' },
          { value: 'interview_completed', label: 'Entretien terminé' },
          { value: 'offer_pending', label: 'Offre en préparation' },
          { value: 'offer_sent', label: 'Offre envoyée' },
          { value: 'offer_accepted', label: 'Offre acceptée' },
          { value: 'offer_declined', label: 'Offre refusée' },
          { value: 'rejected', label: 'Rejeté' },
          { value: 'withdrawn', label: 'Retiré' },
          { value: 'on_hold', label: 'En attente' },
        ],
      },
      defaultValue: 'draft',
    },
    {
      name: 'source',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Source',
        'x-component': 'Select',
        enum: [
          { value: 'direct', label: 'Candidature directe' },
          { value: 'invitation', label: 'Invitation' },
          { value: 'matching', label: 'Matching' },
          { value: 'referral', label: 'Recommandation' },
          { value: 'external', label: 'Externe' },
        ],
      },
      defaultValue: 'direct',
    },
    {
      name: 'invitation_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Invitation ID',
        'x-component': 'Input',
      },
    },
    {
      name: 'invitation',
      type: 'belongsTo',
      target: 'prestago_rfp_invitations',
      foreignKey: 'invitation_id',
      targetKey: 'id',
    },

    // Candidate info
    {
      name: 'cover_letter',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Lettre de motivation',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'motivation',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Motivation',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'proposed_start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début proposée',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'proposed_daily_rate',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM proposé',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, precision: 2 },
      },
    },
    {
      name: 'rate_currency',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Devise',
        'x-component': 'Input',
      },
      defaultValue: 'EUR',
    },
    {
      name: 'rate_negotiable',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Tarif négociable',
        'x-component': 'Checkbox',
      },
      defaultValue: true,
    },

    // Availability
    {
      name: 'available_from',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Disponible à partir de',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'notice_period_days',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Préavis (jours)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0 },
      },
    },
    {
      name: 'part_time_available',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Temps partiel possible',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    {
      name: 'part_time_percentage',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Pourcentage temps partiel',
        'x-component': 'InputNumber',
        'x-component-props': { min: 10, max: 100 },
      },
    },

    // Match score
    {
      name: 'match_score',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Score de matching',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'match_details',
      type: 'json',
      interface: 'json',
      uiSchema: {
        title: 'Détails du matching',
        'x-component': 'Input.JSON',
        'x-read-pretty': true,
      },
    },

    // Internal evaluation
    {
      name: 'internal_rating',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Note interne',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'internal_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes internes',
        'x-component': 'Input.TextArea',
      },
    },

    // Workflow dates
    {
      name: 'submitted_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Soumis le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'reviewed_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Évalué le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'shortlisted_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Présélectionné le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'rejected_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Rejeté le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'withdrawn_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Retiré le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },

    // Rejection
    {
      name: 'rejection_reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Motif de rejet',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'rejection_category',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Catégorie de rejet',
        'x-component': 'Select',
        enum: [
          { value: 'skills_mismatch', label: 'Compétences inadaptées' },
          { value: 'experience_insufficient', label: 'Expérience insuffisante' },
          { value: 'rate_too_high', label: 'Tarif trop élevé' },
          { value: 'availability_mismatch', label: 'Disponibilité inadaptée' },
          { value: 'location_mismatch', label: 'Localisation incompatible' },
          { value: 'better_candidate', label: 'Meilleur candidat' },
          { value: 'position_filled', label: 'Poste pourvu' },
          { value: 'position_cancelled', label: 'Poste annulé' },
          { value: 'communication_issues', label: 'Communication' },
          { value: 'cultural_fit', label: 'Adéquation culturelle' },
          { value: 'references_issues', label: 'Références' },
          { value: 'other', label: 'Autre' },
        ],
      },
    },

    // Relations
    {
      name: 'documents',
      type: 'hasMany',
      target: COLLECTIONS.APPLICATION_DOCUMENTS,
      foreignKey: 'application_id',
    },
    {
      name: 'interviews',
      type: 'hasMany',
      target: COLLECTIONS.INTERVIEWS,
      foreignKey: 'application_id',
    },
    {
      name: 'evaluations',
      type: 'hasMany',
      target: COLLECTIONS.EVALUATIONS,
      foreignKey: 'application_id',
    },
    {
      name: 'offers',
      type: 'hasMany',
      target: COLLECTIONS.OFFERS,
      foreignKey: 'application_id',
    },
    {
      name: 'history',
      type: 'hasMany',
      target: COLLECTIONS.APPLICATION_HISTORY,
      foreignKey: 'application_id',
    },
    {
      name: 'notes',
      type: 'hasMany',
      target: COLLECTIONS.APPLICATION_NOTES,
      foreignKey: 'application_id',
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
    { fields: ['rfp_id', 'profile_id'], unique: true },
    { fields: ['rfp_id'] },
    { fields: ['profile_id'] },
    { fields: ['user_id'] },
    { fields: ['organization_id'] },
    { fields: ['status'] },
    { fields: ['source'] },
    { fields: ['match_score'] },
    { fields: ['submitted_at'] },
  ],
} as CollectionOptions;
