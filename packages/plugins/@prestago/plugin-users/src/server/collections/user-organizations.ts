// =============================================================================
// PRESTAGO - Plugin Users - User-Organizations Junction Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export const userOrganizationsCollection: CollectionOptions = {
  name: COLLECTIONS.USER_ORGANIZATIONS,
  title: 'User Organizations',
  sortable: 'sort',
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
    // User reference
    {
      type: 'belongsTo',
      name: 'user',
      target: COLLECTIONS.USERS,
      foreignKey: 'user_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      uiSchema: {
        type: 'string',
        title: 'User',
        'x-component': 'RecordPicker',
        required: true,
      },
    },
    // Organization reference
    {
      type: 'belongsTo',
      name: 'organization',
      target: COLLECTIONS.ORGANIZATIONS,
      foreignKey: 'organization_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      uiSchema: {
        type: 'string',
        title: 'Organization',
        'x-component': 'RecordPicker',
        required: true,
      },
    },
    // Role within organization
    {
      type: 'string',
      name: 'role',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Role',
        'x-component': 'Select',
        enum: [
          { label: 'Owner', value: 'owner' },
          { label: 'Administrator', value: 'admin' },
          { label: 'Manager', value: 'manager' },
          { label: 'Member', value: 'member' },
        ],
        required: true,
      },
      defaultValue: 'member',
    },
    // Is primary organization for user
    {
      type: 'boolean',
      name: 'is_primary',
      interface: 'checkbox',
      uiSchema: {
        type: 'boolean',
        title: 'Primary Organization',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },
    // Join date
    {
      type: 'date',
      name: 'joined_at',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: 'Joined At',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
      defaultValue: () => new Date(),
    },
    // Invited by (user who sent the invitation)
    {
      type: 'belongsTo',
      name: 'invited_by',
      target: COLLECTIONS.USERS,
      foreignKey: 'invited_by_id',
      targetKey: 'id',
      uiSchema: {
        type: 'string',
        title: 'Invited By',
        'x-component': 'RecordPicker',
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
          { label: 'Pending', value: 'pending' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Left', value: 'left' },
        ],
      },
      defaultValue: 'active',
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
  ],
  indexes: [
    {
      fields: ['user_id', 'organization_id'],
      unique: true,
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['organization_id'],
    },
    {
      fields: ['role'],
    },
    {
      fields: ['is_primary'],
    },
    {
      fields: ['status'],
    },
  ],
};

export default userOrganizationsCollection;
