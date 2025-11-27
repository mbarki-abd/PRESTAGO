// =============================================================================
// PRESTAGO - Plugin Timesheets - Service: Gestion des absences
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, ABSENCE_STATUS_TRANSITIONS, calculateWorkingDays } from '../../shared/constants';
import { AbsenceStatus, AbsenceType, TIMESHEET_EVENTS } from '../../shared/types';

export class AbsenceService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer une demande d'absence
   */
  async createAbsenceRequest(data: {
    mission_id?: string;
    type: AbsenceType;
    start_date: Date;
    end_date: Date;
    start_half_day?: 'full' | 'morning' | 'afternoon';
    end_half_day?: 'full' | 'morning' | 'afternoon';
    reason?: string;
    attachments?: any[];
  }, consultantId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);
    const holidayCollection = this.db.getCollection(COLLECTIONS.HOLIDAYS);

    // Récupérer les jours fériés pour le calcul
    const holidays = await holidayCollection.repository.find({
      filter: {
        date: { $gte: data.start_date, $lte: data.end_date },
        country: 'FR'
      }
    });
    const holidayDates = holidays.map((h: any) => new Date(h.date));

    // Calculer le nombre de jours d'absence
    let totalDays = calculateWorkingDays(
      new Date(data.start_date),
      new Date(data.end_date),
      holidayDates
    );

    // Ajuster pour les demi-journées
    if (data.start_half_day === 'afternoon') {
      totalDays -= 0.5;
    }
    if (data.end_half_day === 'morning') {
      totalDays -= 0.5;
    }

    // Vérifier les chevauchements
    const overlapping = await collection.repository.findOne({
      filter: {
        consultant_id: consultantId,
        status: { $ne: AbsenceStatus.CANCELLED },
        $or: [
          { start_date: { $lte: data.end_date }, end_date: { $gte: data.start_date } }
        ]
      }
    });

    if (overlapping) {
      throw new Error('Une absence existe déjà pour cette période');
    }

    const absence = await collection.repository.create({
      values: {
        consultant_id: consultantId,
        mission_id: data.mission_id,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        start_half_day: data.start_half_day || 'full',
        end_half_day: data.end_half_day || 'full',
        total_days: totalDays,
        reason: data.reason,
        status: AbsenceStatus.DRAFT,
        attachments: data.attachments || []
      }
    });

    return absence;
  }

  /**
   * Soumettre une demande d'absence
   */
  async submitAbsenceRequest(absenceId: string, consultantId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    const absence = await collection.repository.findOne({
      filter: { id: absenceId }
    });

    if (!absence) {
      throw new Error('Demande d\'absence non trouvée');
    }

    if (absence.consultant_id !== consultantId) {
      throw new Error('Vous ne pouvez soumettre que vos propres demandes');
    }

    this.validateStatusTransition(absence.status, AbsenceStatus.PENDING);

    const updated = await collection.repository.update({
      filter: { id: absenceId },
      values: { status: AbsenceStatus.PENDING }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.ABSENCE_REQUESTED, {
        absence: updated[0],
        consultantId
      });
    }

    return updated[0];
  }

  /**
   * Approuver une demande d'absence
   */
  async approveAbsence(absenceId: string, approverId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    const absence = await collection.repository.findOne({
      filter: { id: absenceId }
    });

    if (!absence) {
      throw new Error('Demande d\'absence non trouvée');
    }

    this.validateStatusTransition(absence.status, AbsenceStatus.APPROVED);

    const updated = await collection.repository.update({
      filter: { id: absenceId },
      values: {
        status: AbsenceStatus.APPROVED,
        approved_by_id: approverId,
        approved_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.ABSENCE_APPROVED, {
        absence: updated[0],
        approverId
      });
    }

    return updated[0];
  }

  /**
   * Rejeter une demande d'absence
   */
  async rejectAbsence(absenceId: string, approverId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    const absence = await collection.repository.findOne({
      filter: { id: absenceId }
    });

    if (!absence) {
      throw new Error('Demande d\'absence non trouvée');
    }

    this.validateStatusTransition(absence.status, AbsenceStatus.REJECTED);

    const updated = await collection.repository.update({
      filter: { id: absenceId },
      values: {
        status: AbsenceStatus.REJECTED,
        approved_by_id: approverId,
        approved_at: new Date(),
        rejection_reason: reason
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.ABSENCE_REJECTED, {
        absence: updated[0],
        approverId,
        reason
      });
    }

    return updated[0];
  }

  /**
   * Annuler une demande d'absence
   */
  async cancelAbsence(absenceId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    const absence = await collection.repository.findOne({
      filter: { id: absenceId }
    });

    if (!absence) {
      throw new Error('Demande d\'absence non trouvée');
    }

    this.validateStatusTransition(absence.status, AbsenceStatus.CANCELLED);

    const updated = await collection.repository.update({
      filter: { id: absenceId },
      values: { status: AbsenceStatus.CANCELLED }
    });

    return updated[0];
  }

  /**
   * Obtenir les absences d'un consultant
   */
  async getAbsencesByConsultant(
    consultantId: string,
    year?: number,
    status?: AbsenceStatus[]
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    const filter: any = { consultant_id: consultantId };

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      filter.start_date = { $gte: startOfYear, $lte: endOfYear };
    }

    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    return collection.repository.find({
      filter,
      appends: ['mission', 'approved_by'],
      sort: ['-start_date']
    });
  }

  /**
   * Obtenir les demandes d'absence en attente
   */
  async getPendingAbsences(managerId?: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.ABSENCES);

    return collection.repository.find({
      filter: { status: AbsenceStatus.PENDING },
      appends: ['consultant', 'mission'],
      sort: ['start_date']
    });
  }

  /**
   * Obtenir le solde de congés d'un consultant
   */
  async getLeaveBalance(consultantId: string, year: number): Promise<any> {
    const absences = await this.getAbsencesByConsultant(
      consultantId,
      year,
      [AbsenceStatus.APPROVED]
    );

    const balance: Record<AbsenceType, { used: number; pending: number }> = {
      [AbsenceType.VACATION]: { used: 0, pending: 0 },
      [AbsenceType.SICK_LEAVE]: { used: 0, pending: 0 },
      [AbsenceType.RTT]: { used: 0, pending: 0 },
      [AbsenceType.UNPAID_LEAVE]: { used: 0, pending: 0 },
      [AbsenceType.MATERNITY]: { used: 0, pending: 0 },
      [AbsenceType.PATERNITY]: { used: 0, pending: 0 },
      [AbsenceType.FAMILY_EVENT]: { used: 0, pending: 0 },
      [AbsenceType.TRAINING]: { used: 0, pending: 0 },
      [AbsenceType.OTHER]: { used: 0, pending: 0 }
    };

    for (const absence of absences) {
      if (balance[absence.type as AbsenceType]) {
        if (absence.status === AbsenceStatus.APPROVED) {
          balance[absence.type as AbsenceType].used += absence.total_days;
        } else if (absence.status === AbsenceStatus.PENDING) {
          balance[absence.type as AbsenceType].pending += absence.total_days;
        }
      }
    }

    return balance;
  }

  /**
   * Synchroniser les absences avec les entrées de CRA
   */
  async syncWithTimesheet(absenceId: string): Promise<void> {
    const absenceCollection = this.db.getCollection(COLLECTIONS.ABSENCES);
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);
    const entryCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_ENTRIES);

    const absence = await absenceCollection.repository.findOne({
      filter: { id: absenceId }
    });

    if (!absence || absence.status !== AbsenceStatus.APPROVED) {
      return;
    }

    // Trouver les CRA concernés
    const timesheets = await timesheetCollection.repository.find({
      filter: {
        consultant_id: absence.consultant_id,
        period_start: { $lte: absence.end_date },
        period_end: { $gte: absence.start_date },
        status: 'draft'
      }
    });

    // Mapper le type d'absence au type de jour
    const dayTypeMap: Record<AbsenceType, string> = {
      [AbsenceType.VACATION]: 'vacation',
      [AbsenceType.SICK_LEAVE]: 'sick_leave',
      [AbsenceType.RTT]: 'rtt',
      [AbsenceType.UNPAID_LEAVE]: 'unpaid',
      [AbsenceType.MATERNITY]: 'vacation',
      [AbsenceType.PATERNITY]: 'vacation',
      [AbsenceType.FAMILY_EVENT]: 'vacation',
      [AbsenceType.TRAINING]: 'training',
      [AbsenceType.OTHER]: 'other'
    };

    const dayType = dayTypeMap[absence.type as AbsenceType] || 'other';

    // Mettre à jour les entrées concernées
    for (const timesheet of timesheets) {
      await entryCollection.repository.update({
        filter: {
          timesheet_id: timesheet.id,
          date: { $gte: absence.start_date, $lte: absence.end_date },
          day_type: 'worked'
        },
        values: {
          day_type: dayType,
          is_billable: false,
          billable_hours: 0,
          billable_day_fraction: 0
        }
      });
    }
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: AbsenceStatus, newStatus: AbsenceStatus): void {
    const allowedTransitions = ABSENCE_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }
}
