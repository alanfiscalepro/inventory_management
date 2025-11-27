# Coolify Server Setup Guide

## Issue: "No validated & reachable servers found"

This guide will help you add and validate a server in Coolify.

## Option 1: Localhost Server (Coolify on Same Machine)

If Coolify is running on the same machine where you want to deploy:

### Step 1: Generate SSH Key for Localhost

```bash
# Generate a new SSH key for Coolify
ssh-keygen -t ed25519 -f ~/.ssh/coolify_localhost -N ""

# Add the public key to authorized_keys
cat ~/.ssh/coolify_localhost.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Test the connection
ssh -i ~/.ssh/coolify_localhost localhost
```

### Step 2: Add Server in Coolify UI

1. Go to **Coolify Dashboard** → **Servers**
2. Click **+ Add Server**
3. Fill in the details:
   - **Name**: `localhost` or `local-server`
   - **Description**: `Local development server`
   - **IP Address**: `127.0.0.1` or `localhost`
   - **Port**: `22`
   - **User**: Your username (usually the one you're logged in as)
   - **Private Key**: Paste the contents of `~/.ssh/coolify_localhost`
     ```bash
     cat ~/.ssh/coolify_localhost
     ```

4. Click **Validate & Save**
5. Wait for validation to complete (should show green checkmark)

## Option 2: Remote Server

If deploying to a remote VPS/cloud server:

### Step 1: Prepare Your Remote Server

On your **remote server**, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker is running
docker --version
```

### Step 2: Set Up SSH Access

On your **Coolify server** (where Coolify is running):

```bash
# Generate SSH key for remote server
ssh-keygen -t ed25519 -f ~/.ssh/coolify_remote -N ""

# Copy the public key
cat ~/.ssh/coolify_remote.pub
```

On your **remote server**:

```bash
# Add Coolify's public key to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Test SSH Connection

From your **Coolify server**:

```bash
# Test SSH connection
ssh -i ~/.ssh/coolify_remote user@remote-server-ip

# If successful, exit
exit
```

### Step 4: Add Server in Coolify UI

1. Go to **Coolify Dashboard** → **Servers**
2. Click **+ Add Server**
3. Fill in the details:
   - **Name**: `production-server` (or any name you like)
   - **Description**: `Production VPS`
   - **IP Address**: Your server's public IP
   - **Port**: `22` (or your custom SSH port)
   - **User**: The username you SSH with (e.g., `root`, `ubuntu`, `debian`)
   - **Private Key**: Paste the contents of `~/.ssh/coolify_remote`
     ```bash
     cat ~/.ssh/coolify_remote
     ```

4. Click **Validate & Save**
5. Wait for validation (may take 30-60 seconds)

## Troubleshooting

### "Connection Refused" Error

1. **Check SSH service is running** (on remote server):
   ```bash
   sudo systemctl status ssh
   # If not running:
   sudo systemctl start ssh
   sudo systemctl enable ssh
   ```

2. **Check firewall allows SSH**:
   ```bash
   # UFW (Ubuntu/Debian)
   sudo ufw allow 22/tcp
   sudo ufw status

   # Or check if port is listening
   sudo netstat -tlnp | grep :22
   ```

3. **Verify SSH port**:
   ```bash
   # Check SSH config
   sudo cat /etc/ssh/sshd_config | grep Port
   ```

### "Permission Denied" Error

1. **Check private key permissions**:
   ```bash
   chmod 600 ~/.ssh/coolify_localhost
   # or
   chmod 600 ~/.ssh/coolify_remote
   ```

2. **Verify public key is in authorized_keys**:
   ```bash
   cat ~/.ssh/authorized_keys
   ```

3. **Check SSH logs** (on remote server):
   ```bash
   sudo tail -f /var/log/auth.log
   # or
   sudo journalctl -u ssh -f
   ```

### "Host Key Verification Failed"

```bash
# Remove old host key
ssh-keygen -R your-server-ip

# Or add to known_hosts
ssh-keyscan -H your-server-ip >> ~/.ssh/known_hosts
```

### Server Shows "Not Reachable"

1. **Ping the server**:
   ```bash
   ping your-server-ip
   ```

2. **Check if Docker is installed and running** (on remote server):
   ```bash
   docker --version
   docker ps
   ```

3. **Verify user has Docker permissions**:
   ```bash
   docker ps
   # If permission denied:
   sudo usermod -aG docker $USER
   # Then logout and login again
   ```

## Getting Server Information for Coolify

### Find Your Username
```bash
whoami
```

### Find Your Server's IP
```bash
# For remote server
curl ifconfig.me

# For localhost
hostname -I
```

### Locate SSH Keys
```bash
# List all keys
ls -la ~/.ssh/

# View private key (to paste in Coolify)
cat ~/.ssh/coolify_localhost
# or
cat ~/.ssh/coolify_remote

# View public key
cat ~/.ssh/coolify_localhost.pub
# or
cat ~/.ssh/coolify_remote.pub
```

## After Server is Validated

Once your server shows as **validated and reachable** (green checkmark):

1. Go back to your application deployment
2. Select the validated server from the dropdown
3. Continue with deployment

## Quick Reference Commands

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/coolify_key -N ""

# Copy public key to remote server
ssh-copy-id -i ~/.ssh/coolify_key.pub user@server-ip

# Test connection
ssh -i ~/.ssh/coolify_key user@server-ip

# View private key (paste in Coolify)
cat ~/.ssh/coolify_key

# Check Docker status
docker ps
sudo systemctl status docker
```

## Security Best Practices

1. **Use SSH keys, never passwords**
2. **Disable root login** (after setting up a user):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart ssh
   ```

3. **Use a non-standard SSH port**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: Port 2222
   sudo systemctl restart ssh
   # Update firewall:
   sudo ufw allow 2222/tcp
   sudo ufw delete allow 22/tcp
   ```

4. **Enable firewall**:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## Next Steps

After your server is validated:
1. Return to your application in Coolify
2. Select your validated server
3. Choose `docker-compose.backend.yaml` as the build pack
4. Set your environment variables
5. Deploy!

## Need Help?

- Check Coolify logs: Settings → Logs
- Check server SSH logs: `sudo tail -f /var/log/auth.log`
- Verify Docker: `docker ps` and `docker version`
