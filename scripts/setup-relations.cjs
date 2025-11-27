/**
 * PRESTAGO - Setup Relations Script
 * Creates relationships between PRESTAGO collections
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

async function createField(collectionName, field) {
  console.log(`  Adding field ${field.name} to ${collectionName}...`);
  const result = await apiCall('POST', `collections/${collectionName}/fields:create`, field);
  if (result.errors) {
    console.log(`    - Error: ${result.errors[0]?.message}`);
  } else {
    console.log(`    - Success`);
  }
  return result;
}

async function main() {
  if (!await login()) {
    process.exit(1);
  }

  console.log('\n=== Creating Relationships ===\n');

  // Consultant belongs to Organization
  await createField('prestago_consultants', {
    name: 'organization',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'organization_id',
    target: 'prestago_organizations',
    uiSchema: { title: 'Organization', 'x-component': 'Select' }
  });

  // RFP belongs to Client (Organization)
  await createField('prestago_rfps', {
    name: 'client',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'client_id',
    target: 'prestago_organizations',
    uiSchema: { title: 'Client', 'x-component': 'Select' }
  });

  // RFP has many required skills
  await createField('prestago_rfps', {
    name: 'required_skills',
    type: 'belongsToMany',
    interface: 'multipleSelect',
    target: 'prestago_skills',
    through: 'prestago_rfp_skills',
    uiSchema: { title: 'Required Skills', 'x-component': 'Select', 'x-component-props': { mode: 'multiple' } }
  });

  // Consultant has many skills
  await createField('prestago_consultants', {
    name: 'skills',
    type: 'belongsToMany',
    interface: 'multipleSelect',
    target: 'prestago_skills',
    through: 'prestago_consultant_skills',
    uiSchema: { title: 'Skills', 'x-component': 'Select', 'x-component-props': { mode: 'multiple' } }
  });

  // Application belongs to RFP
  await createField('prestago_applications', {
    name: 'rfp',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'rfp_id',
    target: 'prestago_rfps',
    uiSchema: { title: 'RFP', 'x-component': 'Select' }
  });

  // Application belongs to Consultant
  await createField('prestago_applications', {
    name: 'consultant',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'consultant_id',
    target: 'prestago_consultants',
    uiSchema: { title: 'Consultant', 'x-component': 'Select' }
  });

  // Mission belongs to RFP
  await createField('prestago_missions', {
    name: 'rfp',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'rfp_id',
    target: 'prestago_rfps',
    uiSchema: { title: 'RFP', 'x-component': 'Select' }
  });

  // Mission belongs to Consultant
  await createField('prestago_missions', {
    name: 'consultant',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'consultant_id',
    target: 'prestago_consultants',
    uiSchema: { title: 'Consultant', 'x-component': 'Select' }
  });

  // Mission belongs to Client (Organization)
  await createField('prestago_missions', {
    name: 'client',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'client_id',
    target: 'prestago_organizations',
    uiSchema: { title: 'Client', 'x-component': 'Select' }
  });

  // Timesheet belongs to Mission
  await createField('prestago_timesheets', {
    name: 'mission',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'mission_id',
    target: 'prestago_missions',
    uiSchema: { title: 'Mission', 'x-component': 'Select' }
  });

  // Timesheet belongs to Consultant
  await createField('prestago_timesheets', {
    name: 'consultant',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'consultant_id',
    target: 'prestago_consultants',
    uiSchema: { title: 'Consultant', 'x-component': 'Select' }
  });

  // Invoice belongs to Mission
  await createField('prestago_invoices', {
    name: 'mission',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'mission_id',
    target: 'prestago_missions',
    uiSchema: { title: 'Mission', 'x-component': 'Select' }
  });

  // Invoice belongs to Timesheet
  await createField('prestago_invoices', {
    name: 'timesheet',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'timesheet_id',
    target: 'prestago_timesheets',
    uiSchema: { title: 'Timesheet', 'x-component': 'Select' }
  });

  // Contract belongs to Mission
  await createField('prestago_contracts', {
    name: 'mission',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'mission_id',
    target: 'prestago_missions',
    uiSchema: { title: 'Mission', 'x-component': 'Select' }
  });

  // Notification belongs to User (using NocoBase users)
  await createField('prestago_notifications', {
    name: 'user',
    type: 'belongsTo',
    interface: 'select',
    foreignKey: 'user_id',
    target: 'users',
    uiSchema: { title: 'User', 'x-component': 'Select' }
  });

  console.log('\n=== Relations Created Successfully ===\n');
}

main().catch(console.error);
