// =============================================================================
// PRESTAGO - Plugin Applications - Constants
// =============================================================================

/**
 * Collection names
 */
export const COLLECTIONS = {
  APPLICATIONS: 'prestago_applications',
  APPLICATION_DOCUMENTS: 'prestago_application_documents',
  INTERVIEWS: 'prestago_interviews',
  EVALUATIONS: 'prestago_application_evaluations',
  OFFERS: 'prestago_offers',
  APPLICATION_HISTORY: 'prestago_application_history',
  APPLICATION_NOTES: 'prestago_application_notes',
} as const;

/**
 * API routes prefix
 */
export const API_PREFIX = '/api/prestago';

/**
 * Application routes
 */
export const APPLICATION_ROUTES = {
  APPLICATIONS: `${API_PREFIX}/applications`,
  MY_APPLICATIONS: `${API_PREFIX}/applications/mine`,
  RFP_APPLICATIONS: `${API_PREFIX}/rfps/:rfpId/applications`,
  INTERVIEWS: `${API_PREFIX}/interviews`,
  OFFERS: `${API_PREFIX}/offers`,
} as const;

/**
 * Status workflow - allowed transitions
 */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['under_review', 'rejected', 'withdrawn', 'on_hold'],
  under_review: ['shortlisted', 'rejected', 'on_hold', 'submitted'],
  on_hold: ['under_review', 'shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interview_scheduled', 'rejected', 'on_hold', 'offer_pending'],
  interview_scheduled: ['interview_completed', 'shortlisted', 'rejected', 'on_hold'],
  interview_completed: ['shortlisted', 'offer_pending', 'rejected', 'on_hold'],
  offer_pending: ['offer_sent', 'shortlisted', 'rejected'],
  offer_sent: ['offer_accepted', 'offer_declined'],
  offer_accepted: [],  // Final state - becomes a mission
  offer_declined: ['shortlisted', 'rejected'],  // Can re-shortlist
  rejected: ['submitted'],  // Can be reconsidered
  withdrawn: [],  // Final state
};

/**
 * Default values
 */
export const DEFAULTS = {
  STATUS: 'draft',
  SOURCE: 'direct',
  RATE_CURRENCY: 'EUR',
  RATE_NEGOTIABLE: true,
  PART_TIME_AVAILABLE: false,
  INTERVIEW_DURATION_MINUTES: 60,
  INTERVIEW_TIMEZONE: 'Europe/Paris',
  OFFER_RESPONSE_DAYS: 7,
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  COVER_LETTER_MIN_LENGTH: 100,
  COVER_LETTER_MAX_LENGTH: 5000,
  MOTIVATION_MAX_LENGTH: 2000,
  NOTE_MAX_LENGTH: 5000,
  FEEDBACK_MAX_LENGTH: 5000,
  NOTICE_PERIOD_MAX_DAYS: 180,
  DOCUMENTS_MAX: 10,
} as const;

/**
 * Evaluation weights
 */
export const EVALUATION_WEIGHTS = {
  TECHNICAL_SKILLS: 25,
  EXPERIENCE: 20,
  COMMUNICATION: 15,
  CULTURAL_FIT: 15,
  MOTIVATION: 10,
  AVAILABILITY: 10,
  RATE_FIT: 5,
} as const;

/**
 * Score calculation weights for overall application score
 */
export const APPLICATION_SCORE_WEIGHTS = {
  MATCH_SCORE: 40,
  EVALUATION_SCORE: 35,
  INTERVIEW_SCORE: 25,
} as const;

/**
 * Interview types configuration
 */
export const INTERVIEW_TYPES = {
  phone: {
    name: 'Entretien téléphonique',
    default_duration: 30,
    requires_location: false,
    requires_link: false,
  },
  video: {
    name: 'Visioconférence',
    default_duration: 60,
    requires_location: false,
    requires_link: true,
  },
  onsite: {
    name: 'Sur site',
    default_duration: 90,
    requires_location: true,
    requires_link: false,
  },
  technical: {
    name: 'Test technique',
    default_duration: 120,
    requires_location: false,
    requires_link: true,
  },
  hr: {
    name: 'Entretien RH',
    default_duration: 45,
    requires_location: false,
    requires_link: true,
  },
  final: {
    name: 'Entretien final',
    default_duration: 60,
    requires_location: true,
    requires_link: false,
  },
} as const;

/**
 * Rejection reasons categories
 */
export const REJECTION_CATEGORIES = [
  'skills_mismatch',         // Compétences ne correspondent pas
  'experience_insufficient', // Expérience insuffisante
  'rate_too_high',           // Tarif trop élevé
  'availability_mismatch',   // Disponibilité ne correspond pas
  'location_mismatch',       // Localisation incompatible
  'better_candidate',        // Meilleur candidat sélectionné
  'position_filled',         // Poste pourvu
  'position_cancelled',      // Poste annulé
  'communication_issues',    // Problèmes de communication
  'cultural_fit',            // Adéquation culturelle
  'references_issues',       // Problèmes de références
  'other',                   // Autre
] as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Notification triggers
 */
export const NOTIFICATION_TRIGGERS = {
  APPLICATION_SUBMITTED: true,
  APPLICATION_REVIEWED: true,
  APPLICATION_SHORTLISTED: true,
  APPLICATION_REJECTED: true,
  INTERVIEW_SCHEDULED: true,
  INTERVIEW_REMINDER: true,
  INTERVIEW_COMPLETED: true,
  OFFER_SENT: true,
  OFFER_ACCEPTED: true,
  OFFER_DECLINED: true,
  OFFER_EXPIRING: true,
} as const;

/**
 * Time thresholds (days)
 */
export const TIME_THRESHOLDS = {
  REVIEW_SLA: 5,             // Délai max pour review initial
  INTERVIEW_NOTICE: 2,       // Préavis min pour interview
  OFFER_RESPONSE: 7,         // Délai réponse offre
  OFFER_EXPIRING_REMINDER: 2, // Rappel avant expiration
} as const;

/**
 * File upload limits for application documents
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain',
  ],
} as const;

/**
 * Calendar integration settings
 */
export const CALENDAR_SETTINGS = {
  REMINDER_BEFORE_MINUTES: [60, 15],  // Rappels 1h et 15min avant
  DEFAULT_TIMEZONE: 'Europe/Paris',
} as const;
