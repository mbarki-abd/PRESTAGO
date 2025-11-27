// =============================================================================
// PRESTAGO - Educations Collection
// =============================================================================

import { CollectionOptions } from '@nocobase/database';

export const educationsCollection: CollectionOptions = {
  name: 'prestago_educations',
  title: 'Educations',
  sortable: 'sort_order',
  model: 'EducationModel',
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
    // Institution Information
    // =========================================================================
    {
      name: 'institution_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Institution Name")}}',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'institution_logo_url',
      type: 'string',
      interface: 'url',
      uiSchema: {
        type: 'string',
        title: '{{t("Institution Logo")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'institution_country',
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
          { label: 'United Kingdom', value: 'GB' },
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'Spain', value: 'ES' },
          { label: 'Italy', value: 'IT' },
          { label: 'Netherlands', value: 'NL' },
          { label: 'Other', value: 'OTHER' },
        ],
      },
    },
    {
      name: 'institution_city',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("City")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'institution_type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Institution Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("University")}}', value: 'university' },
          { label: '{{t("Engineering School")}}', value: 'engineering_school' },
          { label: '{{t("Business School")}}', value: 'business_school' },
          { label: '{{t("Technical School")}}', value: 'technical_school' },
          { label: '{{t("Training Center")}}', value: 'training_center' },
          { label: '{{t("Online Platform")}}', value: 'online' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },

    // =========================================================================
    // Degree Information
    // =========================================================================
    {
      name: 'degree',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Degree")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("CAP/BEP")}}', value: 'cap_bep' },
          { label: '{{t("Baccalauréat")}}', value: 'bac' },
          { label: '{{t("BTS/DUT (Bac+2)")}}', value: 'bac2' },
          { label: '{{t("Licence (Bac+3)")}}', value: 'bac3' },
          { label: '{{t("Master 1 (Bac+4)")}}', value: 'bac4' },
          { label: '{{t("Master 2 (Bac+5)")}}', value: 'bac5' },
          { label: '{{t("Engineering Degree")}}', value: 'engineering' },
          { label: '{{t("MBA")}}', value: 'mba' },
          { label: '{{t("PhD / Doctorate")}}', value: 'phd' },
          { label: '{{t("Certificate")}}', value: 'certificate' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },
    {
      name: 'degree_name',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Degree Name")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Master en Informatique',
        },
      },
    },
    {
      name: 'field_of_study',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Field of Study")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Computer Science, Business Administration',
        },
        required: true,
      },
    },
    {
      name: 'specialization',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Specialization")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Machine Learning, Finance',
        },
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
        title: '{{t("Currently studying")}}',
        'x-component': 'Checkbox',
      },
    },

    // =========================================================================
    // Academic Performance
    // =========================================================================
    {
      name: 'grade',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Grade/GPA")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Mention Bien, 3.8/4.0',
        },
      },
    },
    {
      name: 'honors',
      type: 'string',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Honors")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Summa Cum Laude")}}', value: 'summa_cum_laude' },
          { label: '{{t("Magna Cum Laude")}}', value: 'magna_cum_laude' },
          { label: '{{t("Cum Laude")}}', value: 'cum_laude' },
          { label: '{{t("Mention Très Bien")}}', value: 'tres_bien' },
          { label: '{{t("Mention Bien")}}', value: 'bien' },
          { label: '{{t("Mention Assez Bien")}}', value: 'assez_bien' },
          { label: '{{t("None")}}', value: 'none' },
        ],
      },
    },
    {
      name: 'ranking',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Class Ranking")}}',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: 'e.g., Top 10%, 5/120',
        },
      },
    },

    // =========================================================================
    // Details
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
          placeholder: 'Describe your studies, thesis, or notable projects',
        },
      },
    },
    {
      name: 'thesis_title',
      type: 'string',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: '{{t("Thesis Title")}}',
        'x-component': 'Input',
      },
    },
    {
      name: 'activities',
      type: 'json',
      interface: 'json',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Activities & Societies")}}',
        'x-component': 'ArrayItems',
        items: {
          type: 'string',
          'x-component': 'Input',
        },
      },
    },
    {
      name: 'courses',
      type: 'json',
      interface: 'json',
      defaultValue: [],
      uiSchema: {
        type: 'array',
        title: '{{t("Notable Courses")}}',
        'x-component': 'ArrayItems',
        items: {
          type: 'string',
          'x-component': 'Input',
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
      name: 'diploma_document_id',
      type: 'uuid',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Diploma Document")}}',
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
      fields: ['profile_id'],
    },
    {
      fields: ['institution_name'],
    },
    {
      fields: ['degree'],
    },
    {
      fields: ['field_of_study'],
    },
    {
      fields: ['start_date'],
    },
    {
      fields: ['end_date'],
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
      fields: ['institution_name', 'field_of_study'],
      type: 'FULLTEXT',
    },
  ],
};

export default educationsCollection;
