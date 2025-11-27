// =============================================================================
// PRESTAGO - Plugin Reporting - Collection: Widgets
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const widgetsCollection: CollectionOptions = {
  name: COLLECTIONS.WIDGETS,
  title: 'Widgets',
  fields: [
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
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
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'KPI', value: 'kpi' },
          { label: 'Jauge', value: 'gauge' },
          { label: 'Progression', value: 'progress' },
          { label: 'Tendance', value: 'trend' },
          { label: 'Courbe', value: 'line_chart' },
          { label: 'Barres', value: 'bar_chart' },
          { label: 'Camembert', value: 'pie_chart' },
          { label: 'Donut', value: 'donut_chart' },
          { label: 'Aire', value: 'area_chart' },
          { label: 'Tableau', value: 'table' },
          { label: 'Liste', value: 'list' },
          { label: 'Classement', value: 'ranking' },
          { label: 'Carte', value: 'map' },
          { label: 'Calendrier', value: 'calendar' },
          { label: 'Timeline', value: 'timeline' },
          { label: 'Texte', value: 'text' }
        ]
      }
    },

    // Configuration
    {
      name: 'config',
      type: 'json',
      defaultValue: {},
      interface: 'json',
      uiSchema: {
        title: 'Configuration',
        'x-component': 'Input.JSON'
      }
    },

    // Affichage
    {
      name: 'display',
      type: 'json',
      defaultValue: {},
      interface: 'json',
      uiSchema: {
        title: 'Affichage',
        'x-component': 'Input.JSON'
      }
    },

    // Seuils d'alerte
    {
      name: 'thresholds',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Seuils',
        'x-component': 'Input.JSON'
      }
    },

    // Position dans le layout
    {
      name: 'position_x',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber'
    },
    {
      name: 'position_y',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber'
    },
    {
      name: 'width',
      type: 'integer',
      defaultValue: 4,
      interface: 'inputNumber'
    },
    {
      name: 'height',
      type: 'integer',
      defaultValue: 3,
      interface: 'inputNumber'
    },

    // Rafraîchissement
    {
      name: 'refresh_interval',
      type: 'integer',
      defaultValue: 0,
      interface: 'inputNumber',
      uiSchema: {
        title: 'Rafraîchissement (sec)',
        'x-component': 'InputNumber'
      }
    },

    // État
    {
      name: 'is_visible',
      type: 'boolean',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: {
        title: 'Visible',
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
    { fields: ['dashboard_id'] },
    { fields: ['type'] },
    { fields: ['dashboard_id', 'is_visible'] }
  ]
};
