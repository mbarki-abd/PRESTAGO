# PRESTAGO

**Plateforme de Gestion des Prestataires et Missions**

*"Connectez. Collaborez. Performez."*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

---

## Description

PRESTAGO est une plateforme SaaS multi-tenant de gestion complète des prestataires (freelances et ESN) pour les grandes entreprises. Elle couvre l'ensemble du cycle de vie : sourcing, matching IA, contractualisation, suivi de mission, CRA, facturation et analytics.

Inspirée de [LittleBigConnection](https://www.littlebigconnection.com/), PRESTAGO est construite sur [NocoBase](https://www.nocobase.com/) (code source, pas Docker), une plateforme no-code/low-code extensible.

## Fonctionnalités Principales

- **Gestion des Utilisateurs** - Multi-rôles (Freelance, ESN, Client, Admin)
- **Profils & Compétences** - CV, certifications, matching
- **Appels d'Offres (RFP)** - Publication, candidatures, sélection
- **Matching IA** - Scoring Claude/OpenAI
- **Gestion des Missions** - Cycle de vie complet
- **CRA (Timesheets)** - Workflow de validation multi-niveaux
- **Facturation** - Génération automatique, PDF
- **Contrats** - Templates, signature DocuSign
- **Multi-Tenant** - White-label, domaines personnalisés
- **API REST** - Documentation OpenAPI

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Core Platform | NocoBase (source) |
| Database | PostgreSQL 15+ (Docker) |
| Cache | Redis 7+ (Docker) |
| Search | Meilisearch (Docker) |
| Storage | MinIO S3 (Docker) |
| Queue | BullMQ |
| PDF | Puppeteer |
| Hosting | Hetzner Cloud |

## Structure du Projet

```
PRESTAGO/
├── docker/                    # Configuration Docker (infrastructure uniquement)
│   ├── docker-compose.yml     # PostgreSQL, Redis, MinIO, Meilisearch
│   └── docker-compose.dev.yml # Services dev (Adminer, RedisInsight, Mailhog)
├── nocobase/                  # Code source NocoBase (cloné via setup)
├── packages/
│   └── plugins/
│       └── @prestago/         # Plugins PRESTAGO
│           ├── plugin-users/              # ✅ Utilisateurs & Organisations
│           ├── plugin-skills-profiles/    # ✅ Compétences & Profils
│           ├── plugin-rfp/                # 🔄 Appels d'Offres
│           ├── plugin-applications/       # ⏳ Candidatures & Matching
│           ├── plugin-missions/           # ⏳ Gestion Missions
│           ├── plugin-timesheets/         # ⏳ CRA
│           ├── plugin-invoicing/          # ⏳ Facturation
│           ├── plugin-contracts/          # ⏳ Contrats DocuSign
│           ├── plugin-notifications/      # ⏳ Notifications
│           └── plugin-reporting/          # ⏳ Dashboards & KPIs
├── scripts/                   # Scripts utilitaires
│   ├── setup-nocobase.sh      # Setup NocoBase depuis source
│   ├── setup.sh               # Setup général
│   └── deploy.sh              # Déploiement Hetzner
├── storage/                   # Fichiers uploadés
└── docs/                      # Documentation
```

## Installation

### Prérequis

- **Node.js 18+** (pour NocoBase)
- **pnpm** (gestionnaire de packages)
- **Docker & Docker Compose** (pour infrastructure)
- **Git**

### Démarrage Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/mbarki-abd/PRESTAGO.git
cd PRESTAGO

# 2. Lancer le script de setup complet
chmod +x scripts/setup-nocobase.sh
./scripts/setup-nocobase.sh

# 3. Démarrer NocoBase en mode développement
cd nocobase && pnpm dev

# 4. Accéder à l'application
open http://localhost:13000
```

### Services Docker (Infrastructure)

```bash
# Démarrer les services d'infrastructure
cd docker && docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f postgres redis minio meilisearch
```

### Accès aux Services

| Service | URL | Identifiants par défaut |
|---------|-----|-------------------------|
| PRESTAGO App | http://localhost:13000 | Admin créé au premier lancement |
| MinIO Console | http://localhost:9001 | prestago_access / prestago_secret |
| Meilisearch | http://localhost:7700 | API Key: prestago_meili_key |
| PostgreSQL | localhost:5432 | prestago / prestago_secret |
| Redis | localhost:6379 | - |

## Développement

### Structure des Plugins

Chaque plugin PRESTAGO suit cette structure :

```
plugin-{name}/
├── package.json
├── src/
│   ├── server/
│   │   ├── collections/    # Définitions des tables NocoBase
│   │   ├── services/       # Services métier
│   │   └── index.ts        # Point d'entrée serveur (Plugin class)
│   ├── client/
│   │   ├── locale/         # Traductions (fr-FR.json, en-US.json)
│   │   └── index.ts        # Point d'entrée client
│   └── shared/
│       ├── types.ts        # Types TypeScript & Enums
│       └── constants.ts    # Constantes (collections, routes, etc.)
```

### Commandes de Développement

```bash
# Démarrer NocoBase en mode dev (hot reload)
cd nocobase && pnpm dev

# Build pour production
cd nocobase && pnpm build

# Démarrer en production
cd nocobase && pnpm start

# Créer un nouveau plugin
cd nocobase && pnpm nocobase pm create @prestago/plugin-name
```

## Plugins Développés

### ✅ plugin-users (Complet)
- Gestion utilisateurs (Freelance, ESN Admin/Commercial, Client Admin/Manager, Platform Admin)
- Organisations avec hiérarchie parent/enfant
- Authentification JWT (access + refresh tokens)
- RBAC (Role-Based Access Control)
- Multi-tenant avec isolation par organisation

### ✅ plugin-skills-profiles (Complet)
- **Compétences** : Hiérarchie, catégories, validation, aliases
- **Profils Consultants** : Titre, résumé, disponibilité, tarifs
- **Expériences** : Historique professionnel avec références
- **Formations** : Diplômes, certifications académiques
- **Certifications** : Avec vérification et expiration
- **Langues** : Niveaux CEFR (A1-C2)
- **Documents** : CV, diplômes, portfolios (MinIO)
- **Calcul de Complétude** : Score automatique avec recommandations
- **Recherche Avancée** : Filtres multi-critères, scoring de matching

### 🔄 plugin-rfp (En développement)
- Appels d'offres clients
- Workflow de publication
- Matching automatique

### ⏳ Plugins à venir
- plugin-applications - Candidatures & Matching IA
- plugin-missions - Gestion des missions
- plugin-timesheets - CRA avec validation multi-niveaux
- plugin-invoicing - Facturation automatique
- plugin-contracts - Contrats & DocuSign
- plugin-notifications - Temps réel & emails
- plugin-reporting - Dashboards & KPIs

## Déploiement

### Hetzner Cloud

```bash
# Variables d'environnement
export REMOTE_HOST=prestago.example.com
export REMOTE_USER=root

# Déployer
./scripts/deploy.sh
```

### Configuration Production

1. Créer un fichier `.env.production` avec les vraies valeurs
2. Configurer les clés API (Claude, OpenAI, DocuSign)
3. Configurer SSL via Traefik ou Nginx
4. Mettre en place les backups PostgreSQL

## Roadmap

### Phase 1 - MVP Foundation ✅
- [x] Infrastructure Docker
- [x] Plugin Users & Organizations
- [x] Plugin Skills & Profiles

### Phase 2 - Core Features (En cours)
- [ ] Plugin RFP (Appels d'Offres)
- [ ] Plugin Applications & Matching
- [ ] Plugin Missions
- [ ] Plugin Timesheets (CRA)

### Phase 3 - Business Features
- [ ] Plugin Invoicing
- [ ] Plugin Contracts & DocuSign
- [ ] Plugin Notifications

### Phase 4 - Advanced Features
- [ ] Plugin Reporting & Analytics
- [ ] AI Matching (Claude/OpenAI)
- [ ] Multi-Tenant Full
- [ ] Public API

## Licence

AGPL-3.0 - Voir [LICENSE](LICENSE)

## Auteur

Développé par Claude Agent IA pour **ILINQSOFT**

---

**PRESTAGO** - *Connectez. Collaborez. Performez.* 🚀
