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
- **Contrats** - Templates, signature électronique, conformité
- **Notifications** - Multi-canal (in-app, email, SMS, push)
- **Reporting** - Dashboards, KPIs, rapports programmés
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
│           ├── plugin-rfp/                # ✅ Appels d'Offres
│           ├── plugin-applications/       # ✅ Candidatures & Matching
│           ├── plugin-missions/           # ✅ Gestion Missions
│           ├── plugin-timesheets/         # ✅ CRA Multi-niveaux
│           ├── plugin-invoicing/          # ✅ Facturation
│           ├── plugin-contracts/          # ✅ Contrats & Conformité
│           ├── plugin-notifications/      # ✅ Notifications & Messagerie
│           └── plugin-reporting/          # ✅ Dashboards & KPIs
├── scripts/                   # Scripts utilitaires
│   ├── setup-nocobase.sh      # Setup NocoBase depuis source
│   ├── provision-hetzner.cjs  # Provisionnement serveur Hetzner
│   └── deploy-to-server.sh    # Déploiement sur serveur existant
├── storage/                   # Fichiers uploadés
└── docs/                      # Documentation
    ├── CAHIER-DES-CHARGES.md  # Spécifications complètes
    └── DEPLOYMENT.md          # Guide de déploiement
```

## Installation

### Prérequis

- **Node.js 20+** (pour NocoBase)
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

## Plugins PRESTAGO

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

### ✅ plugin-rfp (Complet)
- Appels d'offres clients avec workflow complet
- Questions/réponses intégrées
- Publication ciblée ou publique
- Matching automatique avec consultants

### ✅ plugin-applications (Complet)
- Candidatures aux RFP
- Matching IA avec scoring multi-critères
- Workflow de sélection (shortlist, entretiens)
- Messages entre parties

### ✅ plugin-missions (Complet)
- Cycle de vie complet des missions
- Affectation des consultants
- Suivi des jalons et livrables
- Extensions et avenants

### ✅ plugin-timesheets (Complet)
- CRA hebdomadaires/mensuels
- **Workflow de validation multi-niveaux** (jusqu'à 3 niveaux)
- Saisie par jour avec types d'activité
- Commentaires et ajustements
- Export PDF/Excel

### ✅ plugin-invoicing (Complet)
- Génération automatique depuis CRA validés
- Calcul TVA multi-taux
- États de facturation (draft → sent → paid)
- Gestion des avoirs
- Relances automatiques
- Export comptable

### ✅ plugin-contracts (Complet)
- Templates de contrats paramétrables
- **Signature électronique** avec workflow token
- Gestion des clauses et avenants
- **Conformité documentaire** :
  - Documents obligatoires par type de contrat
  - Alertes d'expiration
  - Score de conformité
  - Validation/rejet avec commentaires

### ✅ plugin-notifications (Complet)
- **Multi-canal** : in-app, email, SMS, push
- 28 types de notifications couvrant tout le workflow
- Préférences utilisateur par canal
- Heures de silence configurables
- **Messagerie intégrée** :
  - Conversations directes et groupes
  - Contexte mission/RFP
  - Pièces jointes
  - Statuts de lecture

### ✅ plugin-reporting (Complet)
- **Dashboards personnalisables**
  - 6 templates par rôle (admin, client, consultant, manager, commercial)
  - Drag & drop widgets
  - Thème clair/sombre
- **22 catégories de KPIs** :
  - Missions (actives, terminées, taux de remplissage)
  - RFP (ouverts, taux de conversion)
  - Consultants (utilisation, satisfaction)
  - CRA (en attente, taux de rejet)
  - Revenue (facturé, encaissé, créances)
  - Marges
- **16 types de widgets** : graphiques, jauges, tables, cartes
- **Rapports programmés** : quotidien, hebdo, mensuel, trimestriel
- **Export** : PDF, Excel, CSV, JSON

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

# Activer un plugin
pnpm nocobase pm enable @prestago/plugin-users
```

## Déploiement

### Option 1 : Nouveau Serveur Hetzner

```bash
# Provisionner un nouveau serveur
node scripts/provision-hetzner.cjs VOTRE_API_TOKEN_HETZNER
```

### Option 2 : Serveur Existant

```bash
# Déployer sur un serveur existant
bash scripts/deploy-to-server.sh
```

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour le guide complet.

## Roadmap

### Phase 1 - Foundation ✅
- [x] Infrastructure Docker
- [x] Plugin Users & Organizations
- [x] Plugin Skills & Profiles

### Phase 2 - Core Features ✅
- [x] Plugin RFP (Appels d'Offres)
- [x] Plugin Applications & Matching
- [x] Plugin Missions
- [x] Plugin Timesheets (CRA)

### Phase 3 - Business Features ✅
- [x] Plugin Invoicing
- [x] Plugin Contracts & Compliance
- [x] Plugin Notifications

### Phase 4 - Analytics ✅
- [x] Plugin Reporting & Dashboards

### Phase 5 - Production (En cours)
- [ ] Déploiement Hetzner
- [ ] Tests E2E
- [ ] Documentation API
- [ ] Monitoring & Alerting

## Licence

AGPL-3.0 - Voir [LICENSE](LICENSE)

## Auteur

Développé par Claude Agent IA pour **ILINQSOFT**

---

**PRESTAGO** - *Connectez. Collaborez. Performez.* 🚀
