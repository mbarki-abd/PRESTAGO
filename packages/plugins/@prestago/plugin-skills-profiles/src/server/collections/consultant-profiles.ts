// =============================================================================
// PRESTAGO - Consultant Profiles Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const consultantProfilesCollection: CollectionOptions = {
  name: 'prestago_consultant_profiles',
  title: 'Consultant Profiles',
  sortable: true,
  model: 'ConsultantProfileModel',
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
      name: 'user_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("User")}}',
        'x-component': 'RemoteSelect',
        'x-component-props': {
          resourceName: 'prestago_users',
          fieldNames: {
            label: 'email',
            value: 'id',
          },
        },
        required: true,
      },
    },
    {
      name: 'organization_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Organization")}}',
        'x-component': 'RemoteSelect',
        'x-component-props': {
          resourceName: 'prestago_organizations',
          fieldNames: {
            label: 'name',
            value: 'id',
          },
        },
      },
    },

    // =========================================================================
    // Professional Info
    // =========================================================================
    {
      name: 'title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Professional Title")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Senior Full-Stack Developer',
        },
        required: true,
      },
    },
    {
      name: 'headline',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Headline")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'Brief tagline for your profile',
          maxLength: 200,
        },
      },
    },
    {
      name: 'summary',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: '{{t("Summary")}}',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          rows: 6,
          placeholder: 'Describe your expertise, achievements, and what you bring to projects',
        },
      },
    },
    {
      name: 'experience_level',
      type: 'string',
      interface: 'select',
      defaultValue: 'confirmed',
      uiSchema: {
        type: 'string',
        title: '{{t("Experience Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Junior (0-2 years)")}}', value: 'junior' },
          { label: '{{t("Confirmed (2-5 years)")}}', value: 'confirmed' },
          { label: '{{t("Senior (5-10 years)")}}', value: 'senior' },
          { label: '{{t("Lead (10-15 years)")}}', value: 'lead' },
          { label: '{{t("Expert (15+ years)")}}', value: 'expert' },
        ],
      },
    },
    {
      name: 'years_experience',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Years of Experience")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 50,
        },
      },
    },

    // =========================================================================
    // Availability
    // =========================================================================
    {
      name: 'availability_status',
      type: 'string',
      interface: 'select',
      defaultValue: 'available',
      uiSchema: {
        type: 'string',
        title: '{{t("Availability")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Available")}}', value: 'available', color: 'green' },
          { label: '{{t("Partially Available")}}', value: 'partially_available', color: 'orange' },
          { label: '{{t("Not Available")}}', value: 'not_available', color: 'red' },
          { label: '{{t("On Mission")}}', value: 'on_mission', color: 'blue' },
        ],
      },
    },
    {
      name: 'available_from',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        type: 'string',
        title: '{{t("Available From")}}',
        'x-component': 'DatePicker',
      },
    },
    {
      name: 'available_days_per_week',
      type: 'integer',
      interface: 'number',
      defaultValue: 5,
      uiSchema: {
        type: 'number',
        title: '{{t("Available Days per Week")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1,
          max: 7,
        },
      },
    },

    // =========================================================================
    // Contract Preferences
    // =========================================================================
    {
      name: 'contract_preferences',
      type: 'json',
      interface: 'multipleSelect',
      defaultValue: ['freelance'],
      uiSchema: {
        type: 'array',
        title: '{{t("Contract Preferences")}}',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'multiple',
        },
        enum: [
          { label: '{{t("CDI")}}', value: 'cdi' },
          { label: '{{t("CDD")}}', value: 'cdd' },
          { label: '{{t("Freelance")}}', value: 'freelance' },
          { label: '{{t("Portage")}}', value: 'portage' },
          { label: '{{t("Any")}}', value: 'any' },
        ],
      },
    },
    {
      name: 'work_mode',
      type: 'string',
      interface: 'select',
      defaultValue: 'hybrid',
      uiSchema: {
        type: 'string',
        title: '{{t("Work Mode")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("On-site")}}', value: 'onsite' },
          { label: '{{t("Remote")}}', value: 'remote' },
          { label: '{{t("Hybrid")}}', value: 'hybrid' },
          { label: '{{t("Any")}}', value: 'any' },
        ],
      },
    },

    // =========================================================================
    // Mobility
    // =========================================================================
    {
      name: 'mobility_radius_km',
      type: 'integer',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Mobility Radius (km)")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          max: 1000,
        },
      },
    },
    {
      name: 'mobility_regions',
      type: 'json',
      interface: 'multipleSelect',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Mobility Regions")}}',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'tags',
        },
      },
    },
    {
      name: 'mobility_countries',
      type: 'json',
      interface: 'multipleSelect',
      defaultValue: ['FR'],
      uiSchema: {
        type: 'array',
        title: '{{t("Mobility Countries")}}',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'multiple',
        },
      },
    },
    {
      name: 'willing_to_relocate',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Willing to Relocate")}}',
        'x-component': 'Checkbox',
      },
    },

    // =========================================================================
    // Rates
    // =========================================================================
    {
      name: 'daily_rate_min',
      type: 'decimal',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Minimum Daily Rate")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          addonAfter: '€',
        },
      },
    },
    {
      name: 'daily_rate_max',
      type: 'decimal',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Maximum Daily Rate")}}',
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 0,
          addonAfter: '€',
        },
      },
    },
    {
      name: 'daily_rate_currency',
      type: 'string',
      interface: 'select',
      defaultValue: 'EUR',
      uiSchema: {
        type: 'string',
        title: '{{t("Currency")}}',
        'x-component': 'Select',
        enum: [
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'GBP (£)', value: 'GBP' },
          { label: 'CHF', value: 'CHF' },
        ],
      },
    },
    {
      name: 'rate_negotiable',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: true,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Rate Negotiable")}}',
        'x-component': 'Checkbox',
      },
    },
    {
      name: 'show_rate_on_profile',
      type: 'boolean',
      interface: 'checkbox',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Show Rate on Profile")}}',
        'x-component': 'Checkbox',
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
        ],
      },
    },
    {
      name: 'location_postal_code',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Postal Code")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'location_coordinates',
      type: 'json',
      interface: 'json',
      uiSchema: {
        type: 'object',
        title: '{{t("Coordinates")}}',
        'x-component': 'Input.JSON',
      },
    },

    // =========================================================================
    // Profile Status
    // =========================================================================
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      defaultValue: 'draft',
      uiSchema: {
        type: 'string',
        title: '{{t("Status")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Draft")}}', value: 'draft', color: 'default' },
          { label: '{{t("Pending Review")}}', value: 'pending_review', color: 'orange' },
          { label: '{{t("Active")}}', value: 'active', color: 'green' },
          { label: '{{t("Inactive")}}', value: 'inactive', color: 'default' },
          { label: '{{t("Suspended")}}', value: 'suspended', color: 'red' },
        ],
      },
    },
    {
      name: 'visibility',
      type: 'string',
      interface: 'select',
      defaultValue: 'public',
      uiSchema: {
        type: 'string',
        title: '{{t("Visibility")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Public")}}', value: 'public' },
          { label: '{{t("Organization Only")}}', value: 'organization_only' },
          { label: '{{t("Private")}}', value: 'private' },
        ],
      },
    },
    {
      name: 'completeness_score',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Profile Completeness")}}',
        'x-component': 'Progress',
        'x-component-props': {
          percent: true,
        },
        'x-read-pretty': true,
      },
    },
    {
      name: 'completeness_details',
      type: 'json',
      interface: 'json',
      uiSchema: {
        type: 'object',
        title: '{{t("Completeness Details")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // SEO & Search
    // =========================================================================
    {
      name: 'keywords',
      type: 'json',
      interface: 'multipleSelect',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Keywords")}}',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'tags',
        },
      },
    },
    {
      name: 'slug',
      type: 'string',
      unique: true,
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Profile URL Slug")}}',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
    },

    // =========================================================================
    // External Links
    // =========================================================================
    {
      name: 'linkedin_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("LinkedIn")}}',
        'x-component': 'Input',
        'x-component-props': {
          addonBefore: 'linkedin.com/in/',
        },
      },
    },
    {
      name: 'github_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("GitHub")}}',
        'x-component': 'Input',
        'x-component-props': {
          addonBefore: 'github.com/',
        },
      },
    },
    {
      name: 'portfolio_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Portfolio Website")}}',
        'x-component': 'Input',
      },
    },

    // =========================================================================
    // Stats & Metrics
    // =========================================================================
    {
      name: 'views_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Profile Views")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'applications_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Applications")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'missions_count',
      type: 'integer',
      interface: 'number',
      defaultValue: 0,
      uiSchema: {
        type: 'number',
        title: '{{t("Missions Completed")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true,
      },
    },
    {
      name: 'average_rating',
      type: 'decimal',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Average Rating")}}',
        'x-component': 'Rate',
        'x-read-pretty': true,
      },
    },
    {
      name: 'last_activity_at',
      type: 'date',
      interface: 'datetime',
      uiSchema: {
        type: 'datetime',
        title: '{{t("Last Activity")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        'x-read-pretty': true,
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
      name: 'user',
      type: 'belongsTo',
      target: 'prestago_users',
      foreignKey: 'user_id',
    },
    {
      name: 'organization',
      type: 'belongsTo',
      target: 'prestago_organizations',
      foreignKey: 'organization_id',
    },
    {
      name: 'profile_skills',
      type: 'hasMany',
      target: 'prestago_profile_skills',
      foreignKey: 'profile_id',
    },
    {
      name: 'experiences',
      type: 'hasMany',
      target: 'prestago_experiences',
      foreignKey: 'profile_id',
    },
    {
      name: 'educations',
      type: 'hasMany',
      target: 'prestago_educations',
      foreignKey: 'profile_id',
    },
    {
      name: 'certifications',
      type: 'hasMany',
      target: 'prestago_certifications',
      foreignKey: 'profile_id',
    },
    {
      name: 'languages',
      type: 'hasMany',
      target: 'prestago_languages',
      foreignKey: 'profile_id',
    },
    {
      name: 'documents',
      type: 'hasMany',
      target: 'prestago_profile_documents',
      foreignKey: 'profile_id',
    },
  ],

  // ===========================================================================
  // Indexes
  // ===========================================================================
  indexes: [
    {
      fields: ['user_id'],
      unique: true,
    },
    {
      fields: ['organization_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['visibility'],
    },
    {
      fields: ['availability_status'],
    },
    {
      fields: ['experience_level'],
    },
    {
      fields: ['work_mode'],
    },
    {
      fields: ['location_country'],
    },
    {
      fields: ['location_city'],
    },
    {
      fields: ['daily_rate_min', 'daily_rate_max'],
    },
    {
      fields: ['completeness_score'],
    },
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['title', 'headline', 'summary'],
      type: 'FULLTEXT',
    },
  ],
};

export default consultantProfilesCollection;
