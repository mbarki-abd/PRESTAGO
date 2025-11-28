/**
 * PRESTAGO - Auto Setup Script
 * =============================================================================
 * This script automatically configures:
 * 1. All PRESTAGO collections with fields
 * 2. Relationships between collections
 * 3. Pages with Table blocks, Forms, and Actions
 * 4. Sample/Demo data for testing
 * 5. Menu structure
 * =============================================================================
 */

const BASE_URL = process.env.PRESTAGO_URL || 'https://prestago.ilinqsoft.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nocobase.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = null;

// =============================================================================
// API Utilities
// =============================================================================

async function login() {
  console.log('🔐 Logging in to NocoBase...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth:signIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    const data = await response.json();
    if (data.data?.token) {
      authToken = data.data.token;
      console.log('✅ Login successful\n');
      return true;
    }
    console.error('❌ Login failed:', data);
    return false;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, options);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

function generateUid(prefix = 'prstg') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// Collection Definitions with Full Field Configurations
// =============================================================================

const COLLECTIONS = {
  // Organizations
  prestago_organizations: {
    title: 'Organizations',
    icon: 'BankOutlined',
    sortable: true,
    fields: [
      { name: 'name', type: 'string', interface: 'input', uiSchema: { title: 'Name', required: true, 'x-component': 'Input' } },
      { name: 'type', type: 'string', interface: 'select', uiSchema: {
        title: 'Type',
        enum: [
          { value: 'client', label: 'Client', color: 'blue' },
          { value: 'esn', label: 'ESN', color: 'green' },
          { value: 'freelance', label: 'Freelance', color: 'orange' }
        ]
      }},
      { name: 'siret', type: 'string', interface: 'input', uiSchema: { title: 'SIRET' } },
      { name: 'address', type: 'text', interface: 'textarea', uiSchema: { title: 'Address' } },
      { name: 'city', type: 'string', interface: 'input', uiSchema: { title: 'City' } },
      { name: 'country', type: 'string', interface: 'input', defaultValue: 'France', uiSchema: { title: 'Country' } },
      { name: 'email', type: 'string', interface: 'email', uiSchema: { title: 'Email' } },
      { name: 'phone', type: 'string', interface: 'phone', uiSchema: { title: 'Phone' } },
      { name: 'website', type: 'string', interface: 'url', uiSchema: { title: 'Website' } },
      { name: 'logo', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Logo' } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'active', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'inactive', label: 'Inactive', color: 'default' },
          { value: 'pending', label: 'Pending', color: 'orange' }
        ]
      }}
    ],
    tableColumns: ['name', 'type', 'city', 'email', 'status', 'createdAt'],
    formFields: ['name', 'type', 'siret', 'email', 'phone', 'address', 'city', 'country', 'website', 'status']
  },

  // Consultants
  prestago_consultants: {
    title: 'Consultants',
    icon: 'UserOutlined',
    sortable: true,
    fields: [
      { name: 'first_name', type: 'string', interface: 'input', uiSchema: { title: 'First Name', required: true } },
      { name: 'last_name', type: 'string', interface: 'input', uiSchema: { title: 'Last Name', required: true } },
      { name: 'email', type: 'string', interface: 'email', uiSchema: { title: 'Email', required: true } },
      { name: 'phone', type: 'string', interface: 'phone', uiSchema: { title: 'Phone' } },
      { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Job Title' } },
      { name: 'summary', type: 'text', interface: 'richText', uiSchema: { title: 'Professional Summary' } },
      { name: 'daily_rate', type: 'float', interface: 'number', uiSchema: { title: 'Daily Rate (€)', 'x-component-props': { precision: 2 } } },
      { name: 'years_experience', type: 'integer', interface: 'integer', uiSchema: { title: 'Years of Experience' } },
      { name: 'location', type: 'string', interface: 'input', uiSchema: { title: 'Location' } },
      { name: 'remote_ok', type: 'boolean', interface: 'checkbox', defaultValue: true, uiSchema: { title: 'Remote OK' } },
      { name: 'availability', type: 'string', interface: 'select', defaultValue: 'available', uiSchema: {
        title: 'Availability',
        enum: [
          { value: 'available', label: 'Available', color: 'green' },
          { value: 'busy', label: 'Busy', color: 'red' },
          { value: 'partially', label: 'Partially Available', color: 'orange' }
        ]
      }},
      { name: 'available_from', type: 'date', interface: 'datetime', uiSchema: { title: 'Available From' } },
      { name: 'cv', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'CV / Resume' } },
      { name: 'photo', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Photo' } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'active', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'inactive', label: 'Inactive', color: 'default' },
          { value: 'pending', label: 'Pending Validation', color: 'orange' }
        ]
      }}
    ],
    tableColumns: ['first_name', 'last_name', 'title', 'daily_rate', 'availability', 'status'],
    formFields: ['first_name', 'last_name', 'email', 'phone', 'title', 'daily_rate', 'years_experience', 'location', 'remote_ok', 'availability', 'available_from', 'summary', 'status']
  },

  // Skills
  prestago_skills: {
    title: 'Skills',
    icon: 'StarOutlined',
    sortable: true,
    fields: [
      { name: 'name', type: 'string', interface: 'input', uiSchema: { title: 'Skill Name', required: true } },
      { name: 'category', type: 'string', interface: 'select', uiSchema: {
        title: 'Category',
        enum: [
          { value: 'language', label: 'Programming Language', color: 'blue' },
          { value: 'framework', label: 'Framework', color: 'purple' },
          { value: 'database', label: 'Database', color: 'green' },
          { value: 'cloud', label: 'Cloud / DevOps', color: 'orange' },
          { value: 'soft', label: 'Soft Skills', color: 'pink' },
          { value: 'methodology', label: 'Methodology', color: 'cyan' },
          { value: 'tool', label: 'Tool', color: 'default' }
        ]
      }},
      { name: 'description', type: 'text', interface: 'textarea', uiSchema: { title: 'Description' } },
      { name: 'aliases', type: 'string', interface: 'input', uiSchema: { title: 'Aliases (comma-separated)' } }
    ],
    tableColumns: ['name', 'category', 'description'],
    formFields: ['name', 'category', 'description', 'aliases']
  },

  // RFPs (Appels d'offres)
  prestago_rfps: {
    title: 'RFPs',
    icon: 'FileTextOutlined',
    sortable: true,
    fields: [
      { name: 'reference', type: 'sequence', interface: 'sequence', uiSchema: { title: 'Reference', patterns: [{ type: 'string', options: { value: 'RFP-' } }, { type: 'integer', options: { digits: 5, start: 1 } }] } },
      { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title', required: true } },
      { name: 'description', type: 'text', interface: 'richText', uiSchema: { title: 'Description' } },
      { name: 'requirements', type: 'text', interface: 'richText', uiSchema: { title: 'Requirements' } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'draft', label: 'Draft', color: 'default' },
          { value: 'published', label: 'Published', color: 'blue' },
          { value: 'in_progress', label: 'In Progress', color: 'orange' },
          { value: 'closed', label: 'Closed', color: 'red' },
          { value: 'awarded', label: 'Awarded', color: 'green' }
        ]
      }},
      { name: 'priority', type: 'string', interface: 'select', defaultValue: 'medium', uiSchema: {
        title: 'Priority',
        enum: [
          { value: 'low', label: 'Low', color: 'default' },
          { value: 'medium', label: 'Medium', color: 'blue' },
          { value: 'high', label: 'High', color: 'orange' },
          { value: 'urgent', label: 'Urgent', color: 'red' }
        ]
      }},
      { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Mission Start Date' } },
      { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Mission End Date' } },
      { name: 'deadline', type: 'date', interface: 'datetime', uiSchema: { title: 'Application Deadline' } },
      { name: 'duration_months', type: 'integer', interface: 'integer', uiSchema: { title: 'Duration (months)' } },
      { name: 'budget_min', type: 'float', interface: 'number', uiSchema: { title: 'Budget Min (€/day)' } },
      { name: 'budget_max', type: 'float', interface: 'number', uiSchema: { title: 'Budget Max (€/day)' } },
      { name: 'location', type: 'string', interface: 'input', uiSchema: { title: 'Location' } },
      { name: 'remote_policy', type: 'string', interface: 'select', defaultValue: 'hybrid', uiSchema: {
        title: 'Remote Policy',
        enum: [
          { value: 'onsite', label: 'On-site Only', color: 'red' },
          { value: 'hybrid', label: 'Hybrid', color: 'blue' },
          { value: 'remote', label: 'Full Remote', color: 'green' }
        ]
      }},
      { name: 'attachments', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Attachments' } },
      { name: 'views_count', type: 'integer', interface: 'integer', defaultValue: 0, uiSchema: { title: 'Views' } },
      { name: 'applications_count', type: 'integer', interface: 'integer', defaultValue: 0, uiSchema: { title: 'Applications' } }
    ],
    tableColumns: ['reference', 'title', 'status', 'priority', 'deadline', 'location', 'remote_policy', 'applications_count'],
    formFields: ['title', 'description', 'requirements', 'status', 'priority', 'start_date', 'end_date', 'deadline', 'duration_months', 'budget_min', 'budget_max', 'location', 'remote_policy']
  },

  // Applications
  prestago_applications: {
    title: 'Applications',
    icon: 'SolutionOutlined',
    sortable: true,
    fields: [
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'pending', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'pending', label: 'Pending', color: 'default' },
          { value: 'reviewing', label: 'Reviewing', color: 'blue' },
          { value: 'shortlisted', label: 'Shortlisted', color: 'purple' },
          { value: 'interview', label: 'Interview', color: 'orange' },
          { value: 'accepted', label: 'Accepted', color: 'green' },
          { value: 'rejected', label: 'Rejected', color: 'red' },
          { value: 'withdrawn', label: 'Withdrawn', color: 'default' }
        ]
      }},
      { name: 'cover_letter', type: 'text', interface: 'richText', uiSchema: { title: 'Cover Letter' } },
      { name: 'proposed_rate', type: 'float', interface: 'number', uiSchema: { title: 'Proposed Daily Rate (€)' } },
      { name: 'available_from', type: 'date', interface: 'datetime', uiSchema: { title: 'Available From' } },
      { name: 'matching_score', type: 'integer', interface: 'percent', uiSchema: { title: 'Matching Score' } },
      { name: 'notes', type: 'text', interface: 'textarea', uiSchema: { title: 'Internal Notes' } },
      { name: 'interview_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Interview Date' } },
      { name: 'attachments', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Additional Documents' } }
    ],
    tableColumns: ['status', 'proposed_rate', 'available_from', 'matching_score', 'createdAt'],
    formFields: ['status', 'cover_letter', 'proposed_rate', 'available_from', 'notes', 'interview_date']
  },

  // Missions
  prestago_missions: {
    title: 'Missions',
    icon: 'ProjectOutlined',
    sortable: true,
    fields: [
      { name: 'reference', type: 'sequence', interface: 'sequence', uiSchema: { title: 'Reference', patterns: [{ type: 'string', options: { value: 'MIS-' } }, { type: 'integer', options: { digits: 5, start: 1 } }] } },
      { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title', required: true } },
      { name: 'description', type: 'text', interface: 'richText', uiSchema: { title: 'Description' } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'draft', label: 'Draft', color: 'default' },
          { value: 'pending_start', label: 'Pending Start', color: 'orange' },
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'on_hold', label: 'On Hold', color: 'blue' },
          { value: 'completed', label: 'Completed', color: 'purple' },
          { value: 'cancelled', label: 'Cancelled', color: 'red' }
        ]
      }},
      { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Start Date' } },
      { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'End Date' } },
      { name: 'daily_rate', type: 'float', interface: 'number', uiSchema: { title: 'Daily Rate (€)' } },
      { name: 'total_days', type: 'integer', interface: 'integer', uiSchema: { title: 'Total Days Planned' } },
      { name: 'days_worked', type: 'integer', interface: 'integer', defaultValue: 0, uiSchema: { title: 'Days Worked' } },
      { name: 'location', type: 'string', interface: 'input', uiSchema: { title: 'Location' } },
      { name: 'remote_policy', type: 'string', interface: 'select', uiSchema: {
        title: 'Remote Policy',
        enum: [
          { value: 'onsite', label: 'On-site', color: 'red' },
          { value: 'hybrid', label: 'Hybrid', color: 'blue' },
          { value: 'remote', label: 'Remote', color: 'green' }
        ]
      }},
      { name: 'progress', type: 'integer', interface: 'percent', defaultValue: 0, uiSchema: { title: 'Progress' } }
    ],
    tableColumns: ['reference', 'title', 'status', 'start_date', 'end_date', 'daily_rate', 'progress'],
    formFields: ['title', 'description', 'status', 'start_date', 'end_date', 'daily_rate', 'total_days', 'location', 'remote_policy']
  },

  // Timesheets
  prestago_timesheets: {
    title: 'Timesheets',
    icon: 'CalendarOutlined',
    sortable: true,
    fields: [
      { name: 'reference', type: 'sequence', interface: 'sequence', uiSchema: { title: 'Reference', patterns: [{ type: 'string', options: { value: 'CRA-' } }, { type: 'integer', options: { digits: 6, start: 1 } }] } },
      { name: 'period_start', type: 'date', interface: 'datetime', uiSchema: { title: 'Period Start', required: true } },
      { name: 'period_end', type: 'date', interface: 'datetime', uiSchema: { title: 'Period End', required: true } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'draft', label: 'Draft', color: 'default' },
          { value: 'submitted', label: 'Submitted', color: 'blue' },
          { value: 'approved_l1', label: 'Approved L1', color: 'cyan' },
          { value: 'approved_l2', label: 'Approved L2', color: 'purple' },
          { value: 'approved', label: 'Final Approved', color: 'green' },
          { value: 'rejected', label: 'Rejected', color: 'red' }
        ]
      }},
      { name: 'total_days', type: 'float', interface: 'number', uiSchema: { title: 'Total Days', 'x-component-props': { precision: 1 } } },
      { name: 'billable_days', type: 'float', interface: 'number', uiSchema: { title: 'Billable Days', 'x-component-props': { precision: 1 } } },
      { name: 'non_billable_days', type: 'float', interface: 'number', defaultValue: 0, uiSchema: { title: 'Non-Billable Days' } },
      { name: 'leave_days', type: 'float', interface: 'number', defaultValue: 0, uiSchema: { title: 'Leave Days' } },
      { name: 'notes', type: 'text', interface: 'textarea', uiSchema: { title: 'Notes' } },
      { name: 'rejection_reason', type: 'text', interface: 'textarea', uiSchema: { title: 'Rejection Reason' } },
      { name: 'submitted_at', type: 'date', interface: 'datetime', uiSchema: { title: 'Submitted At' } },
      { name: 'approved_at', type: 'date', interface: 'datetime', uiSchema: { title: 'Approved At' } }
    ],
    tableColumns: ['reference', 'period_start', 'period_end', 'status', 'total_days', 'billable_days', 'submitted_at'],
    formFields: ['period_start', 'period_end', 'total_days', 'billable_days', 'non_billable_days', 'leave_days', 'notes']
  },

  // Invoices
  prestago_invoices: {
    title: 'Invoices',
    icon: 'DollarOutlined',
    sortable: true,
    fields: [
      { name: 'invoice_number', type: 'sequence', interface: 'sequence', uiSchema: { title: 'Invoice Number', patterns: [{ type: 'string', options: { value: 'INV-' } }, { type: 'date', options: { format: 'YYYYMM' } }, { type: 'string', options: { value: '-' } }, { type: 'integer', options: { digits: 4, start: 1 } }] } },
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'draft', label: 'Draft', color: 'default' },
          { value: 'pending', label: 'Pending Approval', color: 'orange' },
          { value: 'sent', label: 'Sent', color: 'blue' },
          { value: 'paid', label: 'Paid', color: 'green' },
          { value: 'partially_paid', label: 'Partially Paid', color: 'cyan' },
          { value: 'overdue', label: 'Overdue', color: 'red' },
          { value: 'cancelled', label: 'Cancelled', color: 'default' }
        ]
      }},
      { name: 'amount_ht', type: 'float', interface: 'number', uiSchema: { title: 'Amount HT (€)', 'x-component-props': { precision: 2 } } },
      { name: 'vat_rate', type: 'float', interface: 'number', defaultValue: 20, uiSchema: { title: 'VAT Rate (%)', 'x-component-props': { precision: 1 } } },
      { name: 'vat_amount', type: 'float', interface: 'number', uiSchema: { title: 'VAT Amount (€)' } },
      { name: 'amount_ttc', type: 'float', interface: 'number', uiSchema: { title: 'Amount TTC (€)' } },
      { name: 'issue_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Issue Date' } },
      { name: 'due_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Due Date' } },
      { name: 'paid_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Paid Date' } },
      { name: 'paid_amount', type: 'float', interface: 'number', defaultValue: 0, uiSchema: { title: 'Paid Amount (€)' } },
      { name: 'payment_method', type: 'string', interface: 'select', uiSchema: {
        title: 'Payment Method',
        enum: [
          { value: 'transfer', label: 'Bank Transfer', color: 'blue' },
          { value: 'check', label: 'Check', color: 'default' },
          { value: 'card', label: 'Card', color: 'purple' }
        ]
      }},
      { name: 'notes', type: 'text', interface: 'textarea', uiSchema: { title: 'Notes' } },
      { name: 'pdf_file', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Invoice PDF' } }
    ],
    tableColumns: ['invoice_number', 'status', 'amount_ht', 'amount_ttc', 'issue_date', 'due_date', 'paid_date'],
    formFields: ['status', 'amount_ht', 'vat_rate', 'issue_date', 'due_date', 'payment_method', 'notes']
  },

  // Contracts
  prestago_contracts: {
    title: 'Contracts',
    icon: 'FileProtectOutlined',
    sortable: true,
    fields: [
      { name: 'contract_number', type: 'sequence', interface: 'sequence', uiSchema: { title: 'Contract Number', patterns: [{ type: 'string', options: { value: 'CTR-' } }, { type: 'integer', options: { digits: 5, start: 1 } }] } },
      { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title' } },
      { name: 'type', type: 'string', interface: 'select', uiSchema: {
        title: 'Type',
        enum: [
          { value: 'service', label: 'Service Agreement', color: 'blue' },
          { value: 'freelance', label: 'Freelance Contract', color: 'green' },
          { value: 'nda', label: 'NDA', color: 'purple' },
          { value: 'framework', label: 'Framework Agreement', color: 'orange' },
          { value: 'amendment', label: 'Amendment', color: 'cyan' }
        ]
      }},
      { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: {
        title: 'Status',
        enum: [
          { value: 'draft', label: 'Draft', color: 'default' },
          { value: 'pending_review', label: 'Pending Review', color: 'orange' },
          { value: 'pending_signature', label: 'Pending Signature', color: 'blue' },
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'expired', label: 'Expired', color: 'red' },
          { value: 'terminated', label: 'Terminated', color: 'default' }
        ]
      }},
      { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Start Date' } },
      { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'End Date' } },
      { name: 'signed_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Signed Date' } },
      { name: 'value', type: 'float', interface: 'number', uiSchema: { title: 'Contract Value (€)' } },
      { name: 'terms', type: 'text', interface: 'richText', uiSchema: { title: 'Terms & Conditions' } },
      { name: 'document', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Contract Document' } },
      { name: 'signed_document', type: 'belongsToMany', target: 'attachments', interface: 'attachment', uiSchema: { title: 'Signed Document' } }
    ],
    tableColumns: ['contract_number', 'title', 'type', 'status', 'start_date', 'end_date', 'value'],
    formFields: ['title', 'type', 'status', 'start_date', 'end_date', 'value', 'terms']
  },

  // Notifications
  prestago_notifications: {
    title: 'Notifications',
    icon: 'BellOutlined',
    sortable: true,
    fields: [
      { name: 'type', type: 'string', interface: 'select', uiSchema: {
        title: 'Type',
        enum: [
          { value: 'info', label: 'Info', color: 'blue' },
          { value: 'success', label: 'Success', color: 'green' },
          { value: 'warning', label: 'Warning', color: 'orange' },
          { value: 'error', label: 'Error', color: 'red' }
        ]
      }},
      { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title' } },
      { name: 'content', type: 'text', interface: 'richText', uiSchema: { title: 'Content' } },
      { name: 'link', type: 'string', interface: 'url', uiSchema: { title: 'Link' } },
      { name: 'read', type: 'boolean', interface: 'checkbox', defaultValue: false, uiSchema: { title: 'Read' } },
      { name: 'read_at', type: 'date', interface: 'datetime', uiSchema: { title: 'Read At' } }
    ],
    tableColumns: ['type', 'title', 'read', 'createdAt'],
    formFields: ['type', 'title', 'content', 'link']
  },

  // Reports/Dashboards
  prestago_reports: {
    title: 'Reports',
    icon: 'BarChartOutlined',
    sortable: true,
    fields: [
      { name: 'name', type: 'string', interface: 'input', uiSchema: { title: 'Report Name' } },
      { name: 'type', type: 'string', interface: 'select', uiSchema: {
        title: 'Type',
        enum: [
          { value: 'kpi', label: 'KPI Dashboard', color: 'blue' },
          { value: 'financial', label: 'Financial Report', color: 'green' },
          { value: 'operational', label: 'Operational Report', color: 'orange' },
          { value: 'custom', label: 'Custom Report', color: 'purple' }
        ]
      }},
      { name: 'description', type: 'text', interface: 'textarea', uiSchema: { title: 'Description' } },
      { name: 'config', type: 'json', interface: 'json', uiSchema: { title: 'Configuration' } },
      { name: 'is_public', type: 'boolean', interface: 'checkbox', defaultValue: false, uiSchema: { title: 'Public' } }
    ],
    tableColumns: ['name', 'type', 'is_public', 'createdAt'],
    formFields: ['name', 'type', 'description', 'is_public']
  }
};

// =============================================================================
// Sample Data
// =============================================================================

const SAMPLE_DATA = {
  prestago_organizations: [
    { name: 'TechCorp France', type: 'client', siret: '12345678901234', city: 'Paris', email: 'contact@techcorp.fr', phone: '+33 1 23 45 67 89', status: 'active' },
    { name: 'Digital Services ESN', type: 'esn', siret: '98765432109876', city: 'Lyon', email: 'contact@digitalservices.fr', phone: '+33 4 56 78 90 12', status: 'active' },
    { name: 'StartupAI', type: 'client', siret: '11223344556677', city: 'Bordeaux', email: 'hello@startupai.io', phone: '+33 5 67 89 01 23', status: 'active' },
    { name: 'ConsultPro', type: 'esn', siret: '99887766554433', city: 'Toulouse', email: 'info@consultpro.fr', phone: '+33 5 12 34 56 78', status: 'active' }
  ],
  prestago_consultants: [
    { first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78', title: 'Senior Full Stack Developer', daily_rate: 650, years_experience: 8, location: 'Paris', availability: 'available', status: 'active' },
    { first_name: 'Marie', last_name: 'Martin', email: 'marie.martin@email.com', phone: '+33 6 23 45 67 89', title: 'DevOps Engineer', daily_rate: 700, years_experience: 6, location: 'Lyon', availability: 'available', status: 'active' },
    { first_name: 'Pierre', last_name: 'Bernard', email: 'pierre.bernard@email.com', phone: '+33 6 34 56 78 90', title: 'Data Scientist', daily_rate: 750, years_experience: 5, location: 'Paris', availability: 'partially', status: 'active' },
    { first_name: 'Sophie', last_name: 'Leroy', email: 'sophie.leroy@email.com', phone: '+33 6 45 67 89 01', title: 'UX/UI Designer', daily_rate: 550, years_experience: 7, location: 'Bordeaux', availability: 'available', status: 'active' },
    { first_name: 'Thomas', last_name: 'Moreau', email: 'thomas.moreau@email.com', phone: '+33 6 56 78 90 12', title: 'Cloud Architect', daily_rate: 800, years_experience: 10, location: 'Paris', availability: 'busy', status: 'active' }
  ],
  prestago_skills: [
    { name: 'JavaScript', category: 'language', description: 'Modern JavaScript (ES6+)' },
    { name: 'TypeScript', category: 'language', description: 'TypeScript for type-safe development' },
    { name: 'Python', category: 'language', description: 'Python programming language' },
    { name: 'React', category: 'framework', description: 'React.js frontend framework' },
    { name: 'Node.js', category: 'framework', description: 'Node.js runtime environment' },
    { name: 'PostgreSQL', category: 'database', description: 'PostgreSQL relational database' },
    { name: 'MongoDB', category: 'database', description: 'MongoDB NoSQL database' },
    { name: 'AWS', category: 'cloud', description: 'Amazon Web Services' },
    { name: 'Docker', category: 'cloud', description: 'Docker containerization' },
    { name: 'Kubernetes', category: 'cloud', description: 'Kubernetes orchestration' },
    { name: 'Agile/Scrum', category: 'methodology', description: 'Agile methodology and Scrum framework' },
    { name: 'Git', category: 'tool', description: 'Git version control' }
  ],
  prestago_rfps: [
    { title: 'Full Stack Developer for E-commerce Platform', description: 'Looking for an experienced Full Stack developer to work on our e-commerce platform. The ideal candidate should have strong experience with React, Node.js, and PostgreSQL.', status: 'published', priority: 'high', start_date: '2025-02-01', duration_months: 6, budget_min: 550, budget_max: 700, location: 'Paris', remote_policy: 'hybrid' },
    { title: 'DevOps Engineer - Cloud Migration', description: 'Seeking a DevOps engineer to lead our cloud migration project to AWS. Experience with Kubernetes, Terraform, and CI/CD pipelines required.', status: 'published', priority: 'urgent', start_date: '2025-01-15', duration_months: 4, budget_min: 650, budget_max: 800, location: 'Lyon', remote_policy: 'remote' },
    { title: 'Data Scientist for AI Product', description: 'Join our AI team to develop machine learning models for our SaaS product. Strong Python, TensorFlow/PyTorch experience needed.', status: 'draft', priority: 'medium', start_date: '2025-03-01', duration_months: 12, budget_min: 700, budget_max: 850, location: 'Paris', remote_policy: 'hybrid' }
  ],
  prestago_missions: [
    { title: 'E-commerce Backend Development', description: 'Development of new microservices for the e-commerce platform', status: 'active', start_date: '2024-11-01', end_date: '2025-04-30', daily_rate: 650, total_days: 120, days_worked: 45, location: 'Paris', remote_policy: 'hybrid', progress: 38 },
    { title: 'Cloud Infrastructure Setup', description: 'Setup and configuration of AWS infrastructure', status: 'active', start_date: '2024-12-01', end_date: '2025-03-31', daily_rate: 750, total_days: 80, days_worked: 20, location: 'Lyon', remote_policy: 'remote', progress: 25 }
  ],
  prestago_timesheets: [
    { period_start: '2024-11-01', period_end: '2024-11-30', status: 'approved', total_days: 21, billable_days: 20, non_billable_days: 1, leave_days: 0 },
    { period_start: '2024-12-01', period_end: '2024-12-31', status: 'submitted', total_days: 20, billable_days: 18, non_billable_days: 0, leave_days: 2 }
  ],
  prestago_invoices: [
    { status: 'paid', amount_ht: 13000, vat_rate: 20, vat_amount: 2600, amount_ttc: 15600, issue_date: '2024-12-01', due_date: '2024-12-31', paid_date: '2024-12-15', payment_method: 'transfer' },
    { status: 'sent', amount_ht: 11700, vat_rate: 20, vat_amount: 2340, amount_ttc: 14040, issue_date: '2025-01-01', due_date: '2025-01-31', payment_method: 'transfer' }
  ],
  prestago_contracts: [
    { title: 'Service Agreement - TechCorp', type: 'service', status: 'active', start_date: '2024-11-01', end_date: '2025-04-30', value: 78000 },
    { title: 'Framework Agreement - Digital Services', type: 'framework', status: 'active', start_date: '2024-01-01', end_date: '2025-12-31', value: 500000 }
  ]
};

// =============================================================================
// Main Setup Functions
// =============================================================================

async function createCollection(name, config) {
  console.log(`📦 Creating collection: ${name}...`);

  const collectionDef = {
    name: name,
    title: config.title,
    sortable: config.sortable || false,
    createdBy: true,
    updatedBy: true,
    logging: true,
    fields: config.fields
  };

  const result = await apiCall('POST', 'collections:create', collectionDef);

  if (result.errors) {
    if (result.errors[0]?.message?.includes('already exists') || result.errors[0]?.message?.includes('duplicate')) {
      console.log(`   ⚠️  Collection already exists, updating fields...`);
      // Try to update fields
      for (const field of config.fields) {
        await apiCall('POST', `collections/${name}/fields:create`, field);
      }
    } else {
      console.log(`   ❌ Error: ${result.errors[0]?.message}`);
    }
  } else {
    console.log(`   ✅ Created successfully`);
  }

  await sleep(200);
  return result;
}

async function createUISchema(collectionName, config) {
  console.log(`🎨 Creating UI schema for: ${collectionName}...`);

  const uid = generateUid('page');
  const tableUid = generateUid('tbl');
  const formUid = generateUid('frm');

  // Build table columns schema
  const columnsSchema = {};
  for (const col of config.tableColumns) {
    const colUid = generateUid('col');
    columnsSchema[colUid] = {
      type: 'void',
      'x-component': 'TableV2.Column',
      'x-component-props': {},
      properties: {
        [col]: {
          type: 'string',
          'x-component': 'CollectionField',
          'x-read-pretty': true
        }
      }
    };
  }

  // Add actions column
  columnsSchema[generateUid('act')] = {
    type: 'void',
    title: 'Actions',
    'x-component': 'TableV2.Column',
    properties: {
      actions: {
        type: 'void',
        'x-component': 'Space',
        properties: {
          view: {
            type: 'void',
            title: 'View',
            'x-component': 'Action.Link',
            'x-component-props': {
              openMode: 'drawer'
            }
          },
          edit: {
            type: 'void',
            title: 'Edit',
            'x-component': 'Action.Link',
            'x-component-props': {
              openMode: 'drawer'
            }
          },
          delete: {
            type: 'void',
            title: 'Delete',
            'x-component': 'Action.Link',
            'x-action': 'destroy',
            'x-component-props': {
              confirm: {
                title: 'Delete record',
                content: 'Are you sure you want to delete this record?'
              }
            }
          }
        }
      }
    }
  };

  // Build form fields schema
  const formFieldsSchema = {};
  for (const field of config.formFields) {
    const fieldUid = generateUid('fld');
    formFieldsSchema[fieldUid] = {
      type: 'string',
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
      'x-collection-field': `${collectionName}.${field}`
    };
  }

  const schema = {
    type: 'void',
    'x-uid': uid,
    'x-component': 'Page',
    properties: {
      [tableUid]: {
        type: 'void',
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection: collectionName,
          action: 'list',
          params: {
            pageSize: 20
          },
          rowKey: 'id',
          showIndex: true,
          dragSort: false
        },
        'x-component': 'CardItem',
        'x-component-props': {
          title: config.title
        },
        properties: {
          actions: {
            type: 'void',
            'x-component': 'ActionBar',
            'x-component-props': {
              style: { marginBottom: 16 }
            },
            properties: {
              filter: {
                type: 'void',
                title: 'Filter',
                'x-component': 'Filter.Action',
                'x-component-props': {
                  icon: 'FilterOutlined'
                }
              },
              refresh: {
                type: 'void',
                title: 'Refresh',
                'x-component': 'Action',
                'x-component-props': {
                  icon: 'ReloadOutlined'
                },
                'x-action': 'refresh'
              },
              add: {
                type: 'void',
                title: 'Add new',
                'x-component': 'Action',
                'x-component-props': {
                  type: 'primary',
                  icon: 'PlusOutlined',
                  openMode: 'drawer'
                },
                properties: {
                  drawer: {
                    type: 'void',
                    title: `Add ${config.title}`,
                    'x-component': 'Action.Drawer',
                    'x-component-props': {
                      destroyOnClose: true
                    },
                    properties: {
                      form: {
                        type: 'void',
                        'x-decorator': 'FormBlockProvider',
                        'x-decorator-props': {
                          collection: collectionName
                        },
                        'x-component': 'CardItem',
                        properties: {
                          grid: {
                            type: 'void',
                            'x-component': 'FormV2',
                            properties: {
                              ...formFieldsSchema,
                              actions: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-component-props': {
                                  layout: 'one-column',
                                  style: { marginTop: 24 }
                                },
                                properties: {
                                  cancel: {
                                    type: 'void',
                                    title: 'Cancel',
                                    'x-component': 'Action',
                                    'x-component-props': {
                                      useAction: '{{ useCancelAction }}'
                                    }
                                  },
                                  submit: {
                                    type: 'void',
                                    title: 'Submit',
                                    'x-component': 'Action',
                                    'x-action': 'create',
                                    'x-component-props': {
                                      type: 'primary'
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          table: {
            type: 'array',
            'x-component': 'TableV2',
            'x-component-props': {
              rowKey: 'id',
              rowSelection: { type: 'checkbox' }
            },
            properties: columnsSchema
          }
        }
      }
    }
  };

  return { uid, schema };
}

async function insertSampleData(collectionName, data) {
  if (!data || data.length === 0) return;

  console.log(`📝 Inserting sample data for: ${collectionName}...`);

  for (const item of data) {
    const result = await apiCall('POST', `${collectionName}:create`, item);
    if (result.errors) {
      console.log(`   ⚠️  ${result.errors[0]?.message}`);
    }
  }
  console.log(`   ✅ Inserted ${data.length} records`);
  await sleep(100);
}

async function createMenuStructure() {
  console.log('\n📋 Creating PRESTAGO menu structure...\n');

  const menuItems = Object.entries(COLLECTIONS).map(([name, config]) => ({
    name: name,
    title: config.title,
    icon: config.icon
  }));

  // Create PRESTAGO submenu
  const prestagoMenuUid = generateUid('menu');
  const menuSchema = {
    type: 'void',
    title: 'PRESTAGO',
    'x-component': 'Menu.SubMenu',
    'x-component-props': {
      icon: 'AppstoreOutlined'
    },
    'x-uid': prestagoMenuUid,
    properties: {}
  };

  for (const item of menuItems) {
    const itemUid = generateUid('item');
    const pageData = await createUISchema(item.name, COLLECTIONS[item.name]);

    menuSchema.properties[itemUid] = {
      type: 'void',
      title: item.title,
      'x-component': 'Menu.Item',
      'x-component-props': {
        icon: item.icon
      },
      'x-uid': itemUid,
      properties: {
        page: pageData.schema
      }
    };
    console.log(`   ✅ Added menu: ${item.title}`);
  }

  // Insert menu
  const result = await apiCall('POST', 'uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
    schema: menuSchema
  });

  if (result.errors) {
    console.log(`\n⚠️  Menu creation note: ${result.errors[0]?.message}`);
  } else {
    console.log('\n✅ Menu structure created successfully!');
  }

  return result;
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         PRESTAGO - Automatic Setup & Configuration             ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Server: ${BASE_URL.padEnd(52)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Login
  if (!await login()) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Step 1: Create Collections
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('STEP 1: Creating Collections');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  for (const [name, config] of Object.entries(COLLECTIONS)) {
    await createCollection(name, config);
  }

  // Step 2: Create Relationships
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('STEP 2: Creating Relationships');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const relationships = [
    // Consultant belongs to Organization
    { collection: 'prestago_consultants', field: { name: 'organization', type: 'belongsTo', target: 'prestago_organizations', foreignKey: 'organization_id', interface: 'm2o', uiSchema: { title: 'Organization' } } },
    // RFP belongs to Organization (client)
    { collection: 'prestago_rfps', field: { name: 'client', type: 'belongsTo', target: 'prestago_organizations', foreignKey: 'client_id', interface: 'm2o', uiSchema: { title: 'Client' } } },
    // Application belongs to RFP and Consultant
    { collection: 'prestago_applications', field: { name: 'rfp', type: 'belongsTo', target: 'prestago_rfps', foreignKey: 'rfp_id', interface: 'm2o', uiSchema: { title: 'RFP' } } },
    { collection: 'prestago_applications', field: { name: 'consultant', type: 'belongsTo', target: 'prestago_consultants', foreignKey: 'consultant_id', interface: 'm2o', uiSchema: { title: 'Consultant' } } },
    // Mission belongs to RFP, Consultant, Client
    { collection: 'prestago_missions', field: { name: 'rfp', type: 'belongsTo', target: 'prestago_rfps', foreignKey: 'rfp_id', interface: 'm2o', uiSchema: { title: 'RFP' } } },
    { collection: 'prestago_missions', field: { name: 'consultant', type: 'belongsTo', target: 'prestago_consultants', foreignKey: 'consultant_id', interface: 'm2o', uiSchema: { title: 'Consultant' } } },
    { collection: 'prestago_missions', field: { name: 'client', type: 'belongsTo', target: 'prestago_organizations', foreignKey: 'client_id', interface: 'm2o', uiSchema: { title: 'Client' } } },
    // Timesheet belongs to Mission and Consultant
    { collection: 'prestago_timesheets', field: { name: 'mission', type: 'belongsTo', target: 'prestago_missions', foreignKey: 'mission_id', interface: 'm2o', uiSchema: { title: 'Mission' } } },
    { collection: 'prestago_timesheets', field: { name: 'consultant', type: 'belongsTo', target: 'prestago_consultants', foreignKey: 'consultant_id', interface: 'm2o', uiSchema: { title: 'Consultant' } } },
    // Invoice belongs to Mission, Consultant, Client
    { collection: 'prestago_invoices', field: { name: 'mission', type: 'belongsTo', target: 'prestago_missions', foreignKey: 'mission_id', interface: 'm2o', uiSchema: { title: 'Mission' } } },
    { collection: 'prestago_invoices', field: { name: 'consultant', type: 'belongsTo', target: 'prestago_consultants', foreignKey: 'consultant_id', interface: 'm2o', uiSchema: { title: 'Consultant' } } },
    { collection: 'prestago_invoices', field: { name: 'client', type: 'belongsTo', target: 'prestago_organizations', foreignKey: 'client_id', interface: 'm2o', uiSchema: { title: 'Client' } } },
    // Contract belongs to Mission, Consultant, Organization
    { collection: 'prestago_contracts', field: { name: 'mission', type: 'belongsTo', target: 'prestago_missions', foreignKey: 'mission_id', interface: 'm2o', uiSchema: { title: 'Mission' } } },
    { collection: 'prestago_contracts', field: { name: 'consultant', type: 'belongsTo', target: 'prestago_consultants', foreignKey: 'consultant_id', interface: 'm2o', uiSchema: { title: 'Consultant' } } },
    { collection: 'prestago_contracts', field: { name: 'organization', type: 'belongsTo', target: 'prestago_organizations', foreignKey: 'organization_id', interface: 'm2o', uiSchema: { title: 'Organization' } } },
    // Consultant has many Skills (many-to-many)
    { collection: 'prestago_consultants', field: { name: 'skills', type: 'belongsToMany', target: 'prestago_skills', through: 'prestago_consultant_skills', foreignKey: 'consultant_id', otherKey: 'skill_id', interface: 'm2m', uiSchema: { title: 'Skills' } } }
  ];

  for (const rel of relationships) {
    console.log(`🔗 Creating relationship: ${rel.collection}.${rel.field.name}...`);
    const result = await apiCall('POST', `collections/${rel.collection}/fields:create`, rel.field);
    if (result.errors) {
      console.log(`   ⚠️  ${result.errors[0]?.message || 'May already exist'}`);
    } else {
      console.log(`   ✅ Created`);
    }
    await sleep(100);
  }

  // Step 3: Insert Sample Data
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('STEP 3: Inserting Sample Data');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  for (const [collectionName, data] of Object.entries(SAMPLE_DATA)) {
    await insertSampleData(collectionName, data);
  }

  // Step 4: Create Menu & Pages
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('STEP 4: Creating Menu Structure & Pages');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  await createMenuStructure();

  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    SETUP COMPLETE! 🎉                          ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  Collections created: ' + Object.keys(COLLECTIONS).length.toString().padEnd(40) + '║');
  console.log('║  Relationships created: ' + relationships.length.toString().padEnd(38) + '║');
  console.log('║  Sample data sets: ' + Object.keys(SAMPLE_DATA).length.toString().padEnd(42) + '║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  Next steps:                                                   ║');
  console.log('║  1. Refresh your browser                                       ║');
  console.log('║  2. Check the PRESTAGO menu in sidebar                         ║');
  console.log('║  3. Configure table columns in UI Config mode                  ║');
  console.log('║  4. Set up user permissions                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
