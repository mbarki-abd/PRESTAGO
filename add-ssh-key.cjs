// Add SSH key to server using password authentication
const { NodeSSH } = require('node-ssh');

const SSH_PUBKEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEz+12VIiIDDozKIxjRU4mbqFX7ndPiNlszEYFn37TVQ cda-deploy-key';
const SERVER_IP = '46.224.74.192';
const SERVER_PASS = 'LWqjxhqUrh7r'; // Rescue mode password

async function main() {
  const ssh = new NodeSSH();

  console.log('Connecting to server with password...');

  try {
    await ssh.connect({
      host: SERVER_IP,
      username: 'root',
      password: SERVER_PASS,
      tryKeyboard: true,
    });

    console.log('Connected! Adding SSH key...');

    // In rescue mode, mount the disk and add SSH key
    const result = await ssh.execCommand(`
      # Mount the main disk
      mkdir -p /mnt
      mount /dev/sda2 /mnt 2>/dev/null || mount /dev/sda1 /mnt 2>/dev/null || echo "Trying nvme..."
      mount /dev/nvme0n1p2 /mnt 2>/dev/null || mount /dev/nvme0n1p1 /mnt 2>/dev/null || true

      # Add SSH key to the mounted system
      mkdir -p /mnt/root/.ssh
      echo '${SSH_PUBKEY}' >> /mnt/root/.ssh/authorized_keys
      chmod 700 /mnt/root/.ssh
      chmod 600 /mnt/root/.ssh/authorized_keys
      sort -u /mnt/root/.ssh/authorized_keys -o /mnt/root/.ssh/authorized_keys

      # Also enable password auth temporarily
      if [ -f /mnt/etc/ssh/sshd_config ]; then
        sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /mnt/etc/ssh/sshd_config
        sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /mnt/etc/ssh/sshd_config
      fi

      echo "SSH key added to /mnt/root/.ssh/authorized_keys"
      cat /mnt/root/.ssh/authorized_keys
    `);

    console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);

    ssh.dispose();
    console.log('Done!');
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

main();
