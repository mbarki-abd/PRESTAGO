// =============================================================================
// PRESTAGO - Experiences Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const experiencesCollection: CollectionOptions = {
  name: 'prestago_experiences',
  title: 'Experiences',
  sortable: 'sort_order',
  model: 'ExperienceModel',
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
    // Company Information
    // =========================================================================
    {
      name: 'company_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Company Name")}}',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'company_logo_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Company Logo URL")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'company_industry',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Industry")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Banking & Finance")}}', value: 'banking_finance' },
          { label: '{{t("Insurance")}}', value: 'insurance' },
          { label: '{{t("Technology")}}', value: 'technology' },
          { label: '{{t("Consulting")}}', value: 'consulting' },
          { label: '{{t("Retail & E-commerce")}}', value: 'retail' },
          { label: '{{t("Healthcare")}}', value: 'healthcare' },
          { label: '{{t("Telecommunications")}}', value: 'telecom' },
          { label: '{{t("Energy & Utilities")}}', value: 'energy' },
          { label: '{{t("Manufacturing")}}', value: 'manufacturing' },
          { label: '{{t("Transportation & Logistics")}}', value: 'transport' },
          { label: '{{t("Media & Entertainment")}}', value: 'media' },
          { label: '{{t("Public Sector")}}', value: 'public_sector' },
          { label: '{{t("Education")}}', value: 'education' },
          { label: '{{t("Real Estate")}}', value: 'real_estate' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },
    {
      name: 'company_size',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Company Size")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("1-10 employees")}}', value: '1-10' },
          { label: '{{t("11-50 employees")}}', value: '11-50' },
          { label: '{{t("51-200 employees")}}', value: '51-200' },
          { label: '{{t("201-500 employees")}}', value: '201-500' },
          { label: '{{t("501-1000 employees")}}', value: '501-1000' },
          { label: '{{t("1001-5000 employees")}}', value: '1001-5000' },
          { label: '{{t("5001-10000 employees")}}', value: '5001-10000' },
          { label: '{{t("10000+ employees")}}', value: '10000+' },
        ],
      },
    },
    {
      name: 'company_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Company Website")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Position Details
    // =========================================================================
    {
      name: 'job_title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Job Title")}}',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'job_type',
      type: 'string',
      interface: 'select',
      defaultValue: 'freelance',
      uiSchema: {
        type: 'string',
        title: '{{t("Employment Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("CDI (Permanent)")}}', value: 'cdi' },
          { label: '{{t("CDD (Fixed-term)")}}', value: 'cdd' },
          { label: '{{t("Freelance")}}', value: 'freelance' },
          { label: '{{t("Portage")}}', value: 'portage' },
          { label: '{{t("Internship")}}', value: 'internship' },
          { label: '{{t("Apprenticeship")}}', value: 'apprenticeship' },
        ],
      },
    },
    {
      name: 'department',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Department")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Duration
    // =========================================================================
    {
      name: 'start_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("Start Date")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          picker: 'month',
        },
        required: true,
      },
    },
    {
      name: 'end_date',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("End Date")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          picker: 'month',
        },
      },
    },
    {
      name: 'is_current',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("I currently work here")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'duration_months',
      type: 'integer',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Duration (months)")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // Location
    // =========================================================================
    {
      name: 'location_city',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("City")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'location_country',
      type: 'string',
      interface: 'select',
      defaultValue: 'FR',
      uiSchema: {
        type: 'string',
        title: '{{t("Country")}}',
        'x-component': 'Select',
        enum: [
          { label: 'France', value: 'FR' },
          { label: 'Belgium', value: 'BE' },
          { label: 'Switzerland', value: 'CH' },
          { label: 'Luxembourg', value: 'LU' },
          { label: 'Germany', value: 'DE' },
          { label: 'Spain', value: 'ES' },
          { label: 'Italy', value: 'IT' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'Netherlands', value: 'NL' },
          { label: 'Portugal', value: 'PT' },
          { label: 'Other', value: 'OTHER' },
        ],
      },
    },
    {
      name: 'is_remote',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Remote Work")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'work_arrangement',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Work Arrangement")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("On-site")}}', value: 'onsite' },
          { label: '{{t("Remote")}}', value: 'remote' },
          { label: '{{t("Hybrid")}}', value: 'hybrid' },
        ],
      },
    },

    // =========================================================================
    // Description & Details
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
          rows: 4,
          placeholder: 'Describe your role, responsibilities, and context',
        },
      },
    },
    {
      name: 'responsibilities',
      type: 'json',
      interface: 'json',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Key Responsibilities")}}',
        'x-component': 'ArrayItems',
        items: {
          type: 'string',
          'x-component': 'Input',
        },
      },
    },
    {
      name: 'achievements',
      type: 'json',
      interface: 'json',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Key Achievements")}}',
        'x-component': 'ArrayItems',
        items: {
          type: 'string',
          'x-component': 'Input',
        },
      },
    },
    {
      name: 'technologies_used',
      type: 'json',
      interface: 'multipleSelect',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Technologies Used")}}',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'tags',
        },
      },
    },

    // =========================================================================
    // Project Details (for mission-based work)
    // =========================================================================
    {
      name: 'project_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Project Name")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'project_description',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Project Description")}}',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          rows: 3,
        },
      },
    },
    {
      name: 'team_size',
      type: 'integer',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Team Size")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1,
        },
      },
    },
    {
      name: 'budget_range',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Project Budget Range")}}',
        'x-component': 'Select',
        enum: [
          { label: '< 50K€', value: 'under_50k' },
          { label: '50K - 200K€', value: '50k_200k' },
          { label: '200K - 500K€', value: '200k_500k' },
          { label: '500K - 1M€', value: '500k_1m' },
          { label: '1M - 5M€', value: '1m_5m' },
          { label: '> 5M€', value: 'over_5m' },
        ],
      },
    },

    // =========================================================================
    // Verification & References
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
      name: 'reference_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Reference Name")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'reference_title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Reference Title")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'reference_email',
      type: 'string',
      interface: 'email',
      uiSchema: {
        type: 'string',
        title: '{{t("Reference Email")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'reference_phone',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Reference Phone")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'can_contact_reference',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Can contact reference")}}',
        'x-component': 'Checkbox',
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
        title: '{{t("Highlight Experience")}}',
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
      name: 'experience_skills',
      type: 'hasMany',
      target: 'prestago_experience_skills',
      foreignKey: 'experience_id',
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
      fields: ['start_date'],
    },
    {
      fields: ['end_date'],
    },
    {
      fields: ['is_current'],
    },
    {
      fields: ['company_name'],
    },
    {
      fields: ['job_title'],
    },
    {
      fields: ['company_industry'],
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
      fields: ['job_title', 'company_name', 'description'],
      type: 'FULLTEXT',
    },
  ],
};

export default experiencesCollection;
