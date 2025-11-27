// =============================================================================
// PRESTAGO - Languages Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const languagesCollection: CollectionOptions = {
  name: 'prestago_languages',
  title: 'Languages',
  sortable: 'sort_order',
  model: 'LanguageModel',
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

    // =========================================================================
    // Language Information
    // =========================================================================
    {
      name: 'language_code',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Language")}}',
        'x-component': 'Select',
        enum: [
          { label: 'Français', value: 'fr' },
          { label: 'English', value: 'en' },
          { label: 'Español', value: 'es' },
          { label: 'Deutsch', value: 'de' },
          { label: 'Italiano', value: 'it' },
          { label: 'Português', value: 'pt' },
          { label: 'Nederlands', value: 'nl' },
          { label: 'العربية', value: 'ar' },
          { label: '中文', value: 'zh' },
          { label: '日本語', value: 'ja' },
          { label: 'Русский', value: 'ru' },
          { label: 'Polski', value: 'pl' },
          { label: 'Türkçe', value: 'tr' },
          { label: 'हिन्दी', value: 'hi' },
          { label: '한국어', value: 'ko' },
        ],
        required: true,
      },
    },
    {
      name: 'language_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Language Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // Proficiency Levels
    // =========================================================================
    {
      name: 'overall_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Overall Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("A1 - Beginner")}}', value: 'A1' },
          { label: '{{t("A2 - Elementary")}}', value: 'A2' },
          { label: '{{t("B1 - Intermediate")}}', value: 'B1' },
          { label: '{{t("B2 - Upper Intermediate")}}', value: 'B2' },
          { label: '{{t("C1 - Advanced")}}', value: 'C1' },
          { label: '{{t("C2 - Proficient")}}', value: 'C2' },
          { label: '{{t("Native")}}', value: 'native' },
        ],
        required: true,
      },
    },
    {
      name: 'speaking_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Speaking")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Beginner")}}', value: 'beginner' },
          { label: '{{t("Intermediate")}}', value: 'intermediate' },
          { label: '{{t("Advanced")}}', value: 'advanced' },
          { label: '{{t("Expert")}}', value: 'expert' },
        ],
      },
    },
    {
      name: 'reading_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Reading")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Beginner")}}', value: 'beginner' },
          { label: '{{t("Intermediate")}}', value: 'intermediate' },
          { label: '{{t("Advanced")}}', value: 'advanced' },
          { label: '{{t("Expert")}}', value: 'expert' },
        ],
      },
    },
    {
      name: 'writing_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Writing")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Beginner")}}', value: 'beginner' },
          { label: '{{t("Intermediate")}}', value: 'intermediate' },
          { label: '{{t("Advanced")}}', value: 'advanced' },
          { label: '{{t("Expert")}}', value: 'expert' },
        ],
      },
    },
    {
      name: 'listening_level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Listening")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Beginner")}}', value: 'beginner' },
          { label: '{{t("Intermediate")}}', value: 'intermediate' },
          { label: '{{t("Advanced")}}', value: 'advanced' },
          { label: '{{t("Expert")}}', value: 'expert' },
        ],
      },
    },

    // =========================================================================
    // Additional Information
    // =========================================================================
    {
      name: 'is_native',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Native Language")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'is_primary_work_language',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Primary Work Language")}}',
        'x-component': 'Checkbox',
      },
    },

    // =========================================================================
    // Certifications
    // =========================================================================
    {
      name: 'certification',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Language Certification")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., TOEFL, DELF, Cambridge',
        },
      },
    },
    {
      name: 'certification_score',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Certification Score")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., 110/120, C1',
        },
      },
    },
    {
      name: 'certification_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("Certification Date")}}',
        'x-component': 'DatePicker',
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
          rows: 2,
          placeholder: 'Additional context about your language skills',
        },
      },
    },

    // =========================================================================
    // Display Options
    // =========================================================================
    {
      name: 'is_visible',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: true,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Visible on Profile")}}',
        'x-component': 'Checkbox',
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
  ],

  // ===========================================================================
  // Indexes
  // ===========================================================================
  indexes: [
    {
      fields: ['profile_id', 'language_code'],
      unique: true,
    },
    {
      fields: ['profile_id'],
    },
    {
      fields: ['language_code'],
    },
    {
      fields: ['overall_level'],
    },
    {
      fields: ['is_native'],
    },
    {
      fields: ['is_visible'],
    },
    {
      fields: ['profile_id', 'sort_order'],
    },
  ],
};

export default languagesCollection;
