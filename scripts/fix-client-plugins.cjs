// Fix PRESTAGO client plugins for browser compatibility
const { NodeSSH } = require('node-ssh');

const SERVER_IP = '46.224.74.192';
const SSH_KEY_PATH = process.env.HOME + '/.ssh/cda_deploy';

const plugins = [
  'users', 'skills', 'rfp', 'applications', 'missions',
  'timesheets', 'invoicing', 'contracts', 'notifications', 'reporting'
];

// UMD format client plugin that works in browser
function generateClientJs(name) {
  return `(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["@nocobase/client"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("@nocobase/client"));
  } else {
    root["@prestago/plugin-${name}"] = factory(root["@nocobase/client"]);
  }
})(typeof self !== "undefined" ? self : this, function (client) {
  "use strict";

  class PrestagoPluginClient extends client.Plugin {
    async load() {
      console.log("[PRESTAGO] ${name} client plugin loaded");
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

  console.log('Connected! Fixing client plugins...\n');

  for (const name of plugins) {
    const clientPath = `/root/nocobase-data/storage/plugins/@prestago/plugin-${name}/dist/client/index.js`;

    await ssh.execCommand(`cat > ${clientPath}`, {
      stdin: generateClientJs(name)
    });

    console.log(`✓ Fixed @prestago/plugin-${name}/dist/client/index.js`);
  }

  // Restart NocoBase
  console.log('\nRestarting NocoBase...');
  await ssh.execCommand('docker restart nocobase');

  console.log('Waiting for restart...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  const logs = await ssh.execCommand('docker logs nocobase --tail 20');
  console.log('\nNocoBase logs:');
  console.log(logs.stdout);

  ssh.dispose();
  console.log('\nDone!');
}

main().catch(console.error);
