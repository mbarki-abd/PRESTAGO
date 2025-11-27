// Deploy PRESTAGO plugins with automatic menu/page creation
const { NodeSSH } = require('node-ssh');

const SERVER_IP = '46.224.74.192';
const SSH_KEY_PATH = process.env.HOME + '/.ssh/cda_deploy';

const plugins = [
  {
    name: 'users',
    display: 'Users & Organizations',
    desc: 'Manage users, consultants and organizations',
    icon: 'UserOutlined',
    menuTitle: 'Users',
    collections: `
    this.db.collection({
      name: "prestago_users",
      title: "Users",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "email", type: "string", interface: "email" },
        { name: "firstName", type: "string", interface: "input" },
        { name: "lastName", type: "string", interface: "input" },
        { name: "role", type: "string", interface: "select" },
        { name: "organizationId", type: "bigInt", interface: "number" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });
    this.db.collection({
      name: "prestago_organizations",
      title: "Organizations",
      fields: [
        { name: "id", type: "bigInt", autoIncrement: true, primaryKey: true },
        { name: "name", type: "string", interface: "input" },
        { name: "type", type: "string", interface: "select" },
        { name: "address", type: "text", interface: "textarea" },
        { name: "createdAt", type: "date", interface: "createdAt" }
      ]
    });`
  },
  {
    name: 'skills',
    display: 'Skills & Profiles',
    desc: 'Manage consultant skills',
    icon: 'StarOutlined',
    menuTitle: 'Skills',
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
    icon: 'FileSearchOutlined',
    menuTitle: 'RFPs',
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
    icon: 'FormOutlined',
    menuTitle: 'Applications',
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
    icon: 'RocketOutlined',
    menuTitle: 'Missions',
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
    icon: 'CalendarOutlined',
    menuTitle: 'Timesheets',
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
    icon: 'DollarOutlined',
    menuTitle: 'Invoices',
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
    icon: 'FileTextOutlined',
    menuTitle: 'Contracts',
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
    icon: 'BellOutlined',
    menuTitle: 'Notifications',
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
    icon: 'BarChartOutlined',
    menuTitle: 'Reports',
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
    client: './dist/client/index.js',
    devDependencies: {},
    peerDependencies: {
      "@nocobase/client": "1.x",
      "@nocobase/server": "1.x"
    }
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

// Client plugin with router.add to create pages
function generateClientJs(plugin) {
  return `(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["@nocobase/client", "react"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("@nocobase/client"), require("react"));
  } else {
    root["@prestago/plugin-${plugin.name}"] = factory(root["@nocobase/client"], root["React"]);
  }
})(typeof self !== "undefined" ? self : this, function (client, React) {
  "use strict";

  // Page component for ${plugin.menuTitle}
  var ${plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1)}Page = function() {
    React.useEffect(function() {
      document.title = "PRESTAGO - ${plugin.menuTitle}";
    }, []);

    return React.createElement("div", {
      style: {
        padding: "24px",
        background: "#fff",
        minHeight: "calc(100vh - 48px)"
      }
    }, [
      React.createElement("h1", {
        key: "title",
        style: { marginBottom: "24px", color: "#1890ff" }
      }, "${plugin.menuTitle}"),
      React.createElement("div", {
        key: "content",
        style: {
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px"
        }
      }, [
        React.createElement("p", { key: "desc" }, "${plugin.desc}"),
        React.createElement("p", {
          key: "info",
          style: { marginTop: "16px", color: "#666" }
        }, "This module is part of the PRESTAGO platform.")
      ])
    ]);
  };

  class PrestagoPluginClient extends client.Plugin {
    async load() {
      console.log("[PRESTAGO] ${plugin.name} client plugin loading...");

      // Add route for this plugin's page
      this.app.router.add("admin.prestago-${plugin.name}", {
        path: "/admin/prestago/${plugin.name}",
        Component: ${plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1)}Page
      });

      console.log("[PRESTAGO] ${plugin.name} route added: /admin/prestago/${plugin.name}");
    }
  }

  return { default: PrestagoPluginClient };
});
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

  console.log('Connected! Deploying plugins with menu/page support...\n');

  for (const plugin of plugins) {
    const basePath = `/root/nocobase-data/storage/plugins/@prestago/plugin-${plugin.name}`;

    // Create directories
    await ssh.execCommand(`mkdir -p ${basePath}/dist/server ${basePath}/dist/client`);

    // Write package.json
    await ssh.execCommand(`cat > ${basePath}/package.json`, {
      stdin: generatePackageJson(plugin)
    });

    // Write server/index.js
    await ssh.execCommand(`cat > ${basePath}/dist/server/index.js`, {
      stdin: generateServerJs(plugin)
    });

    // Write client/index.js with router.add
    await ssh.execCommand(`cat > ${basePath}/dist/client/index.js`, {
      stdin: generateClientJs(plugin)
    });

    console.log(`✓ Deployed @prestago/plugin-${plugin.name} with page /admin/prestago/${plugin.name}`);
  }

  // Clear NocoBase cache and restart
  console.log('\nClearing NocoBase cache...');
  await ssh.execCommand('docker exec nocobase rm -rf /app/nocobase/.cache 2>/dev/null || true');

  console.log('Restarting NocoBase...');
  await ssh.execCommand('docker restart nocobase');

  console.log('Waiting 45 seconds for restart...');
  await new Promise(resolve => setTimeout(resolve, 45000));

  const logs = await ssh.execCommand('docker logs nocobase --tail 30');
  console.log('\nNocoBase logs:');
  console.log(logs.stdout);
  if (logs.stderr) console.log(logs.stderr);

  ssh.dispose();
  console.log('\nDone! All plugins deployed with pages.');
  console.log('\nPages available at:');
  plugins.forEach(p => {
    console.log(`  - https://prestago.ilinqsoft.com/admin/prestago/${p.name}`);
  });
}

main().catch(console.error);
