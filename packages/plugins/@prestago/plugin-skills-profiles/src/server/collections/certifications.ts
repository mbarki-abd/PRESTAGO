// =============================================================================
// PRESTAGO - Certifications Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const certificationsCollection: CollectionOptions = {
  name: 'prestago_certifications',
  title: 'Certifications',
  sortable: 'sort_order',
  model: 'CertificationModel',
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
    {
      name: 'skill_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Related Skill")}}',
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
    // Certification Information
    // =========================================================================
    {
      name: 'name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Certification Name")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., AWS Solutions Architect Professional',
        },
        required: true,
      },
    },
    {
      name: 'issuing_organization',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Issuing Organization")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Amazon Web Services',
        },
        required: true,
      },
    },
    {
      name: 'issuing_organization_logo_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Organization Logo")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'certification_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Certification Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Cloud Certification")}}', value: 'cloud' },
          { label: '{{t("Programming Language")}}', value: 'programming' },
          { label: '{{t("Framework/Tool")}}', value: 'framework' },
          { label: '{{t("Project Management")}}', value: 'project_management' },
          { label: '{{t("Agile/Scrum")}}', value: 'agile' },
          { label: '{{t("Security")}}', value: 'security' },
          { label: '{{t("Data/Analytics")}}', value: 'data' },
          { label: '{{t("IT Service Management")}}', value: 'itsm' },
          { label: '{{t("Business/Industry")}}', value: 'business' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },
    {
      name: 'level',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Certification Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Foundation")}}', value: 'foundation' },
          { label: '{{t("Associate")}}', value: 'associate' },
          { label: '{{t("Professional")}}', value: 'professional' },
          { label: '{{t("Expert")}}', value: 'expert' },
          { label: '{{t("Specialty")}}', value: 'specialty' },
        ],
      },
    },

    // =========================================================================
    // Dates
    // =========================================================================
    {
      name: 'issue_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("Issue Date")}}',
        'x-component': 'DatePicker',
        required: true,
      },
    },
    {
      name: 'expiration_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("Expiration Date")}}',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'does_not_expire',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("This certification does not expire")}}',
        'x-component': 'Checkbox',
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
    // Credential Details
    // =========================================================================
    {
      name: 'credential_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Credential ID")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., AWS-SAP-12345',
        },
      },
    },
    {
      name: 'credential_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Credential URL")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'Link to verify this certification',
        },
      },
    },
    {
      name: 'badge_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Badge URL")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Description
    // =========================================================================
    {
      name: 'description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Description")}}',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          rows: 3,
          placeholder: 'Describe what this certification covers',
        },
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
        title: '{{t("Verified")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'verification_date',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'string',
        title: '{{t("Verification Date")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
      },
    },
    {
      name: 'verification_method',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Verification Method")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("URL Verification")}}', value: 'url' },
          { label: '{{t("Document Upload")}}', value: 'document' },
          { label: '{{t("API Verification")}}', value: 'api' },
          { label: '{{t("Manual Review")}}', value: 'manual' },
        ],
      },
    },
    {
      name: 'certificate_document_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Certificate Document")}}',
        'x-component': 'RemoteSelect',
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
      name: 'is_highlighted',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Highlight Certification")}}',
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
      fields: ['profile_id'],
    },
    {
      fields: ['skill_id'],
    },
    {
      fields: ['name'],
    },
    {
      fields: ['issuing_organization'],
    },
    {
      fields: ['certification_type'],
    },
    {
      fields: ['issue_date'],
    },
    {
      fields: ['expiration_date'],
    },
    {
      fields: ['is_expired'],
    },
    {
      fields: ['is_verified'],
    },
    {
      fields: ['is_visible'],
    },
    {
      fields: ['profile_id', 'sort_order'],
    },
    {
      fields: ['name', 'issuing_organization'],
      type: 'FULLTEXT',
    },
  ],
};

export default certificationsCollection;
