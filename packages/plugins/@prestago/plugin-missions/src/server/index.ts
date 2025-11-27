// =============================================================================
// PRESTAGO - Plugin Missions - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { EventEmitter } from 'events';

// Collections
import { missionsCollection } from './collections/missions';
import { milestonesCollection } from './collections/milestones';
import { deliverablesCollection } from './collections/deliverables';
import { extensionsCollection } from './collections/extensions';
import { evaluationsCollection } from './collections/evaluations';
import { notesCollection } from './collections/notes';
import { historyCollection } from './collections/history';
import { timeEntriesCollection } from './collections/time-entries';

// Services
import { MissionService } from './services/MissionService';
import { MilestoneService } from './services/MilestoneService';
import { DeliverableService } from './services/DeliverableService';
import { ExtensionService } from './services/ExtensionService';
import { EvaluationService } from './services/EvaluationService';

export class PluginMissionsServer extends Plugin {
  private eventEmitter: EventEmitter;
  private missionService: MissionService;
  private milestoneService: MilestoneService;
  private deliverableService: DeliverableService;
  private extensionService: ExtensionService;
  private evaluationService: EvaluationService;

  async afterAdd() {
    // Initialiser l'émetteur d'événements
    this.eventEmitter = new EventEmitter();
  }

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(missionsCollection);
    this.db.collection(milestonesCollection);
    this.db.collection(deliverablesCollection);
    this.db.collection(extensionsCollection);
    this.db.collection(evaluationsCollection);
    this.db.collection(notesCollection);
    this.db.collection(historyCollection);
    this.db.collection(timeEntriesCollection);
  }

  async load() {
    // Initialiser les services
    this.missionService = new MissionService(this.db, this.eventEmitter);
    this.milestoneService = new MilestoneService(this.db, this.eventEmitter);
    this.deliverableService = new DeliverableService(this.db, this.eventEmitter);
    this.extensionService = new ExtensionService(this.db, this.eventEmitter);
    this.evaluationService = new EvaluationService(this.db, this.eventEmitter);

    // Exposer les services
    this.app.context.missionService = this.missionService;
    this.app.context.milestoneService = this.milestoneService;
    this.app.context.deliverableService = this.deliverableService;
    this.app.context.extensionService = this.extensionService;
    this.app.context.missionEvaluationService = this.evaluationService;

    // Enregistrer les routes API
    this.registerRoutes();
  }

  private registerRoutes() {
    const router = this.app.resourcer;

    // =====================================================
    // Routes Missions
    // =====================================================

    // Créer une mission à partir d'une offre
    router.registerAction('missions:createFromOffer', async (ctx, next) => {
      const { offerId } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.createFromOffer(offerId, userId);
      await next();
    });

    // Démarrer une mission
    router.registerAction('missions:start', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { actualStartDate } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.startMission(filterByTk, userId, actualStartDate);
      await next();
    });

    // Mettre en pause une mission
    router.registerAction('missions:pause', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.pauseMission(filterByTk, userId, reason);
      await next();
    });

    // Reprendre une mission
    router.registerAction('missions:resume', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.resumeMission(filterByTk, userId);
      await next();
    });

    // Terminer une mission
    router.registerAction('missions:complete', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.completeMission(filterByTk, userId);
      await next();
    });

    // Résilier prématurément une mission
    router.registerAction('missions:terminate', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { end_type, reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.terminateMission(filterByTk, userId, { end_type, reason });
      await next();
    });

    // Annuler une mission
    router.registerAction('missions:cancel', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.missionService.cancelMission(filterByTk, userId, reason);
      await next();
    });

    // Missions d'un consultant
    router.registerAction('missions:byConsultant', async (ctx, next) => {
      const { consultantId, status } = ctx.action.params;

      ctx.body = await this.missionService.getMissionsByConsultant(consultantId, status);
      await next();
    });

    // Missions d'une organisation cliente
    router.registerAction('missions:byClient', async (ctx, next) => {
      const { clientOrgId, status } = ctx.action.params;

      ctx.body = await this.missionService.getMissionsByClient(clientOrgId, status);
      await next();
    });

    // Missions se terminant bientôt
    router.registerAction('missions:endingSoon', async (ctx, next) => {
      const { days } = ctx.action.params;

      ctx.body = await this.missionService.getMissionsEndingSoon(days);
      await next();
    });

    // Statistiques des missions
    router.registerAction('missions:stats', async (ctx, next) => {
      const { orgId, orgType } = ctx.action.params;

      ctx.body = await this.missionService.getMissionStats(orgId, orgType);
      await next();
    });

    // =====================================================
    // Routes Jalons (Milestones)
    // =====================================================

    // Créer un jalon
    router.registerAction('milestones:create', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.milestoneService.createMilestone(values, userId);
      await next();
    });

    // Démarrer un jalon
    router.registerAction('milestones:start', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.milestoneService.startMilestone(filterByTk, userId);
      await next();
    });

    // Compléter un jalon
    router.registerAction('milestones:complete', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.milestoneService.completeMilestone(filterByTk, userId);
      await next();
    });

    // Jalons d'une mission
    router.registerAction('milestones:byMission', async (ctx, next) => {
      const { missionId } = ctx.action.params;

      ctx.body = await this.milestoneService.getMilestonesByMission(missionId);
      await next();
    });

    // Jalons en retard
    router.registerAction('milestones:overdue', async (ctx, next) => {
      ctx.body = await this.milestoneService.getOverdueMilestones();
      await next();
    });

    // Jalons arrivant à échéance
    router.registerAction('milestones:dueSoon', async (ctx, next) => {
      const { days } = ctx.action.params;

      ctx.body = await this.milestoneService.getMilestonesDueSoon(days);
      await next();
    });

    // Réordonner les jalons
    router.registerAction('milestones:reorder', async (ctx, next) => {
      const { missionId, orderedIds } = ctx.action.params.values || {};

      await this.milestoneService.reorderMilestones(missionId, orderedIds);
      ctx.body = { success: true };
      await next();
    });

    // =====================================================
    // Routes Livrables
    // =====================================================

    // Créer un livrable
    router.registerAction('deliverables:create', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.createDeliverable(values, userId);
      await next();
    });

    // Soumettre un livrable
    router.registerAction('deliverables:submit', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { file_url, attachments } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.submitDeliverable(filterByTk, { file_url, attachments }, userId);
      await next();
    });

    // Commencer la revue
    router.registerAction('deliverables:startReview', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.startReview(filterByTk, userId);
      await next();
    });

    // Approuver un livrable
    router.registerAction('deliverables:approve', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { comments } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.approveDeliverable(filterByTk, userId, comments);
      await next();
    });

    // Rejeter un livrable
    router.registerAction('deliverables:reject', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.rejectDeliverable(filterByTk, userId, reason);
      await next();
    });

    // Demander une révision
    router.registerAction('deliverables:requestRevision', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { feedback } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.requestRevision(filterByTk, userId, feedback);
      await next();
    });

    // Livrables d'une mission
    router.registerAction('deliverables:byMission', async (ctx, next) => {
      const { missionId } = ctx.action.params;

      ctx.body = await this.deliverableService.getDeliverablesByMission(missionId);
      await next();
    });

    // Livrables en attente de revue
    router.registerAction('deliverables:pendingReview', async (ctx, next) => {
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.deliverableService.getPendingReviewDeliverables(userId);
      await next();
    });

    // =====================================================
    // Routes Extensions
    // =====================================================

    // Créer une extension
    router.registerAction('extensions:create', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.extensionService.createExtension(values, userId);
      await next();
    });

    // Soumettre pour approbation
    router.registerAction('extensions:submitForApproval', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;

      ctx.body = await this.extensionService.submitForApproval(filterByTk);
      await next();
    });

    // Approuver une extension
    router.registerAction('extensions:approve', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.extensionService.approveExtension(filterByTk, userId);
      await next();
    });

    // Rejeter une extension
    router.registerAction('extensions:reject', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.extensionService.rejectExtension(filterByTk, userId, reason);
      await next();
    });

    // Appliquer une extension
    router.registerAction('extensions:apply', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.extensionService.applyExtension(filterByTk, userId);
      await next();
    });

    // Extensions d'une mission
    router.registerAction('extensions:byMission', async (ctx, next) => {
      const { missionId } = ctx.action.params;

      ctx.body = await this.extensionService.getExtensionsByMission(missionId);
      await next();
    });

    // Extensions en attente d'approbation
    router.registerAction('extensions:pendingApprovals', async (ctx, next) => {
      ctx.body = await this.extensionService.getPendingApprovals();
      await next();
    });

    // =====================================================
    // Routes Évaluations
    // =====================================================

    // Soumettre une évaluation
    router.registerAction('missionEvaluations:submit', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.evaluationService.submitEvaluation(values, userId);
      await next();
    });

    // Évaluations d'une mission
    router.registerAction('missionEvaluations:byMission', async (ctx, next) => {
      const { missionId } = ctx.action.params;

      ctx.body = await this.evaluationService.getEvaluationsByMission(missionId);
      await next();
    });

    // Évaluations d'un profil
    router.registerAction('missionEvaluations:byProfile', async (ctx, next) => {
      const { profileId, publicOnly } = ctx.action.params;

      ctx.body = await this.evaluationService.getEvaluationsByProfile(profileId, publicOnly);
      await next();
    });

    // Résumé des évaluations d'un profil
    router.registerAction('missionEvaluations:profileSummary', async (ctx, next) => {
      const { profileId } = ctx.action.params;

      ctx.body = await this.evaluationService.getProfileEvaluationSummary(profileId);
      await next();
    });
  }

  async install() {
    // Logique d'installation
    this.log.info('Plugin Missions installed');
  }

  async afterEnable() {
    // Configurer les tâches planifiées
    this.setupScheduledTasks();
  }

  private setupScheduledTasks() {
    // Vérifier les jalons en retard (quotidien)
    // Cette tâche sera exécutée par un scheduler externe (cron)
    this.app.on('mission:checkOverdue', async () => {
      const count = await this.milestoneService.checkAndMarkOverdue();
      this.log.info(`Checked overdue milestones: ${count} marked as overdue`);
    });
  }

  async afterDisable() {
    // Nettoyage
  }

  async remove() {
    // Suppression du plugin
  }
}

export default PluginMissionsServer;
