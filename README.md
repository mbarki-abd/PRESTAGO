# PRESTAGO

**Plateforme de Gestion des Prestataires et Missions**

*"Connectez. Collaborez. Performez."*

---

## Description

PRESTAGO est une plateforme SaaS multi-tenant de gestion complète des prestataires (freelances et ESN) pour les grandes entreprises. Elle couvre l'ensemble du cycle de vie : sourcing, matching IA, contractualisation, suivi de mission, CRA, facturation et analytics.

Inspirée de [LittleBigConnection](https://www.littlebigconnection.com/), PRESTAGO est construite sur [NocoBase](https://www.nocobase.com/), une plateforme no-code/low-code extensible.

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
| Core Platform | NocoBase |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| Search | Meilisearch |
| Storage | MinIO (S3) |
| Queue | BullMQ |
| PDF | Puppeteer |
| Container | Docker |
| Hosting | Hetzner Cloud |

## Structure du Projet

```
prestago/
├── docker/                    # Configuration Docker
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
├── packages/
│   └── plugins/
│       └── @prestago/         # Plugins NocoBase
│           ├── plugin-users/
│           ├── plugin-profiles/
│           ├── plugin-rfp/
│           ├── plugin-applications/
│           ├── plugin-missions/
│           ├── plugin-timesheets/
│           ├── plugin-invoicing/
│           ├── plugin-contracts/
│           ├── plugin-notifications/
│           ├── plugin-reporting/
│           ├── plugin-api/
│           ├── plugin-tenants/
│           └── plugin-ai/
├── storage/                   # Fichiers uploadés
├── docs/                      # Documentation
├── scripts/                   # Scripts utilitaires
└── .env.example              # Variables d'environnement
```

## Installation

### Prérequis

- Docker & Docker Compose
- Node.js 18+ (pour développement)
- Git

### Démarrage Rapide

```bash
# Cloner le repository
git clone https://github.com/mbarki-abd/PRESTAGO.git
cd PRESTAGO

# Copier les variables d'environnement
cp .env.example .env

# Démarrer les services
docker-compose up -d

# Accéder à l'application
open http://localhost:13000
```

### Développement

```bash
# Installer les dépendances
yarn install

# Démarrer en mode développement
yarn dev

# Créer un nouveau plugin
yarn nocobase pm create @prestago/plugin-name
```

## Documentation

- [Cahier des Charges](docs/PRESTAGO-CAHIER-DES-CHARGES.md)
- [Roadmap](docs/PRESTAGO-ROADMAP.md)
- [API Documentation](docs/API.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)

## Roadmap

### Phase 1 (M1-M3) - MVP Foundation
- [x] Infrastructure Docker
- [ ] Plugin Users & Organizations
- [ ] Plugin Profiles & Skills
- [ ] Plugin RFP
- [ ] Plugin Applications

### Phase 2 (M4-M6) - Core Features
- [ ] Plugin Missions
- [ ] Plugin Timesheets (CRA)
- [ ] Plugin Invoicing
- [ ] Plugin Contracts & DocuSign

### Phase 3 (M7-M9) - Advanced Features
- [ ] AI Matching (Claude/OpenAI)
- [ ] Multi-Tenant
- [ ] Public API

### Phase 4 (M10-M12) - Scale & Launch
- [ ] Performance optimization
- [ ] Mobile PWA
- [ ] Production launch

## Licence

Propriétaire - ILINQSOFT

## Auteur

Développé avec Claude Agent IA pour ILINQSOFT

---

**PRESTAGO** - *Connectez. Collaborez. Performez.*
