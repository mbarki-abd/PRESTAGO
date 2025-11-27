// Fix PRESTAGO plugin peerDependencies to remove warning
const { NodeSSH } = require('node-ssh');

const SERVER_IP = '46.224.74.192';
const SSH_KEY_PATH = process.env.HOME + '/.ssh/cda_deploy';

const plugins = [
  { name: 'users', display: 'Users & Organizations', desc: 'Manage users, consultants and organizations' },
  { name: 'skills', display: 'Skills & Profiles', desc: 'Manage consultant skills' },
  { name: 'rfp', display: 'RFP Management', desc: 'Manage Request For Proposals' },
  { name: 'applications', display: 'Applications', desc: 'Manage consultant applications' },
  { name: 'missions', display: 'Missions', desc: 'Manage active missions' },
  { name: 'timesheets', display: 'Timesheets', desc: 'Manage consultant timesheets' },
  { name: 'invoicing', display: 'Invoicing', desc: 'Manage invoices and billing' },
  { name: 'contracts', display: 'Contracts', desc: 'Manage contracts' },
  { name: 'notifications', display: 'Notifications', desc: 'Manage notifications' },
  { name: 'reporting', display: 'Reporting', desc: 'Reports and dashboards' }
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

async function main() {
  const ssh = new NodeSSH();

  console.log('Connecting to server...');
  await ssh.connect({
    host: SERVER_IP,
    username: 'root',
    privateKeyPath: SSH_KEY_PATH,
  });

  console.log('Connected! Adding peerDependencies to plugins...\n');

  for (const plugin of plugins) {
    const pkgPath = `/root/nocobase-data/storage/plugins/@prestago/plugin-${plugin.name}/package.json`;

    await ssh.execCommand(`cat > ${pkgPath}`, {
      stdin: generatePackageJson(plugin)
    });

    console.log(`✓ Fixed @prestago/plugin-${plugin.name}/package.json`);
  }

  // Restart NocoBase
  console.log('\nRestarting NocoBase...');
  await ssh.execCommand('docker restart nocobase');

  console.log('Waiting 40 seconds for restart...');
  await new Promise(resolve => setTimeout(resolve, 40000));

  const logs = await ssh.execCommand('docker logs nocobase --tail 15');
  console.log('\nNocoBase logs:');
  console.log(logs.stdout);

  ssh.dispose();
  console.log('\nDone!');
}

main().catch(console.error);
