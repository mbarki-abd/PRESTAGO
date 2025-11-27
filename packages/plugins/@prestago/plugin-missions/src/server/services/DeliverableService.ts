// =============================================================================
// PRESTAGO - Plugin Missions - Service: Gestion des livrables
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, DELIVERABLE_STATUS_TRANSITIONS } from '../../shared/constants';
import { DeliverableStatus, DeliverableType, MISSION_EVENTS } from '../../shared/types';

export class DeliverableService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer un livrable
   */
  async createDeliverable(data: {
    mission_id: string;
    milestone_id?: string;
    name: string;
    description?: string;
    type: DeliverableType;
    due_date: Date;
  }, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.create({
      values: {
        ...data,
        status: DeliverableStatus.PENDING,
        version: 1,
        created_by_id: userId
      }
    });

    return deliverable;
  }

  /**
   * Démarrer le travail sur un livrable
   */
  async startWorking(deliverableId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.IN_PROGRESS);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: { status: DeliverableStatus.IN_PROGRESS }
    });

    return updated[0];
  }

  /**
   * Soumettre un livrable pour revue
   */
  async submitDeliverable(deliverableId: string, data: {
    file_url?: string;
    attachments?: any[];
  }, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.SUBMITTED);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.SUBMITTED,
        file_url: data.file_url || deliverable.file_url,
        attachments: data.attachments || deliverable.attachments,
        submitted_date: new Date()
      }
    });

    // Ajouter à l'historique
    await this.addMissionHistory(
      deliverable.mission_id,
      userId,
      'deliverable_submitted',
      `Livrable soumis: ${deliverable.name}`
    );

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.DELIVERABLE_SUBMITTED, {
        deliverable: updated[0],
        userId
      });
    }

    return updated[0];
  }

  /**
   * Commencer la revue d'un livrable
   */
  async startReview(deliverableId: string, reviewerId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.UNDER_REVIEW);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.UNDER_REVIEW,
        reviewer_id: reviewerId
      }
    });

    return updated[0];
  }

  /**
   * Approuver un livrable
   */
  async approveDeliverable(deliverableId: string, reviewerId: string, comments?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.APPROVED);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.APPROVED,
        approved_date: new Date(),
        reviewer_id: reviewerId,
        review_comments: comments
      }
    });

    // Ajouter à l'historique
    await this.addMissionHistory(
      deliverable.mission_id,
      reviewerId,
      'deliverable_approved',
      `Livrable approuvé: ${deliverable.name}`
    );

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.DELIVERABLE_APPROVED, {
        deliverable: updated[0],
        reviewerId
      });
    }

    return updated[0];
  }

  /**
   * Rejeter un livrable
   */
  async rejectDeliverable(deliverableId: string, reviewerId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.REJECTED);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.REJECTED,
        reviewer_id: reviewerId,
        review_comments: reason
      }
    });

    // Ajouter à l'historique
    await this.addMissionHistory(
      deliverable.mission_id,
      reviewerId,
      'deliverable_rejected',
      `Livrable rejeté: ${deliverable.name} - ${reason}`
    );

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.DELIVERABLE_REJECTED, {
        deliverable: updated[0],
        reason,
        reviewerId
      });
    }

    return updated[0];
  }

  /**
   * Demander une révision
   */
  async requestRevision(deliverableId: string, reviewerId: string, feedback: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    this.validateStatusTransition(deliverable.status, DeliverableStatus.REVISION_REQUESTED);

    const updated = await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.REVISION_REQUESTED,
        reviewer_id: reviewerId,
        review_comments: feedback
      }
    });

    return updated[0];
  }

  /**
   * Resoumettre après révision
   */
  async resubmit(deliverableId: string, data: {
    file_url?: string;
    attachments?: any[];
  }, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const deliverable = await collection.repository.findOne({
      filter: { id: deliverableId }
    });

    if (!deliverable) {
      throw new Error('Livrable non trouvé');
    }

    // Incrémenter la version
    const newVersion = (deliverable.version || 1) + 1;

    // Remettre en "in_progress" puis soumettre
    await collection.repository.update({
      filter: { id: deliverableId },
      values: {
        status: DeliverableStatus.IN_PROGRESS,
        version: newVersion
      }
    });

    // Soumettre à nouveau
    return this.submitDeliverable(deliverableId, data, userId);
  }

  /**
   * Obtenir les livrables d'une mission
   */
  async getDeliverablesByMission(missionId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    return collection.repository.find({
      filter: { mission_id: missionId },
      appends: ['milestone', 'reviewer'],
      sort: ['due_date']
    });
  }

  /**
   * Obtenir les livrables d'un jalon
   */
  async getDeliverablesByMilestone(milestoneId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    return collection.repository.find({
      filter: { milestone_id: milestoneId },
      appends: ['reviewer'],
      sort: ['due_date']
    });
  }

  /**
   * Obtenir les livrables en attente de revue
   */
  async getPendingReviewDeliverables(reviewerId?: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);

    const filter: any = {
      status: { $in: [DeliverableStatus.SUBMITTED, DeliverableStatus.UNDER_REVIEW] }
    };

    if (reviewerId) {
      filter.reviewer_id = reviewerId;
    }

    return collection.repository.find({
      filter,
      appends: ['mission', 'milestone'],
      sort: ['submitted_date']
    });
  }

  /**
   * Obtenir les livrables arrivant à échéance
   */
  async getDeliverablesDueSoon(days: number = 3): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.DELIVERABLES);
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: { $in: [DeliverableStatus.PENDING, DeliverableStatus.IN_PROGRESS] },
        due_date: {
          $gte: now,
          $lte: deadline
        }
      },
      appends: ['mission']
    });
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: DeliverableStatus, newStatus: DeliverableStatus): void {
    const allowedTransitions = DELIVERABLE_STATUS_TRANSITIONS[currentStatus];
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
