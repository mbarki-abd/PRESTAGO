/**
 * PRESTAGO - Setup Pages and Menu Script
 * Creates menu items and pages for PRESTAGO
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

function generateUid() {
  return 'prestago_' + Math.random().toString(36).substr(2, 9);
}

async function createTablePage(title, collectionName, icon = 'TableOutlined') {
  const uid = generateUid();

  const schema = {
    type: 'void',
    'x-component': 'Page',
    'x-component-props': {},
    properties: {
      [generateUid()]: {
        type: 'void',
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection: collectionName,
          action: 'list',
          params: {
            pageSize: 20
          }
        },
        'x-component': 'CardItem',
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
                'x-component': 'Filter.Action',
                'x-component-props': {
                  icon: 'FilterOutlined',
                  useProps: '{{ useFilterActionProps }}'
                }
              },
              refresh: {
                type: 'void',
                'x-component': 'Action',
                'x-component-props': {
                  icon: 'ReloadOutlined',
                  useProps: '{{ useRefreshActionProps }}'
                }
              },
              create: {
                type: 'void',
                'x-component': 'Action',
                'x-component-props': {
                  type: 'primary',
                  icon: 'PlusOutlined'
                },
                title: 'Add New',
                properties: {
                  drawer: {
                    type: 'void',
                    'x-component': 'Action.Drawer',
                    'x-component-props': {
                      destroyOnClose: true
                    },
                    title: `Add ${title}`,
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
                            'x-component-props': {
                              useProps: '{{ useFormBlockProps }}'
                            },
                            properties: {
                              actions: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-component-props': {
                                  layout: 'one-column',
                                  style: { marginTop: 24 }
                                },
                                properties: {
                                  submit: {
                                    type: 'void',
                                    'x-component': 'Action',
                                    'x-component-props': {
                                      type: 'primary',
                                      useProps: '{{ useCreateActionProps }}'
                                    },
                                    title: 'Submit'
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
              rowSelection: {
                type: 'checkbox'
              },
              useProps: '{{ useTableBlockProps }}'
            }
          }
        }
      }
    }
  };

  return { uid, schema };
}

async function main() {
  if (!await login()) {
    process.exit(1);
  }

  console.log('\n=== Creating PRESTAGO Menu Structure ===\n');

  // Get current routes/menu
  const routesResult = await apiCall('GET', 'uiSchemas:getJsonSchema/nocobase-admin-menu');
  console.log('Current menu retrieved');

  // Create menu items via UI Schema
  const menuItems = [
    { title: 'Organizations', collection: 'prestago_organizations', icon: 'BankOutlined' },
    { title: 'Consultants', collection: 'prestago_consultants', icon: 'TeamOutlined' },
    { title: 'Skills', collection: 'prestago_skills', icon: 'StarOutlined' },
    { title: 'RFPs', collection: 'prestago_rfps', icon: 'FileTextOutlined' },
    { title: 'Applications', collection: 'prestago_applications', icon: 'SolutionOutlined' },
    { title: 'Missions', collection: 'prestago_missions', icon: 'ProjectOutlined' },
    { title: 'Timesheets', collection: 'prestago_timesheets', icon: 'CalendarOutlined' },
    { title: 'Invoices', collection: 'prestago_invoices', icon: 'DollarOutlined' },
    { title: 'Contracts', collection: 'prestago_contracts', icon: 'FileProtectOutlined' }
  ];

  // Create a PRESTAGO group menu
  const prestagoMenuUid = generateUid();

  console.log('\nCreating PRESTAGO menu group...');

  // Insert menu group
  const menuGroupSchema = {
    type: 'void',
    title: 'PRESTAGO',
    'x-component': 'Menu.SubMenu',
    'x-component-props': {
      icon: 'AppstoreOutlined'
    },
    'x-uid': prestagoMenuUid,
    properties: {}
  };

  // Add each collection as a menu item
  for (const item of menuItems) {
    const itemUid = generateUid();
    const pageData = await createTablePage(item.title, item.collection, item.icon);

    menuGroupSchema.properties[itemUid] = {
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
    console.log(`  - Added ${item.title} menu item`);
  }

  // Insert menu into NocoBase
  const insertResult = await apiCall('POST', 'uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
    schema: menuGroupSchema
  });

  if (insertResult.errors) {
    console.log('\nMenu creation error:', insertResult.errors[0]?.message);
    console.log('You may need to create pages manually in NocoBase UI');
  } else {
    console.log('\nPRESTAGO menu created successfully!');
  }

  console.log('\n=== Setup Complete ===\n');
  console.log('Next steps:');
  console.log('1. Refresh NocoBase page');
  console.log('2. Configure table columns for each page');
  console.log('3. Add sample data');
  console.log('4. Configure user permissions');
}

main().catch(console.error);
