// =============================================================================
// PRESTAGO - Plugin Missions - Service: Gestion des jalons
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, MILESTONE_STATUS_TRANSITIONS } from '../../shared/constants';
import { MilestoneStatus, MissionStatus, MISSION_EVENTS } from '../../shared/types';

export class MilestoneService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer un jalon
   */
  async createMilestone(data: {
    mission_id: string;
    name: string;
    description?: string;
    due_date: Date;
    deliverables_required?: boolean;
    payment_trigger?: boolean;
    payment_percentage?: number;
  }, userId: string): Promise<any> {
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);
    const milestoneCollection = this.db.getCollection(COLLECTIONS.MILESTONES);

    // Vérifier que la mission existe et est active
    const mission = await missionCollection.repository.findOne({
      filter: { id: data.mission_id }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    if (mission.status !== MissionStatus.ACTIVE && mission.status !== MissionStatus.DRAFT) {
      throw new Error('Impossible d\'ajouter un jalon à une mission qui n\'est pas active ou en brouillon');
    }

    // Déterminer l'ordre
    const existingMilestones = await milestoneCollection.repository.count({
      filter: { mission_id: data.mission_id }
    });

    const milestone = await milestoneCollection.repository.create({
      values: {
        ...data,
        status: MilestoneStatus.PENDING,
        order: existingMilestones + 1
      }
    });

    // Ajouter à l'historique de la mission
    await this.addMissionHistory(data.mission_id, userId, 'milestone_created', `Jalon créé: ${data.name}`);

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MILESTONE_CREATED, { milestone, mission, userId });
    }

    return milestone;
  }

  /**
   * Démarrer un jalon
   */
  async startMilestone(milestoneId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);

    const milestone = await collection.repository.findOne({
      filter: { id: milestoneId }
    });

    if (!milestone) {
      throw new Error('Jalon non trouvé');
    }

    this.validateStatusTransition(milestone.status, MilestoneStatus.IN_PROGRESS);

    const updated = await collection.repository.update({
      filter: { id: milestoneId },
      values: { status: MilestoneStatus.IN_PROGRESS }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MILESTONE_STARTED, { milestone: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Compléter un jalon
   */
  async completeMilestone(milestoneId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);
    const deliverableCollection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const milestone = await collection.repository.findOne({
      filter: { id: milestoneId }
    });

    if (!milestone) {
      throw new Error('Jalon non trouvé');
    }

    // Vérifier que tous les livrables requis sont approuvés
    if (milestone.deliverables_required) {
      const pendingDeliverables = await deliverableCollection.repository.count({
        filter: {
          milestone_id: milestoneId,
          status: { $ne: 'approved' }
        }
      });

      if (pendingDeliverables > 0) {
        throw new Error('Tous les livrables du jalon doivent être approuvés avant de le compléter');
      }
    }

    this.validateStatusTransition(milestone.status, MilestoneStatus.COMPLETED);

    const updated = await collection.repository.update({
      filter: { id: milestoneId },
      values: {
        status: MilestoneStatus.COMPLETED,
        completed_date: new Date()
      }
    });

    await this.addMissionHistory(milestone.mission_id, userId, 'milestone_completed', `Jalon complété: ${milestone.name}`);

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MILESTONE_COMPLETED, { milestone: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Marquer un jalon comme en retard
   */
  async markOverdue(milestoneId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);

    const milestone = await collection.repository.findOne({
      filter: { id: milestoneId }
    });

    if (!milestone) {
      throw new Error('Jalon non trouvé');
    }

    if (milestone.status === MilestoneStatus.COMPLETED || milestone.status === MilestoneStatus.CANCELLED) {
      return milestone;
    }

    const updated = await collection.repository.update({
      filter: { id: milestoneId },
      values: { status: MilestoneStatus.OVERDUE }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.MILESTONE_OVERDUE, { milestone: updated[0] });
    }

    return updated[0];
  }

  /**
   * Annuler un jalon
   */
  async cancelMilestone(milestoneId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);

    const milestone = await collection.repository.findOne({
      filter: { id: milestoneId }
    });

    if (!milestone) {
      throw new Error('Jalon non trouvé');
    }

    this.validateStatusTransition(milestone.status, MilestoneStatus.CANCELLED);

    const updated = await collection.repository.update({
      filter: { id: milestoneId },
      values: { status: MilestoneStatus.CANCELLED }
    });

    return updated[0];
  }

  /**
   * Obtenir les jalons d'une mission
   */
  async getMilestonesByMission(missionId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);

    return collection.repository.find({
      filter: { mission_id: missionId },
      appends: ['deliverables'],
      sort: ['order']
    });
  }

  /**
   * Obtenir les jalons en retard
   */
  async getOverdueMilestones(): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);
    const now = new Date();

    return collection.repository.find({
      filter: {
        status: { $in: [MilestoneStatus.PENDING, MilestoneStatus.IN_PROGRESS] },
        due_date: { $lt: now }
      },
      appends: ['mission']
    });
  }

  /**
   * Obtenir les jalons arrivant à échéance
   */
  async getMilestonesDueSoon(days: number = 7): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: { $in: [MilestoneStatus.PENDING, MilestoneStatus.IN_PROGRESS] },
        due_date: {
          $gte: now,
          $lte: deadline
        }
      },
      appends: ['mission']
    });
  }

  /**
   * Mettre à jour l'ordre des jalons
   */
  async reorderMilestones(missionId: string, orderedIds: string[]): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.MILESTONES);

    for (let i = 0; i < orderedIds.length; i++) {
      await collection.repository.update({
        filter: {
          id: orderedIds[i],
          mission_id: missionId
        },
        values: { order: i + 1 }
      });
    }
  }

  /**
   * Vérifier et marquer les jalons en retard
   */
  async checkAndMarkOverdue(): Promise<number> {
    const overdueMilestones = await this.getOverdueMilestones();
    let count = 0;

    for (const milestone of overdueMilestones) {
      if (milestone.status !== MilestoneStatus.OVERDUE) {
        await this.markOverdue(milestone.id);
        count++;
      }
    }

    return count;
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: MilestoneStatus, newStatus: MilestoneStatus): void {
    const allowedTransitions = MILESTONE_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }

  /**
   * Ajouter à l'historique de la mission
   */
  private async addMissionHistory(
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
