// =============================================================================
// PRESTAGO - Plugin Reporting - Collection: Rapports Programmés
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const scheduledReportsCollection: CollectionOptions = {
  name: COLLECTIONS.SCHEDULED_REPORTS,
  title: 'Rapports Programmés',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
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
      name: 'dashboard_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Dashboard',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'dashboard',
      type: 'belongsTo',
      target: COLLECTIONS.DASHBOARDS,
      foreignKey: 'dashboard_id'
    },

    // Planification
    {
      name: 'frequency',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Fréquence',
        'x-component': 'Select',
        enum: [
          { label: 'Quotidien', value: 'daily' },
          { label: 'Hebdomadaire', value: 'weekly' },
          { label: 'Mensuel', value: 'monthly' },
          { label: 'Trimestriel', value: 'quarterly' }
        ]
      }
    },
    {
      name: 'day_of_week',
      type: 'integer',
      interface: 'select',
      uiSchema: {
        title: 'Jour de la semaine',
        'x-component': 'Select',
        enum: [
          { label: 'Lundi', value: 1 },
          { label: 'Mardi', value: 2 },
          { label: 'Mercredi', value: 3 },
          { label: 'Jeudi', value: 4 },
          { label: 'Vendredi', value: 5 },
          { label: 'Samedi', value: 6 },
          { label: 'Dimanche', value: 0 }
        ]
      }
    },
    {
      name: 'day_of_month',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Jour du mois',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 31 }
      }
    },
    {
      name: 'time',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Heure (HH:mm)',
        'x-component': 'TimePicker'
      }
    },

    // Destinataires
    {
      name: 'recipients',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Destinataires',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'external_emails',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Emails externes',
        'x-component': 'Input.JSON'
      }
    },

    // Format et période
    {
      name: 'format',
      type: 'string',
      defaultValue: 'pdf',
      interface: 'select',
      uiSchema: {
        title: 'Format',
        'x-component': 'Select',
        enum: [
          { label: 'PDF', value: 'pdf' },
          { label: 'Excel', value: 'excel' },
          { label: 'CSV', value: 'csv' }
        ]
      }
    },
    {
      name: 'period',
      type: 'string',
      defaultValue: 'last_month',
      interface: 'select',
      uiSchema: {
        title: 'Période',
        'x-component': 'Select',
        enum: [
          { label: 'Hier', value: 'yesterday' },
          { label: 'Semaine dernière', value: 'last_week' },
          { label: 'Mois dernier', value: 'last_month' },
          { label: 'Trimestre dernier', value: 'last_quarter' },
          { label: 'Année dernière', value: 'last_year' }
        ]
      }
    },

    // État
    {
      name: 'is_active',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Actif',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'last_run_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Dernière exécution',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'next_run_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        title: 'Prochaine exécution',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true }
      }
    },
    {
      name: 'last_status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Dernier statut',
        'x-component': 'Select',
        enum: [
          { label: 'Succès', value: 'success' },
          { label: 'Échec', value: 'failed' },
          { label: 'En cours', value: 'running' }
        ]
      }
    },
    {
      name: 'last_error',
      type: 'text',
      interface: 'textarea'
    },

    // Créateur
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
    { fields: ['dashboard_id'] },
    { fields: ['is_active'] },
    { fields: ['next_run_at'] },
    { fields: ['created_by_id'] }
  ]
};
