// =============================================================================
// PRESTAGO - Plugin Missions - Constantes
// =============================================================================

import { MissionStatus, MilestoneStatus, DeliverableStatus, ExtensionStatus } from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  MISSIONS: 'prestago_missions',
  MILESTONES: 'prestago_mission_milestones',
  DELIVERABLES: 'prestago_mission_deliverables',
  EXTENSIONS: 'prestago_mission_extensions',
  EVALUATIONS: 'prestago_mission_evaluations',
  NOTES: 'prestago_mission_notes',
  HISTORY: 'prestago_mission_history',
  TIME_ENTRIES: 'prestago_mission_time_entries'
};

/**
 * Transitions de statut autorisées pour les missions
 */
export const MISSION_STATUS_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  [MissionStatus.DRAFT]: [MissionStatus.PENDING_START, MissionStatus.CANCELLED],
  [MissionStatus.PENDING_START]: [MissionStatus.ACTIVE, MissionStatus.CANCELLED],
  [MissionStatus.ACTIVE]: [MissionStatus.ON_HOLD, MissionStatus.COMPLETED, MissionStatus.TERMINATED_EARLY],
  [MissionStatus.ON_HOLD]: [MissionStatus.ACTIVE, MissionStatus.TERMINATED_EARLY, MissionStatus.CANCELLED],
  [MissionStatus.COMPLETED]: [], // État final
  [MissionStatus.CANCELLED]: [], // État final
  [MissionStatus.TERMINATED_EARLY]: [] // État final
};

/**
 * Transitions de statut pour les jalons
 */
export const MILESTONE_STATUS_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  [MilestoneStatus.PENDING]: [MilestoneStatus.IN_PROGRESS, MilestoneStatus.CANCELLED],
  [MilestoneStatus.IN_PROGRESS]: [MilestoneStatus.COMPLETED, MilestoneStatus.OVERDUE, MilestoneStatus.CANCELLED],
  [MilestoneStatus.COMPLETED]: [],
  [MilestoneStatus.OVERDUE]: [MilestoneStatus.COMPLETED, MilestoneStatus.CANCELLED],
  [MilestoneStatus.CANCELLED]: []
};

/**
 * Transitions de statut pour les livrables
 */
export const DELIVERABLE_STATUS_TRANSITIONS: Record<DeliverableStatus, DeliverableStatus[]> = {
  [DeliverableStatus.PENDING]: [DeliverableStatus.IN_PROGRESS],
  [DeliverableStatus.IN_PROGRESS]: [DeliverableStatus.SUBMITTED],
  [DeliverableStatus.SUBMITTED]: [DeliverableStatus.UNDER_REVIEW],
  [DeliverableStatus.UNDER_REVIEW]: [DeliverableStatus.APPROVED, DeliverableStatus.REJECTED, DeliverableStatus.REVISION_REQUESTED],
  [DeliverableStatus.APPROVED]: [],
  [DeliverableStatus.REJECTED]: [DeliverableStatus.IN_PROGRESS],
  [DeliverableStatus.REVISION_REQUESTED]: [DeliverableStatus.IN_PROGRESS]
};

/**
 * Transitions de statut pour les extensions
 */
export const EXTENSION_STATUS_TRANSITIONS: Record<ExtensionStatus, ExtensionStatus[]> = {
  [ExtensionStatus.DRAFT]: [ExtensionStatus.PENDING_APPROVAL],
  [ExtensionStatus.PENDING_APPROVAL]: [ExtensionStatus.APPROVED, ExtensionStatus.REJECTED],
  [ExtensionStatus.APPROVED]: [ExtensionStatus.APPLIED],
  [ExtensionStatus.REJECTED]: [ExtensionStatus.DRAFT],
  [ExtensionStatus.APPLIED]: []
};

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  RATE_CURRENCY: 'EUR',
  REPORTING_FREQUENCY: 'weekly',
  TIMESHEET_APPROVAL_LEVELS: 2,
  MISSION_ENDING_REMINDER_DAYS: 30,
  MILESTONE_DUE_REMINDER_DAYS: 7,
  DELIVERABLE_DUE_REMINDER_DAYS: 3
};

/**
 * Règles de validation
 */
export const VALIDATION = {
  MISSION: {
    TITLE_MIN_LENGTH: 10,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 5000,
    MIN_DAILY_RATE: 100,
    MAX_DAILY_RATE: 5000,
    MIN_DURATION_DAYS: 1,
    MAX_DURATION_DAYS: 730 // 2 ans
  },
  MILESTONE: {
    NAME_MIN_LENGTH: 5,
    NAME_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000
  },
  DELIVERABLE: {
    NAME_MIN_LENGTH: 5,
    NAME_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000
  },
  EVALUATION: {
    MIN_SCORE: 1,
    MAX_SCORE: 5,
    COMMENTS_MAX_LENGTH: 2000
  }
};

/**
 * Poids pour le calcul du score global d'évaluation
 */
export const EVALUATION_WEIGHTS = {
  QUALITY: 0.25,
  COMMUNICATION: 0.15,
  RELIABILITY: 0.20,
  EXPERTISE: 0.25,
  COLLABORATION: 0.15
};

/**
 * Seuils d'alerte (en jours)
 */
export const ALERT_THRESHOLDS = {
  MISSION_ENDING_SOON: 30,
  MILESTONE_DUE_SOON: 7,
  DELIVERABLE_DUE_SOON: 3,
  OVERDUE_CHECK_INTERVAL: 1 // Vérification quotidienne
};

/**
 * Couleurs de statut pour l'UI
 */
export const STATUS_COLORS = {
  mission: {
    [MissionStatus.DRAFT]: 'default',
    [MissionStatus.PENDING_START]: 'processing',
    [MissionStatus.ACTIVE]: 'success',
    [MissionStatus.ON_HOLD]: 'warning',
    [MissionStatus.COMPLETED]: 'success',
    [MissionStatus.CANCELLED]: 'error',
    [MissionStatus.TERMINATED_EARLY]: 'error'
  },
  milestone: {
    [MilestoneStatus.PENDING]: 'default',
    [MilestoneStatus.IN_PROGRESS]: 'processing',
    [MilestoneStatus.COMPLETED]: 'success',
    [MilestoneStatus.OVERDUE]: 'error',
    [MilestoneStatus.CANCELLED]: 'default'
  },
  deliverable: {
    [DeliverableStatus.PENDING]: 'default',
    [DeliverableStatus.IN_PROGRESS]: 'processing',
    [DeliverableStatus.SUBMITTED]: 'processing',
    [DeliverableStatus.UNDER_REVIEW]: 'warning',
    [DeliverableStatus.APPROVED]: 'success',
    [DeliverableStatus.REJECTED]: 'error',
    [DeliverableStatus.REVISION_REQUESTED]: 'warning'
  }
};

/**
 * Génération de référence de mission
 */
export function generateMissionReference(clientCode: string, year: number, sequence: number): string {
  const seq = sequence.toString().padStart(4, '0');
  return `MSN-${clientCode}-${year}-${seq}`;
}

/**
 * Calcul du budget total
 */
export function calculateBudget(dailyRate: number, estimatedDays: number): number {
  return dailyRate * estimatedDays;
}

/**
 * Calcul du pourcentage de progression
 */
export function calculateProgress(actualDays: number, estimatedDays: number): number {
  if (estimatedDays === 0) return 0;
  return Math.min(100, Math.round((actualDays / estimatedDays) * 100));
}

/**
 * Calcul du score global d'évaluation
 */
export function calculateOverallScore(scores: {
  quality: number;
  communication: number;
  reliability: number;
  expertise: number;
  collaboration: number;
}): number {
  const weighted =
    scores.quality * EVALUATION_WEIGHTS.QUALITY +
    scores.communication * EVALUATION_WEIGHTS.COMMUNICATION +
    scores.reliability * EVALUATION_WEIGHTS.RELIABILITY +
    scores.expertise * EVALUATION_WEIGHTS.EXPERTISE +
    scores.collaboration * EVALUATION_WEIGHTS.COLLABORATION;

  return parseFloat(weighted.toFixed(2));
}
