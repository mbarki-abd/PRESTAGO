// =============================================================================
// PRESTAGO - Skills Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const skillsCollection: CollectionOptions = {
  name: 'prestago_skills',
  title: 'Skills',
  sortable: true,
  model: 'SkillModel',
  createdBy: true,
  updatedBy: true,
  logging: true,
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
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Skill Name")}}',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'slug',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Slug")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'category',
      type: 'string',
      interface: 'select',
      defaultValue: 'technical',
      uiSchema: {
        type: 'string',
        title: '{{t("Category")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Technical")}}', value: 'technical' },
          { label: '{{t("Functional")}}', value: 'functional' },
          { label: '{{t("Soft Skill")}}', value: 'soft_skill' },
          { label: '{{t("Language")}}', value: 'language' },
          { label: '{{t("Certification")}}', value: 'certification' },
          { label: '{{t("Tool")}}', value: 'tool' },
          { label: '{{t("Methodology")}}', value: 'methodology' },
          { label: '{{t("Domain")}}', value: 'domain' },
        ],
      },
    },
    {
      name: 'subcategory',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Subcategory")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Description")}}',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'aliases',
      type: 'json',
      interface: 'json',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Aliases")}}',
        'x-component': 'Input.JSON',
      },
    },
    {
      name: 'icon',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Icon")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'color',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Color")}}',
        'x-component': 'ColorPicker',
      },
    },

    // =========================================================================
    // Hierarchy
    // =========================================================================
    {
      name: 'parent_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Parent Skill")}}',
        'x-component': 'RemoteSelect',
        'x-component-props': {
          resourceName: 'prestago_skills',
          fieldNames: {
            label: 'name',
            value: 'id',
          },
        },
      },
    },

    // =========================================================================
    // Validation & Stats
    // =========================================================================
    {
      name: 'is_validated',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Validated")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'validated_by',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Validated By")}}',
        'x-component': 'RemoteSelect',
      },
    },
    {
      name: 'validated_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Validated At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
    },
    {
      name: 'usage_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Usage Count")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'search_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Search Count")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // External References
    // =========================================================================
    {
      name: 'external_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("External ID")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'external_source',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("External Source")}}',
        'x-component': 'Input',
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
      name: 'parent',
      type: 'belongsTo',
      target: 'prestago_skills',
      foreignKey: 'parent_id',
    },
    {
      name: 'children',
      type: 'hasMany',
      target: 'prestago_skills',
      foreignKey: 'parent_id',
    },
    {
      name: 'profile_skills',
      type: 'hasMany',
      target: 'prestago_profile_skills',
      foreignKey: 'skill_id',
    },
  ],

  // ===========================================================================
  // Indexes
  // ===========================================================================
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['category'],
    },
    {
      fields: ['category', 'subcategory'],
    },
    {
      fields: ['parent_id'],
    },
    {
      fields: ['is_validated'],
    },
    {
      fields: ['usage_count'],
    },
    {
      fields: ['name'],
      type: 'FULLTEXT',
    },
  ],
};

export default skillsCollection;
