# PRESTAGO - Guide de Déploiement

## Architecture

PRESTAGO est une plateforme de gestion des consultants freelance basée sur NocoBase, avec les composants suivants :

- **Application** : NocoBase avec plugins PRESTAGO
- **Base de données** : PostgreSQL 15
- **Cache** : Redis 7
- **Stockage** : MinIO (S3-compatible)
- **Recherche** : Meilisearch

## Prérequis

### Serveur
- Ubuntu 22.04 LTS
- Minimum 4 vCPU, 8 GB RAM
- 50 GB SSD
- Ports ouverts : 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Logiciels
- Docker & Docker Compose
- Node.js 20.x
- pnpm
- PM2 (process manager)
- Nginx (reverse proxy)
- Certbot (SSL)

## Options de Déploiement

### Option 1 : Nouveau serveur Hetzner

```bash
# Définir le token API Hetzner
export HETZNER_API_TOKEN="votre-token"

# Ou passer en argument
node scripts/provision-hetzner.cjs VOTRE_TOKEN

# Le script crée :
# - Serveur cx32 (4 vCPU, 8 GB RAM)
# - Firewall configuré
# - Volume 50 GB pour les données
```

### Option 2 : Serveur existant

Pour déployer sur un serveur existant :

```bash
# Depuis Windows avec Git Bash
bash scripts/deploy-to-server.sh

# Ou manuellement via SSH
ssh root@VOTRE_IP
```

## Installation Manuelle

### 1. Préparer le serveur

```bash
# Se connecter au serveur
ssh root@VOTRE_IP

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl

# Activer Docker
systemctl enable docker
systemctl start docker

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer pnpm et PM2
npm install -g pnpm pm2
```

### 2. Cloner le projet

```bash
mkdir -p /opt/prestago
cd /opt/prestago
git clone https://github.com/mbarki-abd/PRESTAGO.git .
```

### 3. Configurer l'environnement

```bash
# Copier et éditer le fichier d'environnement
cp .env.example .env
nano .env

# Variables importantes à configurer :
# - DB_PASSWORD : mot de passe PostgreSQL
# - APP_KEY : clé de chiffrement (générer avec: openssl rand -hex 32)
# - MINIO_SECRET_KEY : clé secrète MinIO
# - MEILISEARCH_API_KEY : clé API Meilisearch
# - DOMAIN : votre domaine
```

### 4. Démarrer l'infrastructure

```bash
# Démarrer les services Docker
docker-compose up -d

# Vérifier les services
docker-compose ps
```

### 5. Installer NocoBase

```bash
cd /opt/prestago/nocobase

# Installer les dépendances
pnpm install

# Configurer NocoBase
cp .env.example .env
# Éditer .env avec les mêmes valeurs que /opt/prestago/.env

# Initialiser la base de données
pnpm nocobase install

# Démarrer NocoBase
pm2 start ecosystem.config.js
pm2 save
```

### 6. Configurer Nginx

```bash
# Créer la configuration Nginx
cat > /etc/nginx/sites-available/prestago << 'EOF'
server {
    listen 80;
    server_name prestago.example.com;

    location / {
        proxy_pass http://localhost:13000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/prestago /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. Configurer SSL

```bash
# Obtenir un certificat SSL
certbot --nginx -d prestago.example.com

# Renouvellement automatique (déjà configuré par certbot)
```

## Plugins PRESTAGO

Les plugins suivants sont inclus :

| Plugin | Description |
|--------|-------------|
| `plugin-users` | Utilisateurs, organisations, rôles |
| `plugin-skills` | Compétences, profils, expériences |
| `plugin-rfp` | Appels d'offres (RFP) |
| `plugin-applications` | Candidatures et matching |
| `plugin-missions` | Gestion des missions |
| `plugin-timesheets` | CRA avec workflow multi-niveaux |
| `plugin-invoicing` | Facturation automatique |
| `plugin-contracts` | Contrats et conformité |
| `plugin-notifications` | Notifications et messagerie |
| `plugin-reporting` | Dashboards et KPIs |

### Activer les plugins

```bash
# Via CLI NocoBase
pnpm nocobase pm enable @prestago/plugin-users
pnpm nocobase pm enable @prestago/plugin-skills
pnpm nocobase pm enable @prestago/plugin-rfp
# ... etc.

# Redémarrer NocoBase
pm2 restart prestago
```

## Maintenance

### Logs

```bash
# Logs NocoBase
pm2 logs prestago

# Logs Docker
docker-compose logs -f

# Logs spécifiques
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Sauvegarde

```bash
# Sauvegarder la base de données
docker exec prestago-postgres pg_dump -U prestago prestago > backup.sql

# Sauvegarder MinIO
docker exec prestago-minio mc mirror /data /backup
```

### Mise à jour

```bash
cd /opt/prestago

# Mettre à jour le code
git pull origin main

# Mettre à jour les dépendances
cd nocobase && pnpm install

# Redémarrer
pm2 restart prestago
```

## Ressources Hetzner

### Vérifier les ressources

```bash
node scripts/check-hetzner-resources.cjs VOTRE_TOKEN
```

### Serveurs existants utilisables

- **nocobase** : 49.13.226.13 (cpx21 - 3 vCPU, 4 GB)
- **Dockge-Docker** : 195.201.39.162 (cpx31 - 4 vCPU, 8 GB)

## Dépannage

### Problème de connexion base de données

```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Tester la connexion
docker exec -it prestago-postgres psql -U prestago -d prestago
```

### Problème de stockage MinIO

```bash
# Vérifier MinIO
docker-compose logs minio

# Accéder à la console MinIO
# http://VOTRE_IP:9001
```

### NocoBase ne démarre pas

```bash
# Vérifier les logs
pm2 logs prestago --lines 100

# Réinstaller
pnpm nocobase reinstall
```

## Support

- Documentation NocoBase : https://docs.nocobase.com
- GitHub PRESTAGO : https://github.com/mbarki-abd/PRESTAGO
