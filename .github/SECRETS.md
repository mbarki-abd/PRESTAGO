# PRESTAGO - GitHub Secrets Configuration

Ce document liste tous les secrets GitHub requis pour le CI/CD.

## Secrets Requis

### Serveurs

| Secret | Description | Exemple |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Clé SSH privée pour accès serveur | Contenu de `~/.ssh/id_rsa` |
| `PROD_SERVER_IP` | IP du serveur de production | `46.224.74.192` |
| `STAGING_SERVER_IP` | IP du serveur de staging | `49.13.226.13` |
| `PROD_DOMAIN` | Domaine de production | `prestago.ilinqsoft.com` |
| `STAGING_DOMAIN` | Domaine de staging | `staging.prestago.ilinqsoft.com` |

### URLs

| Secret | Description | Exemple |
|--------|-------------|---------|
| `STAGING_URL` | URL complète du staging | `https://staging.prestago.ilinqsoft.com` |

## Configuration des Secrets

### 1. Via GitHub UI

1. Aller dans **Settings** > **Secrets and variables** > **Actions**
2. Cliquer sur **New repository secret**
3. Ajouter chaque secret listé ci-dessus

### 2. Via GitHub CLI

```bash
# Installer GitHub CLI si nécessaire
# https://cli.github.com/

# Se connecter
gh auth login

# Ajouter les secrets
gh secret set SSH_PRIVATE_KEY < ~/.ssh/cda_deploy
gh secret set PROD_SERVER_IP --body "46.224.74.192"
gh secret set STAGING_SERVER_IP --body "49.13.226.13"
gh secret set PROD_DOMAIN --body "prestago.ilinqsoft.com"
gh secret set STAGING_DOMAIN --body "staging.prestago.ilinqsoft.com"
gh secret set STAGING_URL --body "https://staging.prestago.ilinqsoft.com"
```

## Environnements GitHub

### Configuration des Environments

1. Aller dans **Settings** > **Environments**
2. Créer deux environnements:
   - `staging`
   - `production`

### Protection Rules (Production)

Pour l'environnement `production`, configurer:

- **Required reviewers**: Ajouter les approbateurs
- **Wait timer**: 5 minutes (optionnel)
- **Deployment branches**: `main` uniquement

## Génération de Clé SSH

Si vous n'avez pas de clé SSH dédiée au déploiement:

```bash
# Générer une nouvelle clé
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Afficher la clé publique (à ajouter sur le serveur)
cat ~/.ssh/github_deploy.pub

# Afficher la clé privée (à ajouter comme secret GitHub)
cat ~/.ssh/github_deploy

# Sur le serveur, ajouter la clé publique
echo "CONTENU_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
```

## Vérification

Après configuration, vérifier avec un workflow manuel:

```bash
gh workflow run deploy.yml -f environment=staging
```

## Structure des Workflows

```
.github/workflows/
├── ci.yml          # Tests, lint, build (push/PR)
├── deploy.yml      # Déploiement staging/production
└── scheduled.yml   # Backups, scans sécurité
```

## Triggers

| Workflow | Trigger |
|----------|---------|
| CI | Push sur `main`/`develop`, PR |
| Deploy Staging | Push sur `develop` |
| Deploy Production | Push sur `main` |
| Backup | Quotidien 2h UTC |
| Security Scan | Hebdomadaire dimanche 3h UTC |
| Dependency Check | Hebdomadaire lundi 4h UTC |
