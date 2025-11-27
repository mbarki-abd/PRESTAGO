// =============================================================================
// PRESTAGO - Plugin Missions - Types et Énumérations
// =============================================================================

/**
 * Statuts d'une mission
 */
export enum MissionStatus {
  DRAFT = 'draft',                     // Brouillon
  PENDING_START = 'pending_start',     // En attente de démarrage
  ACTIVE = 'active',                   // En cours
  ON_HOLD = 'on_hold',                 // Suspendue
  COMPLETED = 'completed',             // Terminée
  CANCELLED = 'cancelled',             // Annulée
  TERMINATED_EARLY = 'terminated_early' // Terminée prématurément
}

/**
 * Types de fin de mission
 */
export enum MissionEndType {
  NATURAL = 'natural',           // Fin naturelle (date de fin atteinte)
  MUTUAL_AGREEMENT = 'mutual',   // Résiliation amiable
  CLIENT_TERMINATION = 'client', // Rupture par le client
  CONSULTANT_TERMINATION = 'consultant', // Rupture par le consultant
  FORCE_MAJEURE = 'force_majeure' // Force majeure
}

/**
 * Statuts d'un jalon (milestone)
 */
export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

/**
 * Types de livrables
 */
export enum DeliverableType {
  DOCUMENT = 'document',
  CODE = 'code',
  PRESENTATION = 'presentation',
  REPORT = 'report',
  PROTOTYPE = 'prototype',
  TRAINING = 'training',
  SUPPORT = 'support',
  OTHER = 'other'
}

/**
 * Statuts d'un livrable
 */
export enum DeliverableStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested'
}

/**
 * Types d'extensions de mission
 */
export enum ExtensionType {
  DURATION = 'duration',       // Extension de durée
  SCOPE = 'scope',             // Extension de périmètre
  RATE = 'rate',               // Modification de tarif
  COMBINED = 'combined'        // Combinaison
}

/**
 * Statuts d'une extension
 */
export enum ExtensionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPLIED = 'applied'
}

/**
 * Fréquence de reporting
 */
export enum ReportingFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ON_DEMAND = 'on_demand'
}

/**
 * Niveaux de satisfaction
 */
export enum SatisfactionLevel {
  VERY_SATISFIED = 5,
  SATISFIED = 4,
  NEUTRAL = 3,
  DISSATISFIED = 2,
  VERY_DISSATISFIED = 1
}

/**
 * Types de notes de mission
 */
export enum MissionNoteType {
  GENERAL = 'general',
  PROGRESS = 'progress',
  ISSUE = 'issue',
  RISK = 'risk',
  DECISION = 'decision',
  FEEDBACK = 'feedback'
}

/**
 * Événements de mission
 */
export const MISSION_EVENTS = {
  // Mission lifecycle
  MISSION_CREATED: 'mission.created',
  MISSION_STARTED: 'mission.started',
  MISSION_ON_HOLD: 'mission.on_hold',
  MISSION_RESUMED: 'mission.resumed',
  MISSION_COMPLETED: 'mission.completed',
  MISSION_CANCELLED: 'mission.cancelled',
  MISSION_TERMINATED: 'mission.terminated',

  // Milestones
  MILESTONE_CREATED: 'mission.milestone.created',
  MILESTONE_STARTED: 'mission.milestone.started',
  MILESTONE_COMPLETED: 'mission.milestone.completed',
  MILESTONE_OVERDUE: 'mission.milestone.overdue',

  // Deliverables
  DELIVERABLE_SUBMITTED: 'mission.deliverable.submitted',
  DELIVERABLE_APPROVED: 'mission.deliverable.approved',
  DELIVERABLE_REJECTED: 'mission.deliverable.rejected',

  // Extensions
  EXTENSION_REQUESTED: 'mission.extension.requested',
  EXTENSION_APPROVED: 'mission.extension.approved',
  EXTENSION_REJECTED: 'mission.extension.rejected',

  // Evaluations
  EVALUATION_SUBMITTED: 'mission.evaluation.submitted',

  // Alerts
  MISSION_ENDING_SOON: 'mission.alert.ending_soon',
  MILESTONE_DUE_SOON: 'mission.alert.milestone_due',
  DELIVERABLE_DUE_SOON: 'mission.alert.deliverable_due'
} as const;

/**
 * Interface Mission
 */
export interface IMission {
  id: string;
  reference: string;
  title: string;
  description?: string;

  // Relations
  rfp_id: string;
  application_id: string;
  offer_id: string;
  profile_id: string;
  client_organization_id: string;
  consultant_organization_id?: string;

  // Responsables
  client_manager_id: string;
  consultant_id: string;
  account_manager_id?: string;

  // Dates
  start_date: Date;
  end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;

  // Financier
  daily_rate: number;
  rate_currency: string;
  estimated_days: number;
  actual_days?: number;
  budget_total: number;
  budget_consumed?: number;

  // Mode de travail
  work_mode: 'onsite' | 'remote' | 'hybrid';
  remote_percentage?: number;
  work_location?: string;

  // Statut
  status: MissionStatus;
  end_type?: MissionEndType;
  termination_reason?: string;

  // Configuration
  reporting_frequency: ReportingFrequency;
  requires_timesheet: boolean;
  timesheet_approval_levels: number;

  // Métadonnées
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface Milestone
 */
export interface IMilestone {
  id: string;
  mission_id: string;
  name: string;
  description?: string;
  due_date: Date;
  completed_date?: Date;
  status: MilestoneStatus;
  order: number;
  deliverables_required: boolean;
  payment_trigger: boolean;
  payment_percentage?: number;
}

/**
 * Interface Deliverable
 */
export interface IDeliverable {
  id: string;
  mission_id: string;
  milestone_id?: string;
  name: string;
  description?: string;
  type: DeliverableType;
  due_date: Date;
  submitted_date?: Date;
  approved_date?: Date;
  status: DeliverableStatus;
  file_url?: string;
  reviewer_id?: string;
  review_comments?: string;
}

/**
 * Interface Extension de mission
 */
export interface IMissionExtension {
  id: string;
  mission_id: string;
  type: ExtensionType;
  status: ExtensionStatus;

  // Durée
  new_end_date?: Date;
  additional_days?: number;

  // Tarif
  new_daily_rate?: number;

  // Périmètre
  scope_changes?: string;

  reason: string;
  requested_by_id: string;
  approved_by_id?: string;
  requested_at: Date;
  approved_at?: Date;
}

/**
 * Interface Évaluation de mission
 */
export interface IMissionEvaluation {
  id: string;
  mission_id: string;
  evaluator_id: string;
  evaluator_type: 'client' | 'consultant';

  // Scores (1-5)
  quality_score: number;
  communication_score: number;
  reliability_score: number;
  expertise_score: number;
  collaboration_score: number;
  overall_score: number;

  strengths?: string[];
  improvements?: string[];
  comments?: string;
  would_recommend: boolean;
  would_work_again: boolean;

  created_at: Date;
}
