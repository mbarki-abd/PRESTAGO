// =============================================================================
// PRESTAGO - Plugin Users - Users Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const usersCollection: CollectionOptions = {
  name: COLLECTIONS.USERS,
  title: 'Users',
  sortable: 'sort',
  model: 'PrestagoUserModel',
  createdBy: true,
  updatedBy: true,
  logging: true,
  fields: [
    // Primary Key
    {
      type: 'uuid',
      name: 'id',
      primaryKey: true,
      autoGenerate: true,
    },
    // Email (unique identifier)
    {
      type: 'string',
      name: 'email',
      unique: true,
      interface: 'email',
      uiSchema: {
        type: 'string',
        title: 'Email',
        'x-component': 'Input',
        'x-validator': 'email',
        required: true,
      },
    },
    // Password hash (never exposed)
    {
      type: 'password',
      name: 'password_hash',
      hidden: true,
    },
    // First name
    {
      type: 'string',
      name: 'first_name',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'First Name',
        'x-component': 'Input',
        required: true,
      },
    },
    // Last name
    {
      type: 'string',
      name: 'last_name',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: 'Last Name',
        'x-component': 'Input',
        required: true,
      },
    },
    // Full name (virtual/computed)
    {
      type: 'virtual',
      name: 'full_name',
      get(this: any) {
        return `${this.first_name || ''} ${this.last_name || ''}`.trim();
      },
    },
    // Phone
    {
      type: 'string',
      name: 'phone',
      interface: 'phone',
      uiSchema: {
        type: 'string',
        title: 'Phone',
        'x-component': 'Input',
      },
    },
    // Avatar URL
    {
      type: 'string',
      name: 'avatar_url',
      interface: 'attachment',
      uiSchema: {
        type: 'string',
        title: 'Avatar',
        'x-component': 'Upload.Attachment',
        'x-component-props': {
          accept: 'image/*',
          multiple: false,
        },
      },
    },
    // User type
    {
      type: 'string',
      name: 'user_type',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'User Type',
        'x-component': 'Select',
        enum: [
          { label: 'Freelance', value: 'freelance' },
          { label: 'ESN Administrator', value: 'esn_admin' },
          { label: 'ESN Commercial', value: 'esn_commercial' },
          { label: 'Client Administrator', value: 'client_admin' },
          { label: 'Client Manager', value: 'client_manager' },
          { label: 'Platform Administrator', value: 'platform_admin' },
        ],
        required: true,
      },
      defaultValue: 'freelance',
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
          { label: 'Pending', value: 'pending' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Deleted', value: 'deleted' },
        ],
        required: true,
      },
      defaultValue: 'pending',
    },
    // Email verified
    {
      type: 'boolean',
      name: 'email_verified',
      interface: 'checkbox',
      uiSchema: {
        type: 'boolean',
        title: 'Email Verified',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    // Last login timestamp
    {
      type: 'date',
      name: 'last_login_at',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: 'Last Login',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
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
      foreignKey: 'user_id',
      sourceKey: 'id',
    },
    {
      type: 'belongsToMany',
      name: 'organizations',
      target: COLLECTIONS.ORGANIZATIONS,
      through: COLLECTIONS.USER_ORGANIZATIONS,
      foreignKey: 'user_id',
      otherKey: 'organization_id',
      sourceKey: 'id',
      targetKey: 'id',
    },
  ],
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['user_type'],
    },
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['created_at'],
    },
  ],
};

export default usersCollection;
