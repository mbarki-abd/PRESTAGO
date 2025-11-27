/**
 * PRESTAGO - Setup Collections Script
 * Creates all PRESTAGO collections in NocoBase via API
 */

const BASE_URL = 'https://prestago.ilinqsoft.com';
const ADMIN_EMAIL = 'admin@nocobase.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

async function login() {
  console.log('Logging in...');
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
    console.log('Login successful');
    return true;
  }
  console.error('Login failed:', data);
  return false;
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

  const response = await fetch(`${BASE_URL}/api/${endpoint}`, options);
  return response.json();
}

async function createCollection(collection) {
  console.log(`Creating collection: ${collection.name}...`);
  const result = await apiCall('POST', 'collections:create', collection);
  if (result.errors) {
    console.log(`  - Already exists or error:`, result.errors[0]?.message);
  } else {
    console.log(`  - Created successfully`);
  }
  return result;
}

async function main() {
  // Login
  if (!await login()) {
    process.exit(1);
  }

  // Define PRESTAGO collections
  const collections = [
    // Organizations
    {
      name: 'prestago_organizations',
      title: 'Organizations',
      fields: [
        { name: 'name', type: 'string', interface: 'input', uiSchema: { title: 'Name', 'x-component': 'Input' } },
        { name: 'type', type: 'string', interface: 'select', uiSchema: { title: 'Type', enum: [{ value: 'client', label: 'Client' }, { value: 'esn', label: 'ESN' }, { value: 'freelance', label: 'Freelance' }] } },
        { name: 'siret', type: 'string', interface: 'input', uiSchema: { title: 'SIRET' } },
        { name: 'address', type: 'text', interface: 'textarea', uiSchema: { title: 'Address' } },
        { name: 'email', type: 'string', interface: 'email', uiSchema: { title: 'Email' } },
        { name: 'phone', type: 'string', interface: 'phone', uiSchema: { title: 'Phone' } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'active', uiSchema: { title: 'Status', enum: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] } }
      ]
    },
    // Consultants (Users)
    {
      name: 'prestago_consultants',
      title: 'Consultants',
      fields: [
        { name: 'first_name', type: 'string', interface: 'input', uiSchema: { title: 'First Name' } },
        { name: 'last_name', type: 'string', interface: 'input', uiSchema: { title: 'Last Name' } },
        { name: 'email', type: 'string', interface: 'email', uiSchema: { title: 'Email' } },
        { name: 'phone', type: 'string', interface: 'phone', uiSchema: { title: 'Phone' } },
        { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Job Title' } },
        { name: 'summary', type: 'text', interface: 'textarea', uiSchema: { title: 'Summary' } },
        { name: 'daily_rate', type: 'float', interface: 'number', uiSchema: { title: 'Daily Rate (€)' } },
        { name: 'years_experience', type: 'integer', interface: 'integer', uiSchema: { title: 'Years of Experience' } },
        { name: 'availability', type: 'string', interface: 'select', uiSchema: { title: 'Availability', enum: [{ value: 'available', label: 'Available' }, { value: 'busy', label: 'Busy' }, { value: 'partially', label: 'Partially Available' }] } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'active', uiSchema: { title: 'Status', enum: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }] } }
      ]
    },
    // Skills
    {
      name: 'prestago_skills',
      title: 'Skills',
      fields: [
        { name: 'name', type: 'string', interface: 'input', uiSchema: { title: 'Skill Name' } },
        { name: 'category', type: 'string', interface: 'select', uiSchema: { title: 'Category', enum: [{ value: 'technical', label: 'Technical' }, { value: 'soft', label: 'Soft Skills' }, { value: 'language', label: 'Language' }, { value: 'certification', label: 'Certification' }] } },
        { name: 'description', type: 'text', interface: 'textarea', uiSchema: { title: 'Description' } }
      ]
    },
    // RFPs (Appels d'offres)
    {
      name: 'prestago_rfps',
      title: 'RFPs',
      fields: [
        { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title' } },
        { name: 'description', type: 'text', interface: 'richText', uiSchema: { title: 'Description' } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: { title: 'Status', enum: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'closed', label: 'Closed' }, { value: 'awarded', label: 'Awarded' }] } },
        { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Start Date' } },
        { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'End Date' } },
        { name: 'deadline', type: 'date', interface: 'datetime', uiSchema: { title: 'Application Deadline' } },
        { name: 'budget_min', type: 'float', interface: 'number', uiSchema: { title: 'Budget Min (€)' } },
        { name: 'budget_max', type: 'float', interface: 'number', uiSchema: { title: 'Budget Max (€)' } },
        { name: 'location', type: 'string', interface: 'input', uiSchema: { title: 'Location' } },
        { name: 'remote_policy', type: 'string', interface: 'select', uiSchema: { title: 'Remote Policy', enum: [{ value: 'onsite', label: 'On-site' }, { value: 'remote', label: 'Full Remote' }, { value: 'hybrid', label: 'Hybrid' }] } }
      ]
    },
    // Applications (Candidatures)
    {
      name: 'prestago_applications',
      title: 'Applications',
      fields: [
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'pending', uiSchema: { title: 'Status', enum: [{ value: 'pending', label: 'Pending' }, { value: 'reviewing', label: 'Reviewing' }, { value: 'shortlisted', label: 'Shortlisted' }, { value: 'accepted', label: 'Accepted' }, { value: 'rejected', label: 'Rejected' }] } },
        { name: 'cover_letter', type: 'text', interface: 'richText', uiSchema: { title: 'Cover Letter' } },
        { name: 'proposed_rate', type: 'float', interface: 'number', uiSchema: { title: 'Proposed Daily Rate (€)' } },
        { name: 'available_from', type: 'date', interface: 'datetime', uiSchema: { title: 'Available From' } },
        { name: 'matching_score', type: 'integer', interface: 'integer', uiSchema: { title: 'Matching Score (%)' } }
      ]
    },
    // Missions
    {
      name: 'prestago_missions',
      title: 'Missions',
      fields: [
        { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title' } },
        { name: 'description', type: 'text', interface: 'richText', uiSchema: { title: 'Description' } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: { title: 'Status', enum: [{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] } },
        { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Start Date' } },
        { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'End Date' } },
        { name: 'daily_rate', type: 'float', interface: 'number', uiSchema: { title: 'Daily Rate (€)' } },
        { name: 'location', type: 'string', interface: 'input', uiSchema: { title: 'Location' } }
      ]
    },
    // Timesheets
    {
      name: 'prestago_timesheets',
      title: 'Timesheets',
      fields: [
        { name: 'period_start', type: 'date', interface: 'datetime', uiSchema: { title: 'Period Start' } },
        { name: 'period_end', type: 'date', interface: 'datetime', uiSchema: { title: 'Period End' } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: { title: 'Status', enum: [{ value: 'draft', label: 'Draft' }, { value: 'submitted', label: 'Submitted' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] } },
        { name: 'total_days', type: 'float', interface: 'number', uiSchema: { title: 'Total Days' } },
        { name: 'notes', type: 'text', interface: 'textarea', uiSchema: { title: 'Notes' } }
      ]
    },
    // Invoices
    {
      name: 'prestago_invoices',
      title: 'Invoices',
      fields: [
        { name: 'invoice_number', type: 'string', interface: 'input', uiSchema: { title: 'Invoice Number' } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: { title: 'Status', enum: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }] } },
        { name: 'amount_ht', type: 'float', interface: 'number', uiSchema: { title: 'Amount HT (€)' } },
        { name: 'vat_rate', type: 'float', interface: 'number', defaultValue: 20, uiSchema: { title: 'VAT Rate (%)' } },
        { name: 'amount_ttc', type: 'float', interface: 'number', uiSchema: { title: 'Amount TTC (€)' } },
        { name: 'issue_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Issue Date' } },
        { name: 'due_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Due Date' } },
        { name: 'paid_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Paid Date' } }
      ]
    },
    // Contracts
    {
      name: 'prestago_contracts',
      title: 'Contracts',
      fields: [
        { name: 'contract_number', type: 'string', interface: 'input', uiSchema: { title: 'Contract Number' } },
        { name: 'type', type: 'string', interface: 'select', uiSchema: { title: 'Type', enum: [{ value: 'service', label: 'Service Agreement' }, { value: 'nda', label: 'NDA' }, { value: 'freelance', label: 'Freelance Contract' }] } },
        { name: 'status', type: 'string', interface: 'select', defaultValue: 'draft', uiSchema: { title: 'Status', enum: [{ value: 'draft', label: 'Draft' }, { value: 'pending_signature', label: 'Pending Signature' }, { value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'terminated', label: 'Terminated' }] } },
        { name: 'start_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Start Date' } },
        { name: 'end_date', type: 'date', interface: 'datetime', uiSchema: { title: 'End Date' } },
        { name: 'signed_date', type: 'date', interface: 'datetime', uiSchema: { title: 'Signed Date' } },
        { name: 'terms', type: 'text', interface: 'richText', uiSchema: { title: 'Terms & Conditions' } }
      ]
    },
    // Notifications
    {
      name: 'prestago_notifications',
      title: 'Notifications',
      fields: [
        { name: 'type', type: 'string', interface: 'select', uiSchema: { title: 'Type', enum: [{ value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }] } },
        { name: 'title', type: 'string', interface: 'input', uiSchema: { title: 'Title' } },
        { name: 'content', type: 'text', interface: 'richText', uiSchema: { title: 'Content' } },
        { name: 'read', type: 'boolean', interface: 'checkbox', defaultValue: false, uiSchema: { title: 'Read' } },
        { name: 'read_at', type: 'date', interface: 'datetime', uiSchema: { title: 'Read At' } }
      ]
    }
  ];

  // Create all collections
  console.log('\n=== Creating PRESTAGO Collections ===\n');
  for (const collection of collections) {
    await createCollection(collection);
  }

  console.log('\n=== Collections Created Successfully ===\n');
  console.log('Now go to NocoBase and configure:');
  console.log('1. Relationships between collections');
  console.log('2. Create pages and dashboards');
  console.log('3. Configure permissions');
}

main().catch(console.error);
