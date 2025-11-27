// =============================================================================
// PRESTAGO - Profile Documents Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const profileDocumentsCollection: CollectionOptions = {
  name: 'prestago_profile_documents',
  title: 'Profile Documents',
  sortable: 'sort_order',
  model: 'ProfileDocumentModel',
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
    // Document Information
    // =========================================================================
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      defaultValue: 'cv',
      uiSchema: {
        type: 'string',
        title: '{{t("Document Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("CV / Resume")}}', value: 'cv', color: 'blue' },
          { label: '{{t("Certification")}}', value: 'certification', color: 'green' },
          { label: '{{t("Diploma")}}', value: 'diploma', color: 'purple' },
          { label: '{{t("Portfolio")}}', value: 'portfolio', color: 'orange' },
          { label: '{{t("Recommendation Letter")}}', value: 'recommendation', color: 'cyan' },
          { label: '{{t("Identity Document")}}', value: 'identity', color: 'red' },
          { label: '{{t("Other")}}', value: 'other', color: 'default' },
        ],
        required: true,
      },
    },
    {
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Document Name")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., CV - John Doe - 2024',
        },
        required: true,
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
        'x-component-props': {
          rows: 2,
        },
      },
    },
    {
      name: 'language',
      type: 'string',
      interface: 'select',
      defaultValue: 'fr',
      uiSchema: {
        type: 'string',
        title: '{{t("Document Language")}}',
        'x-component': 'Select',
        enum: [
          { label: 'Français', value: 'fr' },
          { label: 'English', value: 'en' },
          { label: 'Español', value: 'es' },
          { label: 'Deutsch', value: 'de' },
          { label: 'Other', value: 'other' },
        ],
      },
    },

    // =========================================================================
    // File Information
    // =========================================================================
    {
      name: 'file_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("File URL")}}',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'file_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("File Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'file_size',
      type: 'integer',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("File Size (bytes)")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'file_mime_type',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("MIME Type")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'file_extension',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Extension")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },
    {
      name: 'thumbnail_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Thumbnail URL")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Storage Information
    // =========================================================================
    {
      name: 'storage_provider',
      type: 'string',
      interface: 'select',
      defaultValue: 'minio',
      uiSchema: {
        type: 'string',
        title: '{{t("Storage Provider")}}',
        'x-component': 'Select',
        enum: [
          { label: 'MinIO (S3)', value: 'minio' },
          { label: 'Local', value: 'local' },
          { label: 'AWS S3', value: 's3' },
          { label: 'External URL', value: 'external' },
        ],
      },
    },
    {
      name: 'storage_key',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Storage Key")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'storage_bucket',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Storage Bucket")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Visibility & Access
    // =========================================================================
    {
      name: 'is_public',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Public Document")}}',
        'x-component': 'Checkbox',
        description: 'Make this document visible to potential employers',
      },
    },
    {
      name: 'is_primary_cv',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Primary CV")}}',
        'x-component': 'Checkbox',
        description: 'Use this as the main CV for applications',
      },
    },
    {
      name: 'access_level',
      type: 'string',
      interface: 'select',
      defaultValue: 'profile_owner',
      uiSchema: {
        type: 'string',
        title: '{{t("Access Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Profile Owner Only")}}', value: 'profile_owner' },
          { label: '{{t("Organization Members")}}', value: 'organization' },
          { label: '{{t("Clients with Applications")}}', value: 'clients_applied' },
          { label: '{{t("Public")}}', value: 'public' },
        ],
      },
    },

    // =========================================================================
    // Expiration
    // =========================================================================
    {
      name: 'expires_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Expires At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
    },
    {
      name: 'is_expired',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Expired")}}',
        'x-component': 'Checkbox',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // Analytics
    // =========================================================================
    {
      name: 'download_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Download Count")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'view_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("View Count")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'last_downloaded_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Last Downloaded")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // Verification
    // =========================================================================
    {
      name: 'is_verified',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Verified Document")}}',
        'x-component': 'Checkbox',
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
      name: 'verification_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Verification Notes")}}',
        'x-component': 'Input.TextArea',
      },
    },

    // =========================================================================
    // Display Options
    // =========================================================================
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
      name: 'uploaded_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Uploaded At")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
      },
    },
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
      fields: ['profile_id'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['is_public'],
    },
    {
      fields: ['is_primary_cv'],
    },
    {
      fields: ['access_level'],
    },
    {
      fields: ['expires_at'],
    },
    {
      fields: ['is_expired'],
    },
    {
      fields: ['is_verified'],
    },
    {
      fields: ['profile_id', 'type'],
    },
    {
      fields: ['profile_id', 'sort_order'],
    },
    {
      fields: ['profile_id', 'is_primary_cv'],
    },
  ],
};

export default profileDocumentsCollection;
