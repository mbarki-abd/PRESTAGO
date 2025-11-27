// =============================================================================
// PRESTAGO - Plugin Timesheets - Constantes
// =============================================================================

import { TimesheetStatus, AbsenceStatus, ApprovalLevel } from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  TIMESHEETS: 'prestago_timesheets',
  TIMESHEET_ENTRIES: 'prestago_timesheet_entries',
  TIMESHEET_APPROVALS: 'prestago_timesheet_approvals',
  ABSENCES: 'prestago_absences',
  HOLIDAYS: 'prestago_holidays',
  TIMESHEET_TEMPLATES: 'prestago_timesheet_templates'
};

/**
 * Transitions de statut CRA
 */
export const STATUS_TRANSITIONS: Record<TimesheetStatus, TimesheetStatus[]> = {
  [TimesheetStatus.DRAFT]: [TimesheetStatus.SUBMITTED],
  [TimesheetStatus.SUBMITTED]: [TimesheetStatus.PENDING_LEVEL_1],
  [TimesheetStatus.PENDING_LEVEL_1]: [
    TimesheetStatus.PENDING_LEVEL_2,
    TimesheetStatus.APPROVED,
    TimesheetStatus.REJECTED,
    TimesheetStatus.REVISION_REQUESTED
  ],
  [TimesheetStatus.PENDING_LEVEL_2]: [
    TimesheetStatus.PENDING_LEVEL_3,
    TimesheetStatus.APPROVED,
    TimesheetStatus.REJECTED,
    TimesheetStatus.REVISION_REQUESTED
  ],
  [TimesheetStatus.PENDING_LEVEL_3]: [
    TimesheetStatus.APPROVED,
    TimesheetStatus.REJECTED,
    TimesheetStatus.REVISION_REQUESTED
  ],
  [TimesheetStatus.APPROVED]: [],
  [TimesheetStatus.REJECTED]: [TimesheetStatus.DRAFT],
  [TimesheetStatus.REVISION_REQUESTED]: [TimesheetStatus.DRAFT]
};

/**
 * Transitions de statut absence
 */
export const ABSENCE_STATUS_TRANSITIONS: Record<AbsenceStatus, AbsenceStatus[]> = {
  [AbsenceStatus.DRAFT]: [AbsenceStatus.PENDING, AbsenceStatus.CANCELLED],
  [AbsenceStatus.PENDING]: [AbsenceStatus.APPROVED, AbsenceStatus.REJECTED, AbsenceStatus.CANCELLED],
  [AbsenceStatus.APPROVED]: [AbsenceStatus.CANCELLED],
  [AbsenceStatus.REJECTED]: [AbsenceStatus.DRAFT],
  [AbsenceStatus.CANCELLED]: []
};

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  PERIOD_TYPE: 'monthly',
  HOURS_PER_DAY: 8,
  DAYS_PER_WEEK: 5,
  APPROVAL_LEVELS: 2,
  SUBMISSION_DEADLINE_DAY: 5,  // 5ème jour du mois suivant
  REMINDER_DAYS_BEFORE: 3
};

/**
 * Règles de validation
 */
export const VALIDATION = {
  TIMESHEET: {
    MAX_HOURS_PER_DAY: 24,
    MAX_WORKED_HOURS_PER_DAY: 12,
    MAX_DAY_FRACTION: 1,
    MIN_DAY_FRACTION: 0
  },
  ABSENCE: {
    MIN_DAYS: 0.5,
    MAX_DAYS_PER_REQUEST: 30,
    ADVANCE_NOTICE_DAYS: 7
  }
};

/**
 * Jours fériés français (liste de base)
 */
export const FRENCH_HOLIDAYS = [
  { name: 'Jour de l\'An', month: 1, day: 1 },
  { name: 'Fête du Travail', month: 5, day: 1 },
  { name: 'Victoire 1945', month: 5, day: 8 },
  { name: 'Fête Nationale', month: 7, day: 14 },
  { name: 'Assomption', month: 8, day: 15 },
  { name: 'Toussaint', month: 11, day: 1 },
  { name: 'Armistice', month: 11, day: 11 },
  { name: 'Noël', month: 12, day: 25 }
];

/**
 * Mapping status vers niveau d'approbation
 */
export const STATUS_TO_LEVEL: Record<string, ApprovalLevel> = {
  [TimesheetStatus.PENDING_LEVEL_1]: ApprovalLevel.LEVEL_1,
  [TimesheetStatus.PENDING_LEVEL_2]: ApprovalLevel.LEVEL_2,
  [TimesheetStatus.PENDING_LEVEL_3]: ApprovalLevel.LEVEL_3
};

/**
 * Mapping niveau vers statut suivant
 */
export const LEVEL_TO_NEXT_STATUS: Record<ApprovalLevel, TimesheetStatus> = {
  [ApprovalLevel.LEVEL_1]: TimesheetStatus.PENDING_LEVEL_2,
  [ApprovalLevel.LEVEL_2]: TimesheetStatus.PENDING_LEVEL_3,
  [ApprovalLevel.LEVEL_3]: TimesheetStatus.APPROVED
};

/**
 * Couleurs de statut pour l'UI
 */
export const STATUS_COLORS = {
  [TimesheetStatus.DRAFT]: 'default',
  [TimesheetStatus.SUBMITTED]: 'processing',
  [TimesheetStatus.PENDING_LEVEL_1]: 'warning',
  [TimesheetStatus.PENDING_LEVEL_2]: 'warning',
  [TimesheetStatus.PENDING_LEVEL_3]: 'warning',
  [TimesheetStatus.APPROVED]: 'success',
  [TimesheetStatus.REJECTED]: 'error',
  [TimesheetStatus.REVISION_REQUESTED]: 'warning'
};

/**
 * Générer la référence d'un CRA
 */
export function generateTimesheetReference(
  consultantCode: string,
  year: number,
  month: number,
  week?: number
): string {
  const monthStr = month.toString().padStart(2, '0');
  if (week) {
    return `CRA-${consultantCode}-${year}-W${week.toString().padStart(2, '0')}`;
  }
  return `CRA-${consultantCode}-${year}-${monthStr}`;
}

/**
 * Calculer les jours ouvrés dans une période
 */
export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = []
): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.some(h =>
      h.getFullYear() === current.getFullYear() &&
      h.getMonth() === current.getMonth() &&
      h.getDate() === current.getDate()
    );

    if (!isWeekend && !isHoliday) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Obtenir les dates de début et fin d'un mois
 */
export function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

/**
 * Obtenir les dates de début et fin d'une semaine
 */
export function getWeekBounds(year: number, week: number): { start: Date; end: Date } {
  // Premier jour de l'année
  const jan1 = new Date(year, 0, 1);
  // Trouver le premier lundi
  const dayOfWeek = jan1.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);

  const firstMonday = new Date(year, 0, 1 + daysToMonday);

  // Calculer le début de la semaine demandée
  const start = new Date(firstMonday);
  start.setDate(start.getDate() + (week - 1) * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { start, end };
}

/**
 * Calculer le montant total d'un CRA
 */
export function calculateTimesheetAmount(
  billableDays: number,
  dailyRate: number
): number {
  return billableDays * dailyRate;
}

/**
 * Vérifier si une date est un jour ouvré
 */
export function isWorkingDay(
  date: Date,
  holidays: Date[] = []
): boolean {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  return !holidays.some(h =>
    h.getFullYear() === date.getFullYear() &&
    h.getMonth() === date.getMonth() &&
    h.getDate() === date.getDate()
  );
}

/**
 * Obtenir le numéro de semaine ISO
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
