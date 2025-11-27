// =============================================================================
// PRESTAGO - Plugin Missions - Service: Gestion des missions
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, MISSION_STATUS_TRANSITIONS, DEFAULTS, generateMissionReference, calculateBudget } from '../../shared/constants';
import { MissionStatus, MissionEndType, MISSION_EVENTS } from '../../shared/types';

export class MissionService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer une mission à partir d'une offre acceptée
   */
  async createFromOffer(offerId: string, userId: string): Promise<any> {
    const offerCollection = this.db.getCollection('prestago_application_offers');
    const appCollection = this.db.getCollection('prestago_applications');
    const rfpCollection = this.db.getCollection('prestago_rfps');
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);

    // Récupérer l'offre avec ses relations
    const offer = await offerCollection.repository.findOne({
      filter: { id: offerId },
      appends: ['application', 'profile']
    });

    if (!offer) {
      throw new Error('Offre non trouvée');
    }

    if (offer.status !== 'accepted') {
      throw new Error('L\'offre doit être acceptée pour créer une mission');
    }

    // Récupérer l'application et le RFP
    const application = await appCollection.repository.findOne({
      filter: { id: offer.application_id }
    });

    const rfp = await rfpCollection.repository.findOne({
      filter: { id: application.rfp_id }
    });

    // Vérifier qu'une mission n'existe pas déjà
    const existingMission = await missionCollection.repository.findOne({
      filter: { offer_id: offerId }
    });

    if (existingMission) {
      throw new Error('Une mission existe déjà pour cette offre');
    }

    // Générer la référence
    const year = new Date().getFullYear();
    const clientCode = rfp.client_organization_id?.substring(0, 4).toUpperCase() || 'CLI';
    const count = await missionCollection.repository.count({
      filter: {
        client_organization_id: rfp.client_organization_id,
        created_at: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    });
    const reference = generateMissionReference(clientCode, year, count + 1);

    // Calculer les jours estimés
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const estimatedDays = Math.round(diffDays * 0.7); // ~70% de jours ouvrés

    // Calculer le budget
    const budget = calculateBudget(offer.daily_rate, estimatedDays);

    // Créer la mission
    const mission = await missionCollection.repository.create({
      values: {
        reference,
        title: offer.position_title || rfp.title,
        description: rfp.description,

        // Relations
        rfp_id: rfp.id,
        application_id: application.id,
        offer_id: offer.id,
        profile_id: offer.profile_id,
        client_organization_id: rfp.client_organization_id,
        consultant_organization_id: application.consultant_organization_id,

        // Responsables
        client_manager_id: rfp.created_by_id,
        consultant_id: application.profile_id,

        // Dates
        start_date: offer.start_date,
        end_date: offer.end_date,

        // Financier
        daily_rate: offer.daily_rate,
        rate_currency: offer.rate_currency || DEFAULTS.RATE_CURRENCY,
        estimated_days: estimatedDays,
        budget_total: budget,

        // Mode de travail
        work_mode: offer.work_mode,
        remote_percentage: offer.remote_percentage,
        work_location: offer.location,

        // Statut
        status: MissionStatus.DRAFT,

        // Configuration
        reporting_frequency: DEFAULTS.REPORTING_FREQUENCY,
        requires_timesheet: true,
        timesheet_approval_levels: DEFAULTS.TIMESHEET_APPROVAL_LEVELS,

        created_by_id: userId
      }
    });

    // Ajouter à l'historique
    await this.addHistory(mission.id, userId, 'created', 'Mission créée à partir de l\'offre acceptée');

    // Émettre l'événement
    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_CREATED, { mission, offer, userId });
    }

    return mission;
  }

  /**
   * Démarrer une mission
   */
  async startMission(missionId: string, userId: string, actualStartDate?: Date): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.ACTIVE);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: {
        status: MissionStatus.ACTIVE,
        actual_start_date: actualStartDate || new Date()
      }
    });

    await this.addHistory(missionId, userId, 'started', 'Mission démarrée');

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_STARTED, { mission: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Mettre en pause une mission
   */
  async pauseMission(missionId: string, userId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.ON_HOLD);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: { status: MissionStatus.ON_HOLD }
    });

    await this.addHistory(missionId, userId, 'on_hold', reason || 'Mission mise en pause');

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_ON_HOLD, { mission: updated[0], reason, userId });
    }

    return updated[0];
  }

  /**
   * Reprendre une mission
   */
  async resumeMission(missionId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.ACTIVE);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: { status: MissionStatus.ACTIVE }
    });

    await this.addHistory(missionId, userId, 'resumed', 'Mission reprise');

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_RESUMED, { mission: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Terminer une mission
   */
  async completeMission(missionId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.COMPLETED);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: {
        status: MissionStatus.COMPLETED,
        end_type: MissionEndType.NATURAL,
        actual_end_date: new Date()
      }
    });

    await this.addHistory(missionId, userId, 'completed', 'Mission terminée avec succès');

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_COMPLETED, { mission: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Résilier prématurément une mission
   */
  async terminateMission(missionId: string, userId: string, data: {
    end_type: MissionEndType;
    reason: string;
  }): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.TERMINATED_EARLY);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: {
        status: MissionStatus.TERMINATED_EARLY,
        end_type: data.end_type,
        termination_reason: data.reason,
        actual_end_date: new Date()
      }
    });

    await this.addHistory(missionId, userId, 'terminated', `Mission terminée: ${data.reason}`);

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_TERMINATED, {
        mission: updated[0],
        endType: data.end_type,
        reason: data.reason,
        userId
      });
    }

    return updated[0];
  }

  /**
   * Annuler une mission
   */
  async cancelMission(missionId: string, userId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    this.validateStatusTransition(mission.status, MissionStatus.CANCELLED);

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: {
        status: MissionStatus.CANCELLED,
        termination_reason: reason
      }
    });

    await this.addHistory(missionId, userId, 'cancelled', reason || 'Mission annulée');

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MISSION_CANCELLED, { mission: updated[0], reason, userId });
    }

    return updated[0];
  }

  /**
   * Mettre à jour les jours réalisés et le budget consommé
   */
  async updateProgress(missionId: string, actualDays: number): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const mission = await collection.repository.findOne({
      filter: { id: missionId }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    const budgetConsumed = actualDays * mission.daily_rate;

    const updated = await collection.repository.update({
      filter: { id: missionId },
      values: {
        actual_days: actualDays,
        budget_consumed: budgetConsumed
      }
    });

    return updated[0];
  }

  /**
   * Obtenir une mission par ID
   */
  async getMissionById(missionId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    return collection.repository.findOne({
      filter: { id: missionId },
      appends: [
        'rfp', 'application', 'offer', 'profile',
        'client_organization', 'consultant_organization',
        'client_manager', 'consultant', 'account_manager',
        'milestones', 'deliverables', 'evaluations'
      ]
    });
  }

  /**
   * Obtenir les missions d'un consultant
   */
  async getMissionsByConsultant(consultantId: string, status?: MissionStatus[]): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const filter: any = { consultant_id: consultantId };
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    return collection.repository.find({
      filter,
      appends: ['client_organization', 'rfp'],
      sort: ['-start_date']
    });
  }

  /**
   * Obtenir les missions d'une organisation cliente
   */
  async getMissionsByClient(clientOrgId: string, status?: MissionStatus[]): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const filter: any = { client_organization_id: clientOrgId };
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    return collection.repository.find({
      filter,
      appends: ['consultant', 'profile'],
      sort: ['-start_date']
    });
  }

  /**
   * Obtenir les missions se terminant bientôt
   */
  async getMissionsEndingSoon(days: number = 30): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: MissionStatus.ACTIVE,
        end_date: {
          $gte: now,
          $lte: deadline
        }
      },
      appends: ['consultant', 'client_organization'],
      sort: ['end_date']
    });
  }

  /**
   * Obtenir les statistiques des missions
   */
  async getMissionStats(orgId?: string, orgType?: 'client' | 'consultant'): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MISSIONS);

    let filter: any = {};
    if (orgId) {
      if (orgType === 'client') {
        filter.client_organization_id = orgId;
      } else {
        filter.consultant_organization_id = orgId;
      }
    }

    const missions = await collection.repository.find({ filter });

    const stats: any = {
      total: missions.length,
      by_status: {},
      total_budget: 0,
      total_consumed: 0,
      average_duration_days: 0,
      average_daily_rate: 0
    };

    let totalDuration = 0;
    let totalRate = 0;
    let rateCount = 0;

    for (const mission of missions) {
      // Par statut
      stats.by_status[mission.status] = (stats.by_status[mission.status] || 0) + 1;

      // Budget
      stats.total_budget += mission.budget_total || 0;
      stats.total_consumed += mission.budget_consumed || 0;

      // Durée
      if (mission.start_date && mission.end_date) {
        const diff = new Date(mission.end_date).getTime() - new Date(mission.start_date).getTime();
        totalDuration += diff / (1000 * 60 * 60 * 24);
      }

      // TJM
      if (mission.daily_rate) {
        totalRate += mission.daily_rate;
        rateCount++;
      }
    }

    stats.average_duration_days = missions.length > 0
      ? Math.round(totalDuration / missions.length)
      : 0;
    stats.average_daily_rate = rateCount > 0
      ? Math.round(totalRate / rateCount)
      : 0;
    stats.budget_consumption_rate = stats.total_budget > 0
      ? ((stats.total_consumed / stats.total_budget) * 100).toFixed(1)
      : 0;

    return stats;
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: MissionStatus, newStatus: MissionStatus): void {
    const allowedTransitions = MISSION_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }

  /**
   * Ajouter une entrée à l'historique
   */
  private async addHistory(
    missionId: string,
    userId: string,
    action: string,
    description?: string
  ): Promise<void> {
    const historyCollection = this.db.getCollection(COLLECTIONS.HISTORY);

    await historyCollection.repository.create({
      values: {
        mission_id: missionId,
        user_id: userId,
        action,
        description
      }
    });
  }
}
