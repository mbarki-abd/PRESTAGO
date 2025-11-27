// =============================================================================
// PRESTAGO - Plugin Timesheets - Collection: Jours fériés
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const holidaysCollection: CollectionOptions = {
  name: COLLECTIONS.HOLIDAYS,
  title: 'Jours fériés',
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
      name: 'date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date',
        'x-component': 'DatePicker'
      }
    },
    {
      name: 'country',
      type: 'string',
      defaultValue: 'FR',
      interface: 'select',
      uiSchema: {
        title: 'Pays',
        'x-component': 'Select',
        enum: [
          { label: 'France', value: 'FR' },
          { label: 'Belgique', value: 'BE' },
          { label: 'Suisse', value: 'CH' },
          { label: 'Luxembourg', value: 'LU' },
          { label: 'Canada', value: 'CA' },
          { label: 'Allemagne', value: 'DE' },
          { label: 'Royaume-Uni', value: 'GB' }
        ]
      }
    },
    {
      name: 'is_regional',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Régional uniquement',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'regions',
      type: 'json',
      defaultValue: [],
      interface: 'json',
      uiSchema: {
        title: 'Régions concernées',
        'x-component': 'Input.JSON'
      }
    },
    {
      name: 'is_variable',
      type: 'boolean',
      defaultValue: false,
      interface: 'checkbox',
      uiSchema: {
        title: 'Date variable',
        'x-component': 'Checkbox'
      }
    },
    {
      name: 'year',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Année',
        'x-component': 'InputNumber'
      }
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt'
    }
  ],
  indexes: [
    { fields: ['date'] },
    { fields: ['country'] },
    { fields: ['year'] },
    { fields: ['country', 'date'], unique: true }
  ]
};
