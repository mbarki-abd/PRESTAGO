// =============================================================================
// PRESTAGO - Plugin Reporting - Collection: Dashboards
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const dashboardsCollection: CollectionOptions = {
  name: COLLECTIONS.DASHBOARDS,
  title: 'Dashboards',
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
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Description',
        'x-component': 'Input.TextArea'
      }
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: 'custom',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'Administrateur', value: 'admin' },
          { label: 'Client', value: 'client' },
          { label: 'Consultant', value: 'consultant' },
          { label: 'Manager', value: 'manager' },
          { label: 'Commercial', value: 'commercial' },
          { label: 'Personnalisé', value: 'custom' }
        ]
      }
    },
    {
      name: 'is_default',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Par défaut',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'is_public',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Public',
        'x-component': 'Checkbox'
      }
    },

    // Propriétaire
    {
      name: 'owner_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Propriétaire',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'owner',
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'owner_id'
    },
    {
      name: 'organization_id',
      type: 'uuid',
      interface: 'linkTo',
      uiSchema: {
        title: 'Organisation',
        'x-component': 'RecordPicker'
      }
    },
    {
      name: 'organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'organization_id'
    },

    // Layout
    {
      name: 'layout',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Layout',
        'x-component': 'Input.JSON'
      }
    },

    // Filtres par défaut
    {
      name: 'default_period',
      type: 'string',
      defaultValue: 'this_month',
      interface: 'select',
      uiSchema: {
        title: 'Période par défaut',
        'x-component': 'Select',
        enum: [
          { label: 'Aujourd\'hui', value: 'today' },
          { label: 'Cette semaine', value: 'this_week' },
          { label: 'Ce mois', value: 'this_month' },
          { label: 'Ce trimestre', value: 'this_quarter' },
          { label: 'Cette année', value: 'this_year' }
        ]
      }
    },
    {
      name: 'filters',
      type: 'json',
      defaultValue: {},
      interface: 'json',
      uiSchema: {
        title: 'Filtres',
        'x-component': 'Input.JSON'
      }
    },

    // Apparence
    {
      name: 'theme',
      type: 'string',
      defaultValue: 'light',
      interface: 'select',
      uiSchema: {
        title: 'Thème',
        'x-component': 'Select',
        enum: [
          { label: 'Clair', value: 'light' },
          { label: 'Sombre', value: 'dark' }
        ]
      }
    },
    {
      name: 'refresh_interval',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Rafraîchissement (sec)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, max: 3600 }
      }
    },

    // Relations
    {
      name: 'widgets',
      type: 'hasMany',
      target: COLLECTIONS.WIDGETS,
      foreignKey: 'dashboard_id'
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
    { fields: ['type'] },
    { fields: ['owner_id'] },
    { fields: ['organization_id'] },
    { fields: ['is_default'] },
    { fields: ['is_public'] }
  ]
};
