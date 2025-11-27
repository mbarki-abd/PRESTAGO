// =============================================================================
// PRESTAGO - Plugin Timesheets - Types et Énumérations
// =============================================================================

/**
 * Périodes de CRA
 */
export enum TimesheetPeriod {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly'
}

/**
 * Statuts de CRA
 */
export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING_LEVEL_1 = 'pending_level_1',   // En attente approbation niveau 1
  PENDING_LEVEL_2 = 'pending_level_2',   // En attente approbation niveau 2
  PENDING_LEVEL_3 = 'pending_level_3',   // En attente approbation niveau 3
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested'
}

/**
 * Types de jours
 */
export enum DayType {
  WORKED = 'worked',           // Jour travaillé
  WEEKEND = 'weekend',         // Week-end
  HOLIDAY = 'holiday',         // Jour férié
  VACATION = 'vacation',       // Congé payé
  SICK_LEAVE = 'sick_leave',   // Arrêt maladie
  RTT = 'rtt',                 // RTT
  UNPAID_LEAVE = 'unpaid',     // Congé sans solde
  REMOTE = 'remote',           // Télétravail
  ONSITE = 'onsite',           // Sur site
  TRAINING = 'training',       // Formation
  OTHER = 'other'
}

/**
 * Types d'absences
 */
export enum AbsenceType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  RTT = 'rtt',
  UNPAID_LEAVE = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  FAMILY_EVENT = 'family_event',
  TRAINING = 'training',
  OTHER = 'other'
}

/**
 * Statuts de demande d'absence
 */
export enum AbsenceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

/**
 * Niveaux d'approbation
 */
export enum ApprovalLevel {
  LEVEL_1 = 1,  // Manager direct / Chef de projet
  LEVEL_2 = 2,  // Manager client
  LEVEL_3 = 3   // Administrateur / Finance
}

/**
 * Décisions d'approbation
 */
export enum ApprovalDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested'
}

/**
 * Événements de CRA
 */
export const TIMESHEET_EVENTS = {
  // Lifecycle
  TIMESHEET_CREATED: 'timesheet.created',
  TIMESHEET_SUBMITTED: 'timesheet.submitted',
  TIMESHEET_APPROVED: 'timesheet.approved',
  TIMESHEET_REJECTED: 'timesheet.rejected',
  TIMESHEET_REVISION_REQUESTED: 'timesheet.revision_requested',

  // Niveaux d'approbation
  LEVEL_1_APPROVED: 'timesheet.level1.approved',
  LEVEL_1_REJECTED: 'timesheet.level1.rejected',
  LEVEL_2_APPROVED: 'timesheet.level2.approved',
  LEVEL_2_REJECTED: 'timesheet.level2.rejected',
  LEVEL_3_APPROVED: 'timesheet.level3.approved',
  LEVEL_3_REJECTED: 'timesheet.level3.rejected',

  // Absences
  ABSENCE_REQUESTED: 'timesheet.absence.requested',
  ABSENCE_APPROVED: 'timesheet.absence.approved',
  ABSENCE_REJECTED: 'timesheet.absence.rejected',

  // Rappels
  SUBMISSION_REMINDER: 'timesheet.reminder.submission',
  APPROVAL_REMINDER: 'timesheet.reminder.approval'
} as const;

/**
 * Interface CRA
 */
export interface ITimesheet {
  id: string;
  reference: string;
  mission_id: string;
  consultant_id: string;

  // Période
  period_type: TimesheetPeriod;
  period_start: Date;
  period_end: Date;
  year: number;
  month: number;
  week_number?: number;

  // Totaux
  total_worked_days: number;
  total_worked_hours: number;
  total_billable_days: number;
  total_billable_hours: number;
  total_absence_days: number;
  total_amount: number;

  // Statut
  status: TimesheetStatus;
  current_approval_level: number;
  required_approval_levels: number;

  // Dates
  submitted_at?: Date;
  approved_at?: Date;

  // Métadonnées
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface entrée journalière
 */
export interface ITimesheetEntry {
  id: string;
  timesheet_id: string;
  date: Date;
  day_type: DayType;

  // Temps
  hours_worked: number;
  day_fraction: number;  // 0, 0.25, 0.5, 0.75, 1

  // Détails
  work_location: 'onsite' | 'remote';
  description?: string;
  task_reference?: string;

  // Facturable
  is_billable: boolean;
  billable_hours: number;
  billable_day_fraction: number;

  // Heures supplémentaires
  overtime_hours: number;
  overtime_approved: boolean;
}

/**
 * Interface approbation
 */
export interface ITimesheetApproval {
  id: string;
  timesheet_id: string;
  level: ApprovalLevel;
  approver_id: string;
  decision: ApprovalDecision;
  comments?: string;
  decided_at: Date;
}

/**
 * Interface absence
 */
export interface IAbsence {
  id: string;
  consultant_id: string;
  type: AbsenceType;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason?: string;
  status: AbsenceStatus;
  approved_by_id?: string;
  approved_at?: Date;
}

/**
 * Interface jour férié
 */
export interface IHoliday {
  id: string;
  name: string;
  date: Date;
  country: string;
  is_regional: boolean;
  regions?: string[];
}
