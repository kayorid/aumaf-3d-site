#!/usr/bin/env bash
# Bootstrap idempotente — reproduzir a configuração feita em F1+F2 da spec.
# Roda como root via Browser Terminal Hostinger ou ssh root@<host> (uma vez).
# Após primeira execução bem-sucedida, o servidor responde por chave SSH ed25519
# do usuário deploy e tem Docker + Caddy + UFW + fail2ban + unattended-upgrades.
#
# Pré-requisitos:
#   - Ubuntu 22.04 LTS limpo
#   - Variável SSH_PUBLIC_KEY exportada com o conteúdo da chave pública do operador
#
# Uso:
#   export SSH_PUBLIC_KEY="ssh-ed25519 AAAA... user@host"
#   bash bootstrap-server.sh

set -euo pipefail

if [ -z "${SSH_PUBLIC_KEY:-}" ]; then
  echo "ERROR: export SSH_PUBLIC_KEY com a chave pública antes de rodar"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
APT_OPT="-o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold"

echo "==> apt update + full-upgrade"
apt-get update -y -q
apt-get $APT_OPT -y full-upgrade

echo "==> install base packages"
apt-get $APT_OPT -y install \
  chrony fail2ban htop tmux git curl wget vim ca-certificates gnupg \
  lsb-release jq dnsutils net-tools rsync apt-transport-https software-properties-common \
  ufw unattended-upgrades

echo "==> timezone / hostname"
timedatectl set-timezone America/Sao_Paulo
hostnamectl set-hostname aumaf-prod
sed -i 's/127.0.1.1.*/127.0.1.1\taumaf-prod/' /etc/hosts || true
systemctl enable --now chrony

echo "==> swap 4G"
if ! swapon --show | grep -q "/swapfile"; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q "/swapfile" /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi
cat > /etc/sysctl.d/99-aumaf-swap.conf <<EOF
vm.swappiness=10
vm.vfs_cache_pressure=50
EOF
sysctl -p /etc/sysctl.d/99-aumaf-swap.conf

echo "==> user deploy + sudo NOPASSWD + ssh key"
id deploy >/dev/null 2>&1 || useradd -m -s /bin/bash -G sudo deploy
usermod -aG sudo deploy
cat > /etc/sudoers.d/deploy-nopasswd <<EOF
deploy ALL=(ALL) NOPASSWD:ALL
EOF
chmod 440 /etc/sudoers.d/deploy-nopasswd
visudo -cf /etc/sudoers.d/deploy-nopasswd

mkdir -p /home/deploy/.ssh
echo "${SSH_PUBLIC_KEY}" > /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
passwd -l deploy

echo "==> sshd hardening"
[ -f /etc/ssh/sshd_config.d/50-cloud-init.conf ] && \
  mv /etc/ssh/sshd_config.d/50-cloud-init.conf /root/50-cloud-init.conf.bak
cat > /etc/ssh/sshd_config.d/00-aumaf-hardening.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
PermitEmptyPasswords no
UsePAM yes
AllowUsers deploy
MaxAuthTries 3
LoginGraceTime 20
MaxSessions 5
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding yes
PermitTunnel no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 2
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com
EOF
sshd -t
systemctl reload sshd

echo "==> UFW"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP-Caddy'
ufw allow 443/tcp comment 'HTTPS-Caddy'
ufw --force enable

echo "==> fail2ban"
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port    = ssh
EOF
systemctl enable --now fail2ban

echo "==> unattended-upgrades"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
sed -i 's|^//\?Unattended-Upgrade::Mail .*|Unattended-Upgrade::Mail "";|' /etc/apt/apt.conf.d/50unattended-upgrades
sed -i 's|^//\?Unattended-Upgrade::Automatic-Reboot .*|Unattended-Upgrade::Automatic-Reboot "false";|' /etc/apt/apt.conf.d/50unattended-upgrades
systemctl enable --now unattended-upgrades

echo "==> Docker Engine"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y -q
apt-get $APT_OPT -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "50m", "max-file": "5" },
  "live-restore": true,
  "default-address-pools": [{"base": "172.30.0.0/16", "size": 24}],
  "userland-proxy": false,
  "no-new-privileges": true
}
EOF
systemctl restart docker
systemctl enable docker
usermod -aG docker deploy

echo "==> Caddy nativo + plugin Cloudflare DNS via xcaddy (Docker builder)"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  > /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y -q
apt-get $APT_OPT -y install caddy

docker pull caddy:builder
docker run --rm -v /root:/output caddy:builder \
  xcaddy build --with github.com/caddy-dns/cloudflare --output /output/caddy-cf
systemctl stop caddy
cp /root/caddy-cf /usr/bin/caddy
chmod +x /usr/bin/caddy

echo "==> /srv/aumaf"
mkdir -p /srv/aumaf/{compose,env,backups,letsencrypt,caddy-data,caddy-config,backups/manual}
chown -R deploy:deploy /srv/aumaf

echo "==> bootstrap done"
echo "Next: configure /etc/caddy/Caddyfile + /etc/caddy/cloudflare.env (CLOUDFLARE_API_TOKEN), then 'systemctl start caddy'"
