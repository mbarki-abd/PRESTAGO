// =============================================================================
// PRESTAGO - Plugin Missions - Service: Gestion des extensions
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, EXTENSION_STATUS_TRANSITIONS, calculateBudget } from '../../shared/constants';
import { ExtensionStatus, ExtensionType, MISSION_EVENTS } from '../../shared/types';

export class ExtensionService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer une demande d'extension
   */
  async createExtension(data: {
    mission_id: string;
    type: ExtensionType;
    new_end_date?: Date;
    additional_days?: number;
    new_daily_rate?: number;
    scope_changes?: string;
    reason: string;
  }, userId: string): Promise<any> {
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);
    const extensionCollection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    // Récupérer la mission
    const mission = await missionCollection.repository.findOne({
      filter: { id: data.mission_id }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    // Vérifier qu'il n'y a pas d'extension en attente
    const pendingExtension = await extensionCollection.repository.findOne({
      filter: {
        mission_id: data.mission_id,
        status: { $in: ['draft', 'pending_approval'] }
      }
    });

    if (pendingExtension) {
      throw new Error('Une extension est déjà en attente pour cette mission');
    }

    // Calculer le budget additionnel si extension de durée
    let additionalBudget = 0;
    if (data.new_end_date && data.additional_days) {
      const rate = data.new_daily_rate || mission.daily_rate;
      additionalBudget = calculateBudget(rate, data.additional_days);
    } else if (data.new_daily_rate && data.new_daily_rate !== mission.daily_rate) {
      // Calculer la différence de tarif pour les jours restants
      const remainingDays = mission.estimated_days - (mission.actual_days || 0);
      const rateDiff = data.new_daily_rate - mission.daily_rate;
      additionalBudget = rateDiff * remainingDays;
    }

    const extension = await extensionCollection.repository.create({
      values: {
        ...data,
        status: ExtensionStatus.DRAFT,
        original_end_date: mission.end_date,
        original_daily_rate: mission.daily_rate,
        additional_budget: additionalBudget,
        requested_by_id: userId,
        requested_at: new Date()
      }
    });

    return extension;
  }

  /**
   * Soumettre pour approbation
   */
  async submitForApproval(extensionId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    const extension = await collection.repository.findOne({
      filter: { id: extensionId }
    });

    if (!extension) {
      throw new Error('Extension non trouvée');
    }

    this.validateStatusTransition(extension.status, ExtensionStatus.PENDING_APPROVAL);

    const updated = await collection.repository.update({
      filter: { id: extensionId },
      values: { status: ExtensionStatus.PENDING_APPROVAL }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.EXTENSION_REQUESTED, { extension: updated[0] });
    }

    return updated[0];
  }

  /**
   * Approuver une extension
   */
  async approveExtension(extensionId: string, approverId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    const extension = await collection.repository.findOne({
      filter: { id: extensionId }
    });

    if (!extension) {
      throw new Error('Extension non trouvée');
    }

    this.validateStatusTransition(extension.status, ExtensionStatus.APPROVED);

    const updated = await collection.repository.update({
      filter: { id: extensionId },
      values: {
        status: ExtensionStatus.APPROVED,
        approved_by_id: approverId,
        approved_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.EXTENSION_APPROVED, {
        extension: updated[0],
        approverId
      });
    }

    return updated[0];
  }

  /**
   * Rejeter une extension
   */
  async rejectExtension(extensionId: string, approverId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    const extension = await collection.repository.findOne({
      filter: { id: extensionId }
    });

    if (!extension) {
      throw new Error('Extension non trouvée');
    }

    this.validateStatusTransition(extension.status, ExtensionStatus.REJECTED);

    const updated = await collection.repository.update({
      filter: { id: extensionId },
      values: {
        status: ExtensionStatus.REJECTED,
        approved_by_id: approverId,
        approved_at: new Date(),
        rejection_reason: reason
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.EXTENSION_REJECTED, {
        extension: updated[0],
        reason,
        approverId
      });
    }

    return updated[0];
  }

  /**
   * Appliquer une extension approuvée
   */
  async applyExtension(extensionId: string, userId: string): Promise<any> {
    const extensionCollection = this.db.getCollection(COLLECTIONS.EXTENSIONS);
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);

    const extension = await extensionCollection.repository.findOne({
      filter: { id: extensionId }
    });

    if (!extension) {
      throw new Error('Extension non trouvée');
    }

    if (extension.status !== ExtensionStatus.APPROVED) {
      throw new Error('L\'extension doit être approuvée avant d\'être appliquée');
    }

    // Récupérer la mission
    const mission = await missionCollection.repository.findOne({
      filter: { id: extension.mission_id }
    });

    // Construire les mises à jour de la mission
    const missionUpdates: any = {};

    if (extension.new_end_date) {
      missionUpdates.end_date = extension.new_end_date;
    }

    if (extension.additional_days) {
      missionUpdates.estimated_days = mission.estimated_days + extension.additional_days;
    }

    if (extension.new_daily_rate) {
      missionUpdates.daily_rate = extension.new_daily_rate;
    }

    // Recalculer le budget total
    const newEstimatedDays = missionUpdates.estimated_days || mission.estimated_days;
    const newDailyRate = missionUpdates.daily_rate || mission.daily_rate;
    missionUpdates.budget_total = calculateBudget(newDailyRate, newEstimatedDays);

    // Mettre à jour la mission
    await missionCollection.repository.update({
      filter: { id: mission.id },
      values: missionUpdates
    });

    // Marquer l'extension comme appliquée
    const updated = await extensionCollection.repository.update({
      filter: { id: extensionId },
      values: {
        status: ExtensionStatus.APPLIED,
        applied_at: new Date()
      }
    });

    // Ajouter à l'historique
    await this.addMissionHistory(
      mission.id,
      userId,
      'extended',
      `Extension appliquée: ${extension.type}`
    );

    return updated[0];
  }

  /**
   * Obtenir les extensions d'une mission
   */
  async getExtensionsByMission(missionId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    return collection.repository.find({
      filter: { mission_id: missionId },
      appends: ['requested_by', 'approved_by'],
      sort: ['-created_at']
    });
  }

  /**
   * Obtenir les extensions en attente d'approbation
   */
  async getPendingApprovals(approverId?: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.EXTENSIONS);

    return collection.repository.find({
      filter: { status: ExtensionStatus.PENDING_APPROVAL },
      appends: ['mission', 'requested_by'],
      sort: ['requested_at']
    });
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: ExtensionStatus, newStatus: ExtensionStatus): void {
    const allowedTransitions = EXTENSION_STATUS_TRANSITIONS[currentStatus];
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
