// Create all PRESTAGO plugins on remote server
const { NodeSSH } = require('node-ssh');

const SERVER_IP = '46.224.74.192';
const SSH_KEY_PATH = process.env.HOME + '/.ssh/cda_deploy';

const plugins = [
  {
    name: 'skills',
    display: 'Skills & Profiles',
    desc: 'Manage consultant skills',
    collections: `
    this.db.collection({
      name: "prestago_skills",
      title: "Skills",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "name", type: "string", interface: "input" },
        { name: "category", type: "string", interface: "select" },
        { name: "level", type: "string", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'rfp',
    display: 'RFP Management',
    desc: 'Manage Request For Proposals',
    collections: `
    this.db.collection({
      name: "prestago_rfps",
      title: "RFPs",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "title", type: "string", interface: "input" },
        { name: "description", type: "text", interface: "textarea" },
        { name: "startDate", type: "date", interface: "date" },
        { name: "endDate", type: "date", interface: "date" },
        { name: "dailyRate", type: "decimal", interface: "number" },
        { name: "location", type: "string", interface: "input" },
        { name: "remote", type: "boolean", interface: "checkbox" },
        { name: "status", type: "string", defaultValue: "open", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'applications',
    display: 'Applications',
    desc: 'Manage consultant applications',
    collections: `
    this.db.collection({
      name: "prestago_applications",
      title: "Applications",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "proposedRate", type: "decimal", interface: "number" },
        { name: "availability", type: "date", interface: "date" },
        { name: "coverLetter", type: "text", interface: "textarea" },
        { name: "status", type: "string", defaultValue: "pending", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'missions',
    display: 'Missions',
    desc: 'Manage active missions',
    collections: `
    this.db.collection({
      name: "prestago_missions",
      title: "Missions",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "title", type: "string", interface: "input" },
        { name: "startDate", type: "date", interface: "date" },
        { name: "endDate", type: "date", interface: "date" },
        { name: "dailyRate", type: "decimal", interface: "number" },
        { name: "status", type: "string", defaultValue: "active", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'timesheets',
    display: 'Timesheets',
    desc: 'Manage consultant timesheets',
    collections: `
    this.db.collection({
      name: "prestago_timesheets",
      title: "Timesheets",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "month", type: "integer", interface: "number" },
        { name: "year", type: "integer", interface: "number" },
        { name: "totalDays", type: "decimal", interface: "number" },
        { name: "status", type: "string", defaultValue: "draft", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'invoicing',
    display: 'Invoicing',
    desc: 'Manage invoices and billing',
    collections: `
    this.db.collection({
      name: "prestago_invoices",
      title: "Invoices",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "number", type: "string", interface: "input" },
        { name: "amount", type: "decimal", interface: "number" },
        { name: "tax", type: "decimal", interface: "number" },
        { name: "totalAmount", type: "decimal", interface: "number" },
        { name: "issueDate", type: "date", interface: "date" },
        { name: "dueDate", type: "date", interface: "date" },
        { name: "status", type: "string", defaultValue: "draft", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'contracts',
    display: 'Contracts',
    desc: 'Manage contracts',
    collections: `
    this.db.collection({
      name: "prestago_contracts",
      title: "Contracts",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "type", type: "string", interface: "select" },
        { name: "startDate", type: "date", interface: "date" },
        { name: "endDate", type: "date", interface: "date" },
        { name: "dailyRate", type: "decimal", interface: "number" },
        { name: "terms", type: "text", interface: "textarea" },
        { name: "status", type: "string", defaultValue: "draft", interface: "select" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'notifications',
    display: 'Notifications',
    desc: 'Manage notifications',
    collections: `
    this.db.collection({
      name: "prestago_notifications",
      title: "Notifications",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "title", type: "string", interface: "input" },
        { name: "message", type: "text", interface: "textarea" },
        { name: "type", type: "string", interface: "select" },
        { name: "read", type: "boolean", defaultValue: false, interface: "checkbox" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'reporting',
    display: 'Reporting',
    desc: 'Reports and dashboards',
    collections: `
    this.db.collection({
      name: "prestago_reports",
      title: "Reports",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "name", type: "string", interface: "input" },
        { name: "type", type: "string", interface: "select" },
        { name: "config", type: "json", interface: "json" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  }
];

function generatePackageJson(plugin) {
  return JSON.stringify({
    name: `@prestago/plugin-${plugin.name}`,
    displayName: `PRESTAGO - ${plugin.display}`,
    description: plugin.desc,
    version: '1.0.0',
    main: './dist/server/index.js',
    client: './dist/client/index.js'
  }, null, 2);
}

function generateServerJs(plugin) {
  return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@nocobase/server");

class PrestagoPlugin extends server_1.Plugin {
  async beforeLoad() {
${plugin.collections}
    this.app.logger.info("[PRESTAGO] ${plugin.name} collections registered");
  }

  async load() {
    this.app.logger.info("[PRESTAGO] ${plugin.name} plugin loaded");
  }

  async install() {
    await this.db.sync();
    this.app.logger.info("[PRESTAGO] ${plugin.name} tables synced");
  }

  async afterEnable() {
    await this.db.sync();
  }
}

exports.default = PrestagoPlugin;
`;
}

function generateClientJs(plugin) {
  return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@nocobase/client");

class PrestagoPluginClient extends client_1.Plugin {
  async load() {
    console.log("[PRESTAGO] ${plugin.name} client plugin loaded");
  }
}

exports.default = PrestagoPluginClient;
`;
}

async function main() {
  const ssh = new NodeSSH();

  console.log('Connecting to server...');
  await ssh.connect({
    host: SERVER_IP,
    username: 'root',
    privateKeyPath: SSH_KEY_PATH,
  });

  console.log('Connected! Creating plugins...\n');

  for (const plugin of plugins) {
    const basePath = `/root/nocobase-data/storage/plugins/@prestago/plugin-${plugin.name}`;

    // Create directories
    await ssh.execCommand(`mkdir -p ${basePath}/dist/server ${basePath}/dist/client`);

    // Write package.json
    const pkgResult = await ssh.execCommand(`cat > ${basePath}/package.json`, {
      stdin: generatePackageJson(plugin)
    });

    // Write server/index.js
    await ssh.execCommand(`cat > ${basePath}/dist/server/index.js`, {
      stdin: generateServerJs(plugin)
    });

    // Write client/index.js
    await ssh.execCommand(`cat > ${basePath}/dist/client/index.js`, {
      stdin: generateClientJs(plugin)
    });

    console.log(`✓ Created @prestago/plugin-${plugin.name}`);
  }

  // List created plugins
  const listResult = await ssh.execCommand('ls -la /root/nocobase-data/storage/plugins/@prestago/');
  console.log('\nPlugins directory:');
  console.log(listResult.stdout);

  ssh.dispose();
  console.log('\nDone! All plugins created.');
}

main().catch(console.error);
