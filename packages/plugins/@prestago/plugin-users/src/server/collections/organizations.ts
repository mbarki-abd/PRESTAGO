// =============================================================================
// PRESTAGO - Plugin Users - Organizations Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const organizationsCollection: CollectionOptions = {
  name: COLLECTIONS.ORGANIZATIONS,
  title: 'Organizations',
  sortable: 'sort',
  model: 'PrestagoOrganizationModel',
  createdBy: true,
  updatedBy: true,
  logging: true,
  tree: 'adjacency-list', // For parent-child hierarchy
  fields: [
    // Primary Key
    {
      type: 'uuid',
      name: 'id',
      primaryKey: true,
      autoGenerate: true,
    },
    // Name
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'Organization Name',
        'x-component': 'Input',
        required: true,
      },
    },
    // Organization Type
    {
      type: 'string',
      name: 'type',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Type',
        'x-component': 'Select',
        enum: [
          { label: 'ESN (Service Company)', value: 'esn' },
          { label: 'Client (Enterprise)', value: 'client' },
          { label: 'Platform', value: 'platform' },
        ],
        required: true,
      },
    },
    // Legal name (official registered name)
    {
      type: 'string',
      name: 'legal_name',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'Legal Name',
        'x-component': 'Input',
      },
    },
    // SIRET (French company ID - 14 digits)
    {
      type: 'string',
      name: 'siret',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'SIRET',
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 14,
        },
      },
    },
    // VAT Number
    {
      type: 'string',
      name: 'vat_number',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'VAT Number',
        'x-component': 'Input',
      },
    },
    // Address (JSON object)
    {
      type: 'json',
      name: 'address',
      interface: 'json',
      uiSchema: {
        type: 'object',
        title: 'Address',
        'x-component': 'Input.JSON',
        properties: {
          street: { type: 'string', title: 'Street' },
          city: { type: 'string', title: 'City' },
          postal_code: { type: 'string', title: 'Postal Code' },
          country: { type: 'string', title: 'Country', default: 'FR' },
        },
      },
      defaultValue: { country: 'FR' },
    },
    // Logo URL
    {
      type: 'string',
      name: 'logo_url',
      interface: 'attachment',
      uiSchema: {
        type: 'string',
        title: 'Logo',
        'x-component': 'Upload.Attachment',
        'x-component-props': {
          accept: 'image/*',
          multiple: false,
        },
      },
    },
    // Website
    {
      type: 'string',
      name: 'website',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: 'Website',
        'x-component': 'Input',
        'x-validator': 'url',
      },
    },
    // Description
    {
      type: 'text',
      name: 'description',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: 'Description',
        'x-component': 'Input.TextArea',
      },
    },
    // Status
    {
      type: 'string',
      name: 'status',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Status',
        'x-component': 'Select',
        enum: [
          { label: 'Pending Verification', value: 'pending' },
          { label: 'Verified', value: 'verified' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
        ],
        required: true,
      },
      defaultValue: 'pending',
    },
    // Parent organization (for entities/subsidiaries)
    {
      type: 'belongsTo',
      name: 'parent',
      target: COLLECTIONS.ORGANIZATIONS,
      foreignKey: 'parent_id',
      targetKey: 'id',
      uiSchema: {
        type: 'string',
        title: 'Parent Organization',
        'x-component': 'RecordPicker',
      },
    },
    // Children organizations
    {
      type: 'hasMany',
      name: 'children',
      target: COLLECTIONS.ORGANIZATIONS,
      foreignKey: 'parent_id',
      sourceKey: 'id',
    },
    // Settings (JSON for custom configuration)
    {
      type: 'json',
      name: 'settings',
      interface: 'json',
      uiSchema: {
        type: 'object',
        title: 'Settings',
        'x-component': 'Input.JSON',
      },
      defaultValue: {},
    },
    // Tenant ID (for multi-tenant support)
    {
      type: 'string',
      name: 'tenant_id',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'Tenant ID',
        'x-component': 'Input',
      },
    },
    // Timestamps
    {
      type: 'date',
      name: 'created_at',
      interface: 'createdAt',
      field: 'created_at',
      uiSchema: {
        type: 'string',
        title: 'Created At',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },
    {
      type: 'date',
      name: 'updated_at',
      interface: 'updatedAt',
      field: 'updated_at',
      uiSchema: {
        type: 'string',
        title: 'Updated At',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },
    // Relations
    {
      type: 'hasMany',
      name: 'user_organizations',
      target: COLLECTIONS.USER_ORGANIZATIONS,
      foreignKey: 'organization_id',
      sourceKey: 'id',
    },
    {
      type: 'belongsToMany',
      name: 'users',
      target: COLLECTIONS.USERS,
      through: COLLECTIONS.USER_ORGANIZATIONS,
      foreignKey: 'organization_id',
      otherKey: 'user_id',
      sourceKey: 'id',
      targetKey: 'id',
    },
  ],
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['siret'],
      unique: true,
      where: {
        siret: { $ne: null },
      },
    },
    {
      fields: ['status'],
    },
    {
      fields: ['parent_id'],
    },
    {
      fields: ['tenant_id'],
    },
  ],
};

export default organizationsCollection;
