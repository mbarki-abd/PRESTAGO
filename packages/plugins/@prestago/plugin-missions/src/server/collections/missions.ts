// =============================================================================
// PRESTAGO - Plugin Missions - Collection: Missions
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const missionsCollection: CollectionOptions = {
  name: COLLECTIONS.MISSIONS,
  title: 'Missions',
  fields: [
    // Identifiant
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'reference',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        title: 'Référence',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      name: 'title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Titre',
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

    // Relations principales
    {
      name: 'rfp_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Appel d\'offres',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'rfp',
      type: 'belongsTo',
      target: 'prestago_rfps',
      foreignKey: 'rfp_id'
    },
    {
      name: 'application_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Candidature',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'application',
      type: 'belongsTo',
      target: 'prestago_applications',
      foreignKey: 'application_id'
    },
    {
      name: 'offer_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Offre',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'offer',
      type: 'belongsTo',
      target: 'prestago_application_offers',
      foreignKey: 'offer_id'
    },
    {
      name: 'profile_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Profil consultant',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'profile',
      type: 'belongsTo',
      target: 'prestago_profiles',
      foreignKey: 'profile_id'
    },

    // Organisations
    {
      name: 'client_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Organisation cliente',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'client_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'client_organization_id'
    },
    {
      name: 'consultant_organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Organisation consultant',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'consultant_organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'consultant_organization_id'
    },

    // Responsables
    {
      name: 'client_manager_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Responsable client',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'client_manager',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'client_manager_id'
    },
    {
      name: 'consultant_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Consultant',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'consultant',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'consultant_id'
    },
    {
      name: 'account_manager_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Account Manager',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'account_manager',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'account_manager_id'
    },

    // Dates planifiées
    {
      name: 'start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin',
        'x-component': 'DatePicker'
      }
    },

    // Dates réelles
    {
      name: 'actual_start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de début réelle',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'actual_end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date de fin réelle',
        'x-component': 'DatePicker'
      }
    },

    // Financier
    {
      name: 'daily_rate',
      type: 'decimal',
      precision: 10,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'TJM',
        'x-component': 'InputNumber',
        'x-component-props': {
          precision: 2,
          addonAfter: '€'
        }
      }
    },
    {
      name: 'rate_currency',
      type: 'string',
      defaultValue: 'EUR',
      interface: 'select',
      uiSchema: {
        title: 'Devise',
        'x-component': 'Select',
        enum: [
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'GBP (£)', value: 'GBP' },
          { label: 'CHF', value: 'CHF' }
        ]
      }
    },
    {
      name: 'estimated_days',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours estimés',
        'x-component': 'InputNumber'
      }
    },
    {
      name: 'actual_days',
      type: 'decimal',
      precision: 6,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jours réalisés',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 }
      }
    },
    {
      name: 'budget_total',
      type: 'decimal',
      precision: 12,
      scale: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Budget total',
        'x-component': 'InputNumber',
        'x-component-props': {
          precision: 2,
          addonAfter: '€'
        }
      }
    },
    {
      name: 'budget_consumed',
      type: 'decimal',
      precision: 12,
      scale: 2,
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Budget consommé',
        'x-component': 'InputNumber',
        'x-component-props': {
          precision: 2,
          addonAfter: '€'
        }
      }
    },

    // Mode de travail
    {
      name: 'work_mode',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Mode de travail',
        'x-component': 'Select',
        enum: [
          { label: 'Sur site', value: 'onsite' },
          { label: 'Télétravail', value: 'remote' },
          { label: 'Hybride', value: 'hybrid' }
        ]
      }
    },
    {
      name: 'remote_percentage',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: '% télétravail',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 100,
          addonAfter: '%'
        }
      }
    },
    {
      name: 'work_location',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Lieu de travail',
        'x-component': 'Input'
      }
    },

    // Statut
    {
      name: 'status',
      type: 'string',
      defaultValue: 'draft',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { label: 'Brouillon', value: 'draft' },
          { label: 'En attente', value: 'pending_start' },
          { label: 'Active', value: 'active' },
          { label: 'Suspendue', value: 'on_hold' },
          { label: 'Terminée', value: 'completed' },
          { label: 'Annulée', value: 'cancelled' },
          { label: 'Terminée prématurément', value: 'terminated_early' }
        ]
      }
    },
    {
      name: 'end_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type de fin',
        'x-component': 'Select',
        enum: [
          { label: 'Fin naturelle', value: 'natural' },
          { label: 'Résiliation amiable', value: 'mutual' },
          { label: 'Rupture client', value: 'client' },
          { label: 'Rupture consultant', value: 'consultant' },
          { label: 'Force majeure', value: 'force_majeure' }
        ]
      }
    },
    {
      name: 'termination_reason',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Raison de fin',
        'x-component': 'Input.TextArea'
      }
    },

    // Configuration
    {
      name: 'reporting_frequency',
      type: 'string',
      defaultValue: 'weekly',
      interface: 'select',
      uiSchema: {
        title: 'Fréquence de reporting',
        'x-component': 'Select',
        enum: [
          { label: 'Quotidien', value: 'daily' },
          { label: 'Hebdomadaire', value: 'weekly' },
          { label: 'Bihebdomadaire', value: 'biweekly' },
          { label: 'Mensuel', value: 'monthly' },
          { label: 'Trimestriel', value: 'quarterly' },
          { label: 'Sur demande', value: 'on_demand' }
        ]
      }
    },
    {
      name: 'requires_timesheet',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'CRA requis',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'timesheet_approval_levels',
      type: 'integer',
      defaultValue: 2,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Niveaux d\'approbation CRA',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1,
          max: 3
        }
      }
    },

    // Relations enfants
    {
      name: 'milestones',
      type: 'hasMany',
      target: COLLECTIONS.MILESTONES,
      foreignKey: 'mission_id'
    },
    {
      name: 'deliverables',
      type: 'hasMany',
      target: COLLECTIONS.DELIVERABLES,
      foreignKey: 'mission_id'
    },
    {
      name: 'extensions',
      type: 'hasMany',
      target: COLLECTIONS.EXTENSIONS,
      foreignKey: 'mission_id'
    },
    {
      name: 'evaluations',
      type: 'hasMany',
      target: COLLECTIONS.EVALUATIONS,
      foreignKey: 'mission_id'
    },
    {
      name: 'notes',
      type: 'hasMany',
      target: COLLECTIONS.NOTES,
      foreignKey: 'mission_id'
    },
    {
      name: 'history',
      type: 'hasMany',
      target: COLLECTIONS.HISTORY,
      foreignKey: 'mission_id'
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Créé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true
      }
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt',
      uiSchema: {
        title: 'Mis à jour le',
        'x-component': 'DatePicker',
        'x-read-pretty': true
      }
    },
    {
      name: 'created_by_id',
      type: 'uuid',
      interface: 'createdBy'
    },
    {
      name: 'updated_by_id',
      type: 'uuid',
      interface: 'updatedBy'
    }
  ],
  indexes: [
    { fields: ['reference'], unique: true },
    { fields: ['status'] },
    { fields: ['client_organization_id'] },
    { fields: ['consultant_id'] },
    { fields: ['profile_id'] },
    { fields: ['start_date', 'end_date'] },
    { fields: ['rfp_id'] },
    { fields: ['application_id'] }
  ]
};
