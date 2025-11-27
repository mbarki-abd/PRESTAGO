// =============================================================================
// PRESTAGO - Plugin RFP - Collection: RFPs
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.RFPS,
  title: 'RFPs (Appels d\'Offres)',
  fields: [
    // Reference & Basic Info
    {
      name: 'reference_number',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Numéro de référence',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Titre',
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
        required: true,
      },
    },
    {
      name: 'client_context',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Contexte client',
        'x-component': 'Input.TextArea',
      },
    },

    // Organization Relations
    {
      name: 'client_organization_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'ID Organisation client',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'client_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'client_organization_id',
      targetKey: 'id',
    },
    {
      name: 'created_by_user_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Créé par',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'created_by_user',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'created_by_user_id',
      targetKey: 'id',
    },
    {
      name: 'assigned_manager_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Manager assigné',
        'x-component': 'Input',
      },
    },
    {
      name: 'assigned_manager',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'assigned_manager_id',
      targetKey: 'id',
    },

    // Mission Details
    {
      name: 'mission_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de mission',
        'x-component': 'Select',
        enum: [
          { value: 'fixed_price', label: 'Forfait' },
          { value: 'time_and_materials', label: 'Régie' },
          { value: 'mixed', label: 'Mixte' },
        ],
        required: true,
      },
    },
    {
      name: 'contract_types',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Types de contrat acceptés',
        'x-component': 'Select',
        'x-component-props': { mode: 'multiple' },
        enum: [
          { value: 'freelance', label: 'Freelance' },
          { value: 'portage', label: 'Portage' },
          { value: 'cdi', label: 'CDI' },
          { value: 'cdd', label: 'CDD' },
          { value: 'any', label: 'Tous' },
        ],
      },
      defaultValue: ['any'],
    },
    {
      name: 'work_mode',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Mode de travail',
        'x-component': 'Select',
        enum: [
          { value: 'onsite', label: 'Sur site' },
          { value: 'remote', label: 'Télétravail' },
          { value: 'hybrid', label: 'Hybride' },
        ],
        required: true,
      },
    },

    // Location
    {
      name: 'location_city',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Ville',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'location_country',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Pays',
        'x-component': 'Input',
        required: true,
      },
      defaultValue: 'France',
    },
    {
      name: 'location_address',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Adresse',
        'x-component': 'Input',
      },
    },
    {
      name: 'remote_percentage',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: '% Télétravail',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, max: 100 },
      },
    },

    // Duration & Timing
    {
      name: 'estimated_start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début estimée',
        'x-component': 'DatePicker',
        required: true,
      },
    },
    {
      name: 'estimated_end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin estimée',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'duration_months',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Durée (mois)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 36 },
      },
    },
    {
      name: 'extension_possible',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Prolongation possible',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    {
      name: 'max_extension_months',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Durée max prolongation (mois)',
        'x-component': 'InputNumber',
      },
    },

    // Resources
    {
      name: 'positions_count',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de postes',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 50 },
      },
      defaultValue: 1,
    },
    {
      name: 'team_context',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Contexte équipe',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'reporting_to',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Hiérarchie / Reporting',
        'x-component': 'Input',
      },
    },

    // Budget
    {
      name: 'budget_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de budget',
        'x-component': 'Select',
        enum: [
          { value: 'daily_rate', label: 'Tarif journalier' },
          { value: 'fixed_price', label: 'Forfait' },
          { value: 'not_specified', label: 'Non spécifié' },
        ],
      },
      defaultValue: 'daily_rate',
    },
    {
      name: 'daily_rate_min',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM minimum',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, precision: 2 },
      },
    },
    {
      name: 'daily_rate_max',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM maximum',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, precision: 2 },
      },
    },
    {
      name: 'fixed_price_budget',
      type: 'float',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Budget forfait',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, precision: 2 },
      },
    },
    {
      name: 'budget_currency',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Devise',
        'x-component': 'Input',
      },
      defaultValue: 'EUR',
    },
    {
      name: 'budget_visible',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Budget visible',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },

    // Requirements
    {
      name: 'experience_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Niveau d\'expérience requis',
        'x-component': 'Select',
        enum: [
          { value: 'junior', label: 'Junior' },
          { value: 'confirmed', label: 'Confirmé' },
          { value: 'senior', label: 'Senior' },
          { value: 'lead', label: 'Lead' },
          { value: 'expert', label: 'Expert' },
        ],
        required: true,
      },
    },
    {
      name: 'years_experience_min',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Années d\'exp. min',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0 },
      },
    },
    {
      name: 'years_experience_max',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Années d\'exp. max',
        'x-component': 'InputNumber',
      },
    },
    {
      name: 'required_languages',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Langues requises',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
      },
    },
    {
      name: 'certifications_required',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Certifications requises',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
      },
    },

    // Status & Workflow
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { value: 'draft', label: 'Brouillon' },
          { value: 'pending_approval', label: 'En attente d\'approbation' },
          { value: 'published', label: 'Publié' },
          { value: 'evaluating', label: 'En évaluation' },
          { value: 'shortlisted', label: 'Présélection' },
          { value: 'negotiating', label: 'Négociation' },
          { value: 'awarded', label: 'Attribué' },
          { value: 'cancelled', label: 'Annulé' },
          { value: 'expired', label: 'Expiré' },
          { value: 'closed', label: 'Fermé' },
        ],
      },
      defaultValue: 'draft',
    },
    {
      name: 'priority',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Priorité',
        'x-component': 'Select',
        enum: [
          { value: 'low', label: 'Basse' },
          { value: 'medium', label: 'Moyenne' },
          { value: 'high', label: 'Haute' },
          { value: 'urgent', label: 'Urgente' },
        ],
      },
      defaultValue: 'medium',
    },
    {
      name: 'visibility',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Visibilité',
        'x-component': 'Select',
        enum: [
          { value: 'public', label: 'Public' },
          { value: 'organization_only', label: 'Organisation uniquement' },
          { value: 'invited_only', label: 'Sur invitation' },
          { value: 'private', label: 'Privé' },
        ],
      },
      defaultValue: 'public',
    },

    // Important Dates
    {
      name: 'application_deadline',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date limite de candidature',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'published_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de publication',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'closed_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fermeture',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'awarded_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date d\'attribution',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },

    // Statistics
    {
      name: 'views_count',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de vues',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
      defaultValue: 0,
    },
    {
      name: 'applications_count',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de candidatures',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
      defaultValue: 0,
    },
    {
      name: 'shortlisted_count',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Nombre de présélectionnés',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
      defaultValue: 0,
    },

    // Metadata
    {
      name: 'tags',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Tags',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
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
    {
      name: 'industry',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Secteur d\'activité',
        'x-component': 'Select',
        enum: [
          { value: 'banking_finance', label: 'Banque / Finance' },
          { value: 'insurance', label: 'Assurance' },
          { value: 'technology', label: 'Technologie' },
          { value: 'consulting', label: 'Conseil' },
          { value: 'retail', label: 'Distribution' },
          { value: 'healthcare', label: 'Santé' },
          { value: 'telecom', label: 'Télécommunications' },
          { value: 'energy', label: 'Énergie' },
          { value: 'manufacturing', label: 'Industrie' },
          { value: 'transport', label: 'Transport' },
          { value: 'media', label: 'Médias' },
          { value: 'public_sector', label: 'Secteur public' },
          { value: 'education', label: 'Éducation' },
          { value: 'real_estate', label: 'Immobilier' },
          { value: 'other', label: 'Autre' },
        ],
      },
    },
    {
      name: 'mission_domain',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Domaine de mission',
        'x-component': 'Select',
        enum: [
          { value: 'web_development', label: 'Développement Web' },
          { value: 'mobile_development', label: 'Développement Mobile' },
          { value: 'backend_development', label: 'Développement Backend' },
          { value: 'frontend_development', label: 'Développement Frontend' },
          { value: 'fullstack_development', label: 'Développement Fullstack' },
          { value: 'devops', label: 'DevOps' },
          { value: 'cloud_architecture', label: 'Architecture Cloud' },
          { value: 'data_engineering', label: 'Data Engineering' },
          { value: 'data_science', label: 'Data Science' },
          { value: 'machine_learning', label: 'Machine Learning' },
          { value: 'cybersecurity', label: 'Cybersécurité' },
          { value: 'project_management', label: 'Gestion de projet' },
          { value: 'product_management', label: 'Product Management' },
          { value: 'business_analysis', label: 'Business Analysis' },
          { value: 'ux_ui_design', label: 'UX/UI Design' },
          { value: 'quality_assurance', label: 'Assurance Qualité' },
          { value: 'it_support', label: 'Support IT' },
          { value: 'consulting', label: 'Conseil' },
          { value: 'training', label: 'Formation' },
          { value: 'other', label: 'Autre' },
        ],
      },
    },

    // Relations
    {
      name: 'skill_requirements',
      type: 'hasMany',
      target: 'prestago_rfp_skill_requirements',
      foreignKey: 'rfp_id',
    },
    {
      name: 'documents',
      type: 'hasMany',
      target: 'prestago_rfp_documents',
      foreignKey: 'rfp_id',
    },
    {
      name: 'questions',
      type: 'hasMany',
      target: 'prestago_rfp_questions',
      foreignKey: 'rfp_id',
    },
    {
      name: 'invitations',
      type: 'hasMany',
      target: 'prestago_rfp_invitations',
      foreignKey: 'rfp_id',
    },
    {
      name: 'history',
      type: 'hasMany',
      target: 'prestago_rfp_history',
      foreignKey: 'rfp_id',
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
    { fields: ['reference_number'], unique: true },
    { fields: ['status'] },
    { fields: ['client_organization_id'] },
    { fields: ['created_by_user_id'] },
    { fields: ['visibility'] },
    { fields: ['priority'] },
    { fields: ['application_deadline'] },
    { fields: ['estimated_start_date'] },
    { fields: ['published_at'] },
  ],
} as CollectionOptions;
