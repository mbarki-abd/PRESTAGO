// =============================================================================
// PRESTAGO - Profile Skills Collection (Junction Table)
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const profileSkillsCollection: CollectionOptions = {
  name: 'prestago_profile_skills',
  title: 'Profile Skills',
  sortable: 'sort_order',
  model: 'ProfileSkillModel',
  createdBy: true,
  updatedBy: true,
  fields: [
    // =========================================================================
    // Primary Fields
    // =========================================================================
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true,
      defaultValue: 'uuid',
    },
    {
      name: 'profile_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Profile")}}',
        'x-component': 'RemoteSelect',
        'x-component-props': {
          resourceName: 'prestago_consultant_profiles',
        },
        required: true,
      },
    },
    {
      name: 'skill_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Skill")}}',
        'x-component': 'RemoteSelect',
        'x-component-props': {
          resourceName: 'prestago_skills',
          fieldNames: {
            label: 'name',
            value: 'id',
          },
        },
        required: true,
      },
    },

    // =========================================================================
    // Skill Details
    // =========================================================================
    {
      name: 'level',
      type: 'string',
      interface: 'select',
      defaultValue: 'intermediate',
      uiSchema: {
        type: 'string',
        title: '{{t("Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Beginner")}}', value: 'beginner', color: 'blue' },
          { label: '{{t("Intermediate")}}', value: 'intermediate', color: 'cyan' },
          { label: '{{t("Advanced")}}', value: 'advanced', color: 'green' },
          { label: '{{t("Expert")}}', value: 'expert', color: 'gold' },
        ],
      },
    },
    {
      name: 'years_experience',
      type: 'decimal',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Years of Experience")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 50,
          step: 0.5,
        },
      },
    },
    {
      name: 'last_used_year',
      type: 'integer',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Last Used Year")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1980,
          max: new Date().getFullYear(),
        },
      },
    },

    // =========================================================================
    // Visibility & Priority
    // =========================================================================
    {
      name: 'is_primary',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Primary Skill")}}',
        'x-component': 'Checkbox',
        description: 'Mark as a main skill that defines your profile',
      },
    },
    {
      name: 'is_highlighted',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Highlighted")}}',
        'x-component': 'Checkbox',
        description: 'Show prominently on profile',
      },
    },
    {
      name: 'sort_order',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Sort Order")}}',
        'x-component': 'InputNumber',
      },
    },

    // =========================================================================
    // Validation
    // =========================================================================
    {
      name: 'is_verified',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Verified")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'verified_by',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Verified By")}}',
        'x-component': 'RemoteSelect',
      },
    },
    {
      name: 'verified_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Verified At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
    },
    {
      name: 'endorsements_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Endorsements")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // Notes
    // =========================================================================
    {
      name: 'notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Notes")}}',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          rows: 3,
          placeholder: 'Additional context about this skill',
        },
      },
    },

    // =========================================================================
    // Timestamps
    // =========================================================================
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        type: 'datetime',
        title: '{{t("Created At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt',
      uiSchema: {
        type: 'datetime',
        title: '{{t("Updated At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },
  ],

  // ===========================================================================
  // Relations
  // ===========================================================================
  relations: [
    {
      name: 'profile',
      type: 'belongsTo',
      target: 'prestago_consultant_profiles',
      foreignKey: 'profile_id',
    },
    {
      name: 'skill',
      type: 'belongsTo',
      target: 'prestago_skills',
      foreignKey: 'skill_id',
    },
  ],

  // ===========================================================================
  // Indexes
  // ===========================================================================
  indexes: [
    {
      fields: ['profile_id', 'skill_id'],
      unique: true,
    },
    {
      fields: ['profile_id'],
    },
    {
      fields: ['skill_id'],
    },
    {
      fields: ['level'],
    },
    {
      fields: ['is_primary'],
    },
    {
      fields: ['is_highlighted'],
    },
    {
      fields: ['profile_id', 'is_primary'],
    },
  ],
};

export default profileSkillsCollection;
