// =============================================================================
// PRESTAGO - Plugin Timesheets - Service: Gestion des CRA
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  STATUS_TRANSITIONS,
  DEFAULTS,
  generateTimesheetReference,
  getMonthBounds,
  calculateTimesheetAmount,
  STATUS_TO_LEVEL,
  LEVEL_TO_NEXT_STATUS
} from '../../shared/constants';
import {
  TimesheetStatus,
  TimesheetPeriod,
  DayType,
  ApprovalLevel,
  ApprovalDecision,
  TIMESHEET_EVENTS
} from '../../shared/types';

export class TimesheetService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer un nouveau CRA
   */
  async createTimesheet(data: {
    mission_id: string;
    period_type?: TimesheetPeriod;
    year: number;
    month: number;
    week_number?: number;
  }, consultantId: string): Promise<any> {
    const missionCollection = this.db.getCollection('prestago_missions');
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    // Vérifier la mission
    const mission = await missionCollection.repository.findOne({
      filter: { id: data.mission_id }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    if (mission.consultant_id !== consultantId) {
      throw new Error('Vous n\'êtes pas le consultant de cette mission');
    }

    // Vérifier qu'un CRA n'existe pas déjà pour cette période
    const existing = await timesheetCollection.repository.findOne({
      filter: {
        mission_id: data.mission_id,
        consultant_id: consultantId,
        year: data.year,
        month: data.month
      }
    });

    if (existing) {
      throw new Error('Un CRA existe déjà pour cette période');
    }

    // Calculer les dates de la période
    const { start, end } = getMonthBounds(data.year, data.month);

    // Générer la référence
    const consultantCode = consultantId.substring(0, 4).toUpperCase();
    const reference = generateTimesheetReference(consultantCode, data.year, data.month);

    // Créer le CRA
    const timesheet = await timesheetCollection.repository.create({
      values: {
        reference,
        mission_id: data.mission_id,
        consultant_id: consultantId,
        period_type: data.period_type || DEFAULTS.PERIOD_TYPE,
        period_start: start,
        period_end: end,
        year: data.year,
        month: data.month,
        week_number: data.week_number,
        status: TimesheetStatus.DRAFT,
        required_approval_levels: mission.timesheet_approval_levels || DEFAULTS.APPROVAL_LEVELS,
        created_by_id: consultantId
      }
    });

    // Créer les entrées pour chaque jour du mois
    await this.generateDailyEntries(timesheet.id, start, end);

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.TIMESHEET_CREATED, { timesheet, consultantId });
    }

    return timesheet;
  }

  /**
   * Générer les entrées journalières
   */
  private async generateDailyEntries(timesheetId: string, start: Date, end: Date): Promise<void> {
    const entryCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_ENTRIES);
    const holidayCollection = this.db.getCollection(COLLECTIONS.HOLIDAYS);

    // Récupérer les jours fériés
    const holidays = await holidayCollection.repository.find({
      filter: {
        date: { $gte: start, $lte: end },
        country: 'FR'
      }
    });
    const holidayDates = new Set(holidays.map((h: any) => h.date.toISOString().split('T')[0]));

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      let dayType = DayType.WORKED;
      let dayFraction = 1;

      // Week-end
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayType = DayType.WEEKEND;
        dayFraction = 0;
      }
      // Jour férié
      else if (holidayDates.has(dateStr)) {
        dayType = DayType.HOLIDAY;
        dayFraction = 0;
      }

      await entryCollection.repository.create({
        values: {
          timesheet_id: timesheetId,
          date: new Date(current),
          day_of_week: dayOfWeek,
          day_type: dayType,
          hours_worked: dayFraction * DEFAULTS.HOURS_PER_DAY,
          day_fraction: dayFraction,
          is_billable: dayFraction > 0,
          billable_hours: dayFraction * DEFAULTS.HOURS_PER_DAY,
          billable_day_fraction: dayFraction
        }
      });

      current.setDate(current.getDate() + 1);
    }
  }

  /**
   * Mettre à jour une entrée journalière
   */
  async updateEntry(entryId: string, data: {
    day_type?: DayType;
    hours_worked?: number;
    day_fraction?: number;
    work_location?: 'onsite' | 'remote' | 'travel';
    description?: string;
    task_reference?: string;
    is_billable?: boolean;
    overtime_hours?: number;
  }, userId: string): Promise<any> {
    const entryCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_ENTRIES);
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    const entry = await entryCollection.repository.findOne({
      filter: { id: entryId },
      appends: ['timesheet']
    });

    if (!entry) {
      throw new Error('Entrée non trouvée');
    }

    // Vérifier que le CRA est en brouillon
    if (entry.timesheet.status !== TimesheetStatus.DRAFT &&
        entry.timesheet.status !== TimesheetStatus.REVISION_REQUESTED) {
      throw new Error('Le CRA ne peut plus être modifié');
    }

    // Calculer les valeurs facturables
    const hoursWorked = data.hours_worked ?? entry.hours_worked;
    const dayFraction = data.day_fraction ?? entry.day_fraction;
    const isBillable = data.is_billable ?? entry.is_billable;

    const updated = await entryCollection.repository.update({
      filter: { id: entryId },
      values: {
        ...data,
        billable_hours: isBillable ? hoursWorked : 0,
        billable_day_fraction: isBillable ? dayFraction : 0
      }
    });

    // Recalculer les totaux du CRA
    await this.recalculateTotals(entry.timesheet_id);

    return updated[0];
  }

  /**
   * Recalculer les totaux d'un CRA
   */
  async recalculateTotals(timesheetId: string): Promise<any> {
    const entryCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_ENTRIES);
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);
    const missionCollection = this.db.getCollection('prestago_missions');

    const entries = await entryCollection.repository.find({
      filter: { timesheet_id: timesheetId }
    });

    const timesheet = await timesheetCollection.repository.findOne({
      filter: { id: timesheetId }
    });

    const mission = await missionCollection.repository.findOne({
      filter: { id: timesheet.mission_id }
    });

    let totalWorkedDays = 0;
    let totalWorkedHours = 0;
    let totalBillableDays = 0;
    let totalBillableHours = 0;
    let totalAbsenceDays = 0;
    let totalOvertimeHours = 0;

    for (const entry of entries) {
      totalWorkedDays += entry.day_fraction || 0;
      totalWorkedHours += entry.hours_worked || 0;
      totalBillableDays += entry.billable_day_fraction || 0;
      totalBillableHours += entry.billable_hours || 0;
      totalOvertimeHours += entry.overtime_hours || 0;

      // Compter les absences
      if ([DayType.VACATION, DayType.SICK_LEAVE, DayType.RTT, DayType.UNPAID_LEAVE].includes(entry.day_type)) {
        totalAbsenceDays += entry.day_fraction || 0;
      }
    }

    // Calculer le montant total
    const totalAmount = calculateTimesheetAmount(totalBillableDays, mission.daily_rate || 0);

    const updated = await timesheetCollection.repository.update({
      filter: { id: timesheetId },
      values: {
        total_worked_days: totalWorkedDays,
        total_worked_hours: totalWorkedHours,
        total_billable_days: totalBillableDays,
        total_billable_hours: totalBillableHours,
        total_absence_days: totalAbsenceDays,
        total_overtime_hours: totalOvertimeHours,
        total_amount: totalAmount
      }
    });

    return updated[0];
  }

  /**
   * Soumettre un CRA pour approbation
   */
  async submitTimesheet(timesheetId: string, userId: string, comments?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    const timesheet = await collection.repository.findOne({
      filter: { id: timesheetId }
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    if (timesheet.consultant_id !== userId) {
      throw new Error('Vous ne pouvez soumettre que vos propres CRA');
    }

    this.validateStatusTransition(timesheet.status, TimesheetStatus.SUBMITTED);

    // Recalculer les totaux avant soumission
    await this.recalculateTotals(timesheetId);

    const updated = await collection.repository.update({
      filter: { id: timesheetId },
      values: {
        status: TimesheetStatus.PENDING_LEVEL_1,
        current_approval_level: 1,
        submitted_at: new Date(),
        consultant_comments: comments
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.TIMESHEET_SUBMITTED, { timesheet: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Approuver un CRA (pour un niveau donné)
   */
  async approveTimesheet(timesheetId: string, approverId: string, comments?: string): Promise<any> {
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);
    const approvalCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_APPROVALS);

    const timesheet = await timesheetCollection.repository.findOne({
      filter: { id: timesheetId }
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    const currentLevel = STATUS_TO_LEVEL[timesheet.status];
    if (!currentLevel) {
      throw new Error('Le CRA n\'est pas en attente d\'approbation');
    }

    // Créer l'entrée d'approbation
    await approvalCollection.repository.create({
      values: {
        timesheet_id: timesheetId,
        level: currentLevel,
        approver_id: approverId,
        decision: ApprovalDecision.APPROVED,
        comments,
        decided_at: new Date()
      }
    });

    // Déterminer le statut suivant
    let nextStatus: TimesheetStatus;
    if (currentLevel >= timesheet.required_approval_levels) {
      nextStatus = TimesheetStatus.APPROVED;
    } else {
      nextStatus = LEVEL_TO_NEXT_STATUS[currentLevel];
    }

    const updated = await timesheetCollection.repository.update({
      filter: { id: timesheetId },
      values: {
        status: nextStatus,
        current_approval_level: currentLevel + 1,
        approved_at: nextStatus === TimesheetStatus.APPROVED ? new Date() : null
      }
    });

    // Émettre l'événement approprié
    if (this.eventEmitter) {
      const eventName = nextStatus === TimesheetStatus.APPROVED
        ? TIMESHEET_EVENTS.TIMESHEET_APPROVED
        : `timesheet.level${currentLevel}.approved`;
      this.eventEmitter.emit(eventName, { timesheet: updated[0], approverId, level: currentLevel });
    }

    // Si approuvé, mettre à jour les jours travaillés de la mission
    if (nextStatus === TimesheetStatus.APPROVED) {
      await this.updateMissionProgress(timesheet.mission_id, timesheet.total_billable_days);
    }

    return updated[0];
  }

  /**
   * Rejeter un CRA
   */
  async rejectTimesheet(timesheetId: string, approverId: string, reason: string): Promise<any> {
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);
    const approvalCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_APPROVALS);

    const timesheet = await timesheetCollection.repository.findOne({
      filter: { id: timesheetId }
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    const currentLevel = STATUS_TO_LEVEL[timesheet.status];
    if (!currentLevel) {
      throw new Error('Le CRA n\'est pas en attente d\'approbation');
    }

    // Créer l'entrée de rejet
    await approvalCollection.repository.create({
      values: {
        timesheet_id: timesheetId,
        level: currentLevel,
        approver_id: approverId,
        decision: ApprovalDecision.REJECTED,
        comments: reason,
        decided_at: new Date()
      }
    });

    const updated = await timesheetCollection.repository.update({
      filter: { id: timesheetId },
      values: {
        status: TimesheetStatus.REJECTED,
        rejection_reason: reason
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.TIMESHEET_REJECTED, {
        timesheet: updated[0],
        approverId,
        reason,
        level: currentLevel
      });
    }

    return updated[0];
  }

  /**
   * Demander une révision
   */
  async requestRevision(timesheetId: string, approverId: string, notes: string): Promise<any> {
    const timesheetCollection = this.db.getCollection(COLLECTIONS.TIMESHEETS);
    const approvalCollection = this.db.getCollection(COLLECTIONS.TIMESHEET_APPROVALS);

    const timesheet = await timesheetCollection.repository.findOne({
      filter: { id: timesheetId }
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    const currentLevel = STATUS_TO_LEVEL[timesheet.status];
    if (!currentLevel) {
      throw new Error('Le CRA n\'est pas en attente d\'approbation');
    }

    // Créer l'entrée de demande de révision
    await approvalCollection.repository.create({
      values: {
        timesheet_id: timesheetId,
        level: currentLevel,
        approver_id: approverId,
        decision: ApprovalDecision.REVISION_REQUESTED,
        comments: notes,
        decided_at: new Date()
      }
    });

    const updated = await timesheetCollection.repository.update({
      filter: { id: timesheetId },
      values: {
        status: TimesheetStatus.REVISION_REQUESTED,
        revision_notes: notes
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(TIMESHEET_EVENTS.TIMESHEET_REVISION_REQUESTED, {
        timesheet: updated[0],
        approverId,
        notes,
        level: currentLevel
      });
    }

    return updated[0];
  }

  /**
   * Remettre un CRA en brouillon (après rejet ou révision)
   */
  async resetToDraft(timesheetId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    const timesheet = await collection.repository.findOne({
      filter: { id: timesheetId }
    });

    if (!timesheet) {
      throw new Error('CRA non trouvé');
    }

    if (timesheet.consultant_id !== userId) {
      throw new Error('Seul le consultant peut remettre le CRA en brouillon');
    }

    if (![TimesheetStatus.REJECTED, TimesheetStatus.REVISION_REQUESTED].includes(timesheet.status as TimesheetStatus)) {
      throw new Error('Le CRA doit être rejeté ou en révision pour être remis en brouillon');
    }

    const updated = await collection.repository.update({
      filter: { id: timesheetId },
      values: {
        status: TimesheetStatus.DRAFT,
        current_approval_level: 0
      }
    });

    return updated[0];
  }

  /**
   * Obtenir un CRA par ID
   */
  async getTimesheetById(timesheetId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    return collection.repository.findOne({
      filter: { id: timesheetId },
      appends: ['mission', 'consultant', 'entries', 'approvals']
    });
  }

  /**
   * Obtenir les CRA d'un consultant
   */
  async getTimesheetsByConsultant(consultantId: string, year?: number): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    const filter: any = { consultant_id: consultantId };
    if (year) {
      filter.year = year;
    }

    return collection.repository.find({
      filter,
      appends: ['mission'],
      sort: ['-year', '-month']
    });
  }

  /**
   * Obtenir les CRA en attente d'approbation
   */
  async getPendingApprovals(approverId: string, level?: ApprovalLevel): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.TIMESHEETS);

    const statusFilter = level
      ? `pending_level_${level}`
      : { $in: ['pending_level_1', 'pending_level_2', 'pending_level_3'] };

    return collection.repository.find({
      filter: { status: statusFilter },
      appends: ['consultant', 'mission'],
      sort: ['submitted_at']
    });
  }

  /**
   * Mettre à jour la progression de la mission
   */
  private async updateMissionProgress(missionId: string, billableDays: number): Promise<void> {
    const missionCollection = this.db.getCollection('prestago_missions');

    const mission = await missionCollection.repository.findOne({
      filter: { id: missionId }
    });

    if (mission) {
      const newActualDays = (mission.actual_days || 0) + billableDays;
      const newBudgetConsumed = newActualDays * mission.daily_rate;

      await missionCollection.repository.update({
        filter: { id: missionId },
        values: {
          actual_days: newActualDays,
          budget_consumed: newBudgetConsumed
        }
      });
    }
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: TimesheetStatus, newStatus: TimesheetStatus): void {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }
}
