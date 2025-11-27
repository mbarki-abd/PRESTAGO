// =============================================================================
// PRESTAGO - Plugin Contracts - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { ContractService } from './services/ContractService';
import { ComplianceService } from './services/ComplianceService';

// Collections
import { contractsCollection } from './collections/contracts';
import { signaturesCollection } from './collections/signatures';
import { complianceDocumentsCollection } from './collections/compliance-documents';
import { contractTemplatesCollection } from './collections/contract-templates';
import { clausesCollection } from './collections/clauses';

export class PluginContractsServer extends Plugin {
  contractService: ContractService;
  complianceService: ComplianceService;

  async afterAdd() {}

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(contractsCollection);
    this.db.collection(signaturesCollection);
    this.db.collection(complianceDocumentsCollection);
    this.db.collection(contractTemplatesCollection);
    this.db.collection(clausesCollection);
  }

  async load() {
    // Initialiser les services
    this.contractService = new ContractService(this.db, this.app);
    this.complianceService = new ComplianceService(this.db, this.app);

    // Enregistrer les routes API
    this.registerContractRoutes();
    this.registerComplianceRoutes();
    this.registerTemplateRoutes();

    // Programmer les vérifications périodiques
    this.schedulePeriodicChecks();

    this.app.logger.info('Plugin Contracts chargé avec succès');
  }

  async install() {
    await this.db.sync();
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}

  private registerContractRoutes() {
    this.app.resource({
      name: 'contracts',
      actions: {
        // Créer un contrat
        create: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const contract = await this.contractService.createContract(values, userId);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Créer un avenant
        createAmendment: async (ctx, next) => {
          const { filterByTk: parentId, values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const amendment = await this.contractService.createAmendment(parentId, values, userId);
            ctx.body = { success: true, data: amendment };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Soumettre pour révision
        submitForReview: async (ctx, next) => {
          const { filterByTk: contractId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const contract = await this.contractService.submitForReview(contractId, userId);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Approuver
        approve: async (ctx, next) => {
          const { filterByTk: contractId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const contract = await this.contractService.approveContract(contractId, userId);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Rejeter
        reject: async (ctx, next) => {
          const { filterByTk: contractId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!reason) {
            ctx.throw(400, 'Motif de rejet requis');
          }

          try {
            const contract = await this.contractService.rejectContract(contractId, userId, reason);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Envoyer pour signature
        sendForSignature: async (ctx, next) => {
          const { filterByTk: contractId, signatories } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!signatories || !Array.isArray(signatories)) {
            ctx.throw(400, 'Signataires requis');
          }

          try {
            const contract = await this.contractService.sendForSignature(contractId, signatories, userId);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Suspendre
        suspend: async (ctx, next) => {
          const { filterByTk: contractId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const contract = await this.contractService.suspendContract(contractId, userId, reason || '');
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Résilier
        terminate: async (ctx, next) => {
          const { filterByTk: contractId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!reason) {
            ctx.throw(400, 'Motif de résiliation requis');
          }

          try {
            const contract = await this.contractService.terminateContract(contractId, userId, reason);
            ctx.body = { success: true, data: contract };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Statistiques
        stats: async (ctx, next) => {
          const { organizationId } = ctx.action.params;

          try {
            const stats = await this.contractService.getContractStats(organizationId);
            ctx.body = { success: true, data: stats };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // Routes pour les signatures
    this.app.resource({
      name: 'signatures',
      actions: {
        // Signer
        sign: async (ctx, next) => {
          const { token, signatureData } = ctx.action.params;
          const ip = ctx.request.ip;
          const userAgent = ctx.request.headers['user-agent'] || '';

          if (!token || !signatureData) {
            ctx.throw(400, 'Token et données de signature requis');
          }

          try {
            const signature = await this.contractService.recordSignature(token, signatureData, ip, userAgent);
            ctx.body = { success: true, data: signature };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Refuser
        decline: async (ctx, next) => {
          const { token, reason } = ctx.action.params;

          if (!token) {
            ctx.throw(400, 'Token requis');
          }

          try {
            const signature = await this.contractService.declineSignature(token, reason || '');
            ctx.body = { success: true, data: signature };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('contracts', 'list', 'loggedIn');
    this.app.acl.allow('contracts', 'get', 'loggedIn');
    this.app.acl.allow('contracts', 'create', 'loggedIn');
    this.app.acl.allow('contracts', 'update', 'loggedIn');
    this.app.acl.allow('contracts', 'createAmendment', 'loggedIn');
    this.app.acl.allow('contracts', 'submitForReview', 'loggedIn');
    this.app.acl.allow('contracts', 'approve', 'loggedIn');
    this.app.acl.allow('contracts', 'reject', 'loggedIn');
    this.app.acl.allow('contracts', 'sendForSignature', 'loggedIn');
    this.app.acl.allow('contracts', 'suspend', 'loggedIn');
    this.app.acl.allow('contracts', 'terminate', 'loggedIn');
    this.app.acl.allow('contracts', 'stats', 'loggedIn');

    this.app.acl.allow('signatures', 'sign', 'public'); // Accessible via token
    this.app.acl.allow('signatures', 'decline', 'public');
  }

  private registerComplianceRoutes() {
    this.app.resource({
      name: 'compliance_documents',
      actions: {
        // Upload
        upload: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const document = await this.complianceService.uploadDocument(values, userId);
            ctx.body = { success: true, data: document };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Valider
        validate: async (ctx, next) => {
          const { filterByTk: documentId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const document = await this.complianceService.validateDocument(documentId, userId);
            ctx.body = { success: true, data: document };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Rejeter
        reject: async (ctx, next) => {
          const { filterByTk: documentId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!reason) {
            ctx.throw(400, 'Motif de rejet requis');
          }

          try {
            const document = await this.complianceService.rejectDocument(documentId, userId, reason);
            ctx.body = { success: true, data: document };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Vérifier conformité organisation
        checkOrganization: async (ctx, next) => {
          const { organizationId, contractType } = ctx.action.params;

          if (!organizationId) {
            ctx.throw(400, 'ID organisation requis');
          }

          try {
            const result = await this.complianceService.checkOrganizationCompliance(organizationId, contractType);
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Vérifier conformité consultant
        checkConsultant: async (ctx, next) => {
          const { userId, includeOptional } = ctx.action.params;

          if (!userId) {
            ctx.throw(400, 'ID utilisateur requis');
          }

          try {
            const result = await this.complianceService.checkConsultantCompliance(userId, includeOptional === 'true');
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Documents expirant bientôt
        expiring: async (ctx, next) => {
          const { days } = ctx.action.params;

          try {
            const documents = await this.complianceService.getExpiringDocuments(days ? parseInt(days) : undefined);
            ctx.body = { success: true, data: documents };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Statistiques
        stats: async (ctx, next) => {
          try {
            const stats = await this.complianceService.getComplianceStats();
            ctx.body = { success: true, data: stats };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('compliance_documents', 'list', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'get', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'upload', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'validate', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'reject', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'checkOrganization', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'checkConsultant', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'expiring', 'loggedIn');
    this.app.acl.allow('compliance_documents', 'stats', 'loggedIn');
  }

  private registerTemplateRoutes() {
    this.app.resource({
      name: 'contract_templates',
      actions: {
        // Générer contenu depuis template
        generate: async (ctx, next) => {
          const { filterByTk: templateId, variables } = ctx.action.params;

          if (!templateId) {
            ctx.throw(400, 'ID du modèle requis');
          }

          try {
            const content = await this.contractService.generateFromTemplate(templateId, variables || {});
            ctx.body = { success: true, data: { content } };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('contract_templates', 'list', 'loggedIn');
    this.app.acl.allow('contract_templates', 'get', 'loggedIn');
    this.app.acl.allow('contract_templates', 'create', 'loggedIn');
    this.app.acl.allow('contract_templates', 'update', 'loggedIn');
    this.app.acl.allow('contract_templates', 'generate', 'loggedIn');

    this.app.acl.allow('clauses', 'list', 'loggedIn');
    this.app.acl.allow('clauses', 'get', 'loggedIn');
    this.app.acl.allow('clauses', 'create', 'loggedIn');
    this.app.acl.allow('clauses', 'update', 'loggedIn');
  }

  private schedulePeriodicChecks() {
    // Vérification quotidienne des expirations
    const checkInterval = 24 * 60 * 60 * 1000; // 24 heures

    setInterval(async () => {
      try {
        // Vérifier les contrats expirés
        const expiredContracts = await this.contractService.markExpiredContracts();
        if (expiredContracts > 0) {
          this.app.logger.info(`${expiredContracts} contrat(s) marqué(s) comme expiré(s)`);
        }

        // Vérifier les documents de conformité
        const { expired, expiringSoon } = await this.complianceService.checkDocumentExpirations();
        if (expired > 0 || expiringSoon > 0) {
          this.app.logger.info(
            `Documents de conformité: ${expired} expiré(s), ${expiringSoon} expire(nt) bientôt`
          );
        }
      } catch (error) {
        this.app.logger.error('Erreur lors des vérifications périodiques:', error);
      }
    }, checkInterval);

    // Première vérification au démarrage
    setTimeout(async () => {
      try {
        await this.contractService.markExpiredContracts();
        await this.complianceService.checkDocumentExpirations();
      } catch (error) {
        this.app.logger.error('Erreur lors de la vérification initiale:', error);
      }
    }, 10000);
  }
}

export default PluginContractsServer;
