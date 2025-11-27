// =============================================================================
// PRESTAGO - Plugin Applications - Shared Types
// =============================================================================

/**
 * Application Status - Workflow states
 */
export enum ApplicationStatus {
  DRAFT = 'draft',                       // Brouillon (pas encore soumis)
  SUBMITTED = 'submitted',               // Soumis, en attente de review
  UNDER_REVIEW = 'under_review',         // En cours d'évaluation
  SHORTLISTED = 'shortlisted',           // Présélectionné
  INTERVIEW_SCHEDULED = 'interview_scheduled', // Entretien planifié
  INTERVIEW_COMPLETED = 'interview_completed', // Entretien terminé
  OFFER_PENDING = 'offer_pending',       // Offre en préparation
  OFFER_SENT = 'offer_sent',             // Offre envoyée
  OFFER_ACCEPTED = 'offer_accepted',     // Offre acceptée
  OFFER_DECLINED = 'offer_declined',     // Offre refusée par le candidat
  REJECTED = 'rejected',                 // Rejeté
  WITHDRAWN = 'withdrawn',               // Candidature retirée
  ON_HOLD = 'on_hold',                   // En attente (pause)
}

/**
 * Application Source - Comment le candidat a trouvé le RFP
 */
export enum ApplicationSource {
  DIRECT = 'direct',                     // Candidature directe
  INVITATION = 'invitation',             // Suite à une invitation
  MATCHING = 'matching',                 // Via le système de matching
  REFERRAL = 'referral',                 // Recommandation
  EXTERNAL = 'external',                 // Source externe
}

/**
 * Interview Type
 */
export enum InterviewType {
  PHONE = 'phone',                       // Entretien téléphonique
  VIDEO = 'video',                       // Visioconférence
  ONSITE = 'onsite',                     // Sur site
  TECHNICAL = 'technical',               // Test technique
  HR = 'hr',                             // RH
  FINAL = 'final',                       // Entretien final
}

/**
 * Interview Status
 */
export enum InterviewStatus {
  SCHEDULED = 'scheduled',               // Planifié
  CONFIRMED = 'confirmed',               // Confirmé par le candidat
  COMPLETED = 'completed',               // Terminé
  CANCELLED = 'cancelled',               // Annulé
  NO_SHOW = 'no_show',                   // Absent
  RESCHEDULED = 'rescheduled',           // Reporté
}

/**
 * Evaluation Rating
 */
export enum EvaluationRating {
  EXCELLENT = 5,
  VERY_GOOD = 4,
  GOOD = 3,
  FAIR = 2,
  POOR = 1,
}

/**
 * Offer Status
 */
export enum OfferStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn',
}

/**
 * Application Interface
 */
export interface IApplication {
  id: string;

  // References
  rfp_id: string;
  profile_id: string;
  user_id: string;
  organization_id?: string;              // ESN si applicable

  // Application info
  status: ApplicationStatus;
  source: ApplicationSource;
  invitation_id?: string;                // Si via invitation

  // Candidate info
  cover_letter?: string;
  motivation?: string;
  proposed_start_date?: Date;
  proposed_daily_rate?: number;
  rate_currency: string;
  rate_negotiable: boolean;

  // Availability
  available_from?: Date;
  notice_period_days?: number;
  part_time_available: boolean;
  part_time_percentage?: number;

  // Match score (auto-calculated)
  match_score?: number;
  match_details?: Record<string, any>;

  // Evaluation
  internal_rating?: number;
  internal_notes?: string;

  // Workflow
  submitted_at?: Date;
  reviewed_at?: Date;
  shortlisted_at?: Date;
  rejected_at?: Date;
  withdrawn_at?: Date;

  // Rejection reason (if applicable)
  rejection_reason?: string;
  rejection_category?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Application Document
 */
export interface IApplicationDocument {
  id: string;
  application_id: string;

  type: 'cv' | 'cover_letter' | 'portfolio' | 'certification' | 'reference' | 'other';
  name: string;
  description?: string;

  file_url: string;
  file_name: string;
  file_size: number;
  file_mime_type: string;

  is_primary: boolean;                   // CV principal

  uploaded_at: Date;
}

/**
 * Interview
 */
export interface IInterview {
  id: string;
  application_id: string;
  rfp_id: string;

  type: InterviewType;
  status: InterviewStatus;
  round: number;                         // Numéro du tour

  // Scheduling
  scheduled_at: Date;
  duration_minutes: number;
  timezone: string;

  // Location/Link
  location?: string;                     // Si onsite
  meeting_link?: string;                 // Si video
  phone_number?: string;                 // Si phone
  meeting_password?: string;

  // Participants
  interviewer_ids: string[];
  interviewer_names?: string[];

  // Results
  feedback?: string;
  rating?: EvaluationRating;
  recommendation?: 'hire' | 'consider' | 'reject' | 'undecided';

  // Notes
  internal_notes?: string;
  candidate_notes?: string;              // Notes du candidat

  // Calendar
  calendar_event_id?: string;
  reminder_sent: boolean;

  completed_at?: Date;

  created_at: Date;
  updated_at: Date;
}

/**
 * Application Evaluation
 */
export interface IApplicationEvaluation {
  id: string;
  application_id: string;

  evaluator_id: string;

  // Scores by category
  scores: {
    technical_skills: number;
    experience: number;
    communication: number;
    cultural_fit: number;
    motivation: number;
    availability: number;
    rate_fit: number;
  };

  overall_score: number;
  overall_rating: EvaluationRating;

  strengths: string[];
  weaknesses: string[];

  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire' | 'strong_no_hire';
  comments?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Offer
 */
export interface IOffer {
  id: string;
  application_id: string;
  rfp_id: string;
  profile_id: string;

  status: OfferStatus;

  // Offer details
  position_title: string;
  daily_rate: number;
  rate_currency: string;

  start_date: Date;
  end_date?: Date;
  duration_months?: number;

  work_mode: 'onsite' | 'remote' | 'hybrid';
  remote_percentage?: number;
  location?: string;

  contract_type: 'freelance' | 'portage' | 'cdi' | 'cdd';

  // Terms
  notice_period_days?: number;
  termination_clause?: string;
  special_conditions?: string;

  // Approval workflow
  approved_by_id?: string;
  approved_at?: Date;

  // Sending
  sent_at?: Date;
  sent_by_id?: string;
  viewed_at?: Date;

  // Response
  response_deadline?: Date;
  responded_at?: Date;
  response_comments?: string;

  // Document
  offer_document_url?: string;
  signed_document_url?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Application History (Audit trail)
 */
export interface IApplicationHistory {
  id: string;
  application_id: string;

  action: string;
  from_status?: ApplicationStatus;
  to_status?: ApplicationStatus;

  performed_by_user_id: string;
  comment?: string;

  metadata?: Record<string, any>;

  created_at: Date;
}

/**
 * Application Note
 */
export interface IApplicationNote {
  id: string;
  application_id: string;

  author_id: string;
  content: string;

  is_private: boolean;                   // Visible uniquement en interne
  is_pinned: boolean;

  created_at: Date;
  updated_at: Date;
}

/**
 * Application Search Filters
 */
export interface IApplicationSearchFilters {
  rfp_id?: string;
  profile_id?: string;
  user_id?: string;
  organization_id?: string;

  status?: ApplicationStatus[];
  source?: ApplicationSource[];

  match_score_min?: number;
  match_score_max?: number;

  internal_rating_min?: number;

  submitted_after?: Date;
  submitted_before?: Date;

  has_interviews?: boolean;
  has_offers?: boolean;

  daily_rate_min?: number;
  daily_rate_max?: number;
}

/**
 * Application Statistics
 */
export interface IApplicationStats {
  total: number;
  by_status: Record<ApplicationStatus, number>;
  by_source: Record<ApplicationSource, number>;

  average_match_score: number;
  average_time_to_review_days: number;
  average_time_to_decision_days: number;

  conversion_rates: {
    submitted_to_shortlisted: number;
    shortlisted_to_interview: number;
    interview_to_offer: number;
    offer_to_accepted: number;
  };
}

/**
 * Application Events
 */
export const APPLICATION_EVENTS = {
  // Application lifecycle
  APPLICATION_CREATED: 'application:created',
  APPLICATION_SUBMITTED: 'application:submitted',
  APPLICATION_UPDATED: 'application:updated',
  APPLICATION_WITHDRAWN: 'application:withdrawn',
  APPLICATION_STATUS_CHANGED: 'application:status_changed',

  // Review process
  APPLICATION_UNDER_REVIEW: 'application:under_review',
  APPLICATION_SHORTLISTED: 'application:shortlisted',
  APPLICATION_REJECTED: 'application:rejected',
  APPLICATION_ON_HOLD: 'application:on_hold',

  // Interviews
  INTERVIEW_SCHEDULED: 'application:interview_scheduled',
  INTERVIEW_CONFIRMED: 'application:interview_confirmed',
  INTERVIEW_COMPLETED: 'application:interview_completed',
  INTERVIEW_CANCELLED: 'application:interview_cancelled',

  // Offers
  OFFER_CREATED: 'application:offer_created',
  OFFER_SENT: 'application:offer_sent',
  OFFER_VIEWED: 'application:offer_viewed',
  OFFER_ACCEPTED: 'application:offer_accepted',
  OFFER_DECLINED: 'application:offer_declined',
  OFFER_EXPIRED: 'application:offer_expired',

  // Evaluations
  EVALUATION_ADDED: 'application:evaluation_added',
  EVALUATION_UPDATED: 'application:evaluation_updated',

  // Notes
  NOTE_ADDED: 'application:note_added',
} as const;

export type ApplicationEventType = typeof APPLICATION_EVENTS[keyof typeof APPLICATION_EVENTS];
