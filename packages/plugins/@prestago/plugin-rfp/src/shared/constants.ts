// =============================================================================
// PRESTAGO - Plugin RFP - Constants
// =============================================================================

/**
 * Collection names
 */
export const COLLECTIONS = {
  RFPS: 'prestago_rfps',
  RFP_SKILL_REQUIREMENTS: 'prestago_rfp_skill_requirements',
  RFP_DOCUMENTS: 'prestago_rfp_documents',
  RFP_QUESTIONS: 'prestago_rfp_questions',
  RFP_INVITATIONS: 'prestago_rfp_invitations',
  RFP_HISTORY: 'prestago_rfp_history',
  RFP_VIEWS: 'prestago_rfp_views',
  RFP_SAVED: 'prestago_rfp_saved',
} as const;

/**
 * API routes prefix
 */
export const API_PREFIX = '/api/prestago';

/**
 * RFP routes
 */
export const RFP_ROUTES = {
  RFPS: `${API_PREFIX}/rfps`,
  MY_RFPS: `${API_PREFIX}/rfps/mine`,
  SEARCH: `${API_PREFIX}/rfps/search`,
  MATCHING: `${API_PREFIX}/rfps/matching`,
  QUESTIONS: `${API_PREFIX}/rfp-questions`,
  INVITATIONS: `${API_PREFIX}/rfp-invitations`,
} as const;

/**
 * Reference number format
 */
export const REFERENCE_NUMBER = {
  PREFIX: 'RFP',
  YEAR_FORMAT: 'YYYY',
  SEQUENCE_LENGTH: 5,
  SEPARATOR: '-',
  // Format: RFP-2024-00001
} as const;

/**
 * Status workflow - allowed transitions
 */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_approval', 'cancelled'],
  pending_approval: ['draft', 'published', 'cancelled'],
  published: ['evaluating', 'cancelled', 'expired'],
  evaluating: ['shortlisted', 'published', 'cancelled'],
  shortlisted: ['negotiating', 'evaluating', 'cancelled'],
  negotiating: ['awarded', 'shortlisted', 'cancelled'],
  awarded: ['closed'],
  cancelled: ['draft'],  // Peut être réouvert en brouillon
  expired: ['draft'],    // Peut être réouvert en brouillon
  closed: [],            // État final
};

/**
 * Default values
 */
export const DEFAULTS = {
  BUDGET_CURRENCY: 'EUR',
  POSITIONS_COUNT: 1,
  EXTENSION_POSSIBLE: false,
  BUDGET_VISIBLE: false,
  VISIBILITY: 'public',
  PRIORITY: 'medium',
  STATUS: 'draft',
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  TITLE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 10000,
  DAILY_RATE_MIN: 100,
  DAILY_RATE_MAX: 5000,
  DURATION_MIN_MONTHS: 1,
  DURATION_MAX_MONTHS: 36,
  POSITIONS_MAX: 50,
  SKILLS_MAX: 30,
  DOCUMENTS_MAX: 20,
  QUESTION_MAX_LENGTH: 2000,
  ANSWER_MAX_LENGTH: 5000,
} as const;

/**
 * Skill matching weights
 */
export const MATCHING_WEIGHTS = {
  MANDATORY_SKILL: 10,
  PREFERRED_SKILL: 5,
  NICE_TO_HAVE_SKILL: 2,
  EXPERIENCE_LEVEL_MATCH: 15,
  YEARS_EXPERIENCE_MATCH: 10,
  LOCATION_MATCH: 10,
  REMOTE_AVAILABLE: 5,
  AVAILABILITY_MATCH: 15,
  RATE_IN_BUDGET: 10,
  CERTIFICATION_MATCH: 5,
} as const;

/**
 * Matching score thresholds
 */
export const MATCH_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  ACCEPTABLE: 60,
  POOR: 40,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache TTL (seconds)
 */
export const CACHE_TTL = {
  RFP_LIST: 300,         // 5 minutes
  RFP_DETAIL: 60,        // 1 minute
  RFP_STATS: 600,        // 10 minutes
  MATCHING_RESULTS: 1800, // 30 minutes
} as const;

/**
 * Notification triggers
 */
export const NOTIFICATION_TRIGGERS = {
  RFP_PUBLISHED: true,
  RFP_DEADLINE_APPROACHING: true,
  RFP_QUESTION_ANSWERED: true,
  RFP_INVITATION_RECEIVED: true,
  RFP_STATUS_CHANGED: true,
  RFP_AWARDED: true,
} as const;

/**
 * Deadline approaching thresholds (days)
 */
export const DEADLINE_THRESHOLDS = {
  URGENT: 3,
  WARNING: 7,
  NOTICE: 14,
} as const;

/**
 * Industries for RFP context
 */
export const INDUSTRIES = [
  'banking_finance',
  'insurance',
  'technology',
  'consulting',
  'retail',
  'healthcare',
  'telecom',
  'energy',
  'manufacturing',
  'transport',
  'media',
  'public_sector',
  'education',
  'real_estate',
  'other',
] as const;

/**
 * Mission domains
 */
export const MISSION_DOMAINS = [
  'web_development',
  'mobile_development',
  'backend_development',
  'frontend_development',
  'fullstack_development',
  'devops',
  'cloud_architecture',
  'data_engineering',
  'data_science',
  'machine_learning',
  'cybersecurity',
  'project_management',
  'product_management',
  'business_analysis',
  'ux_ui_design',
  'quality_assurance',
  'it_support',
  'consulting',
  'training',
  'other',
] as const;

/**
 * File upload limits for RFP documents
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 25,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'text/plain',
  ],
} as const;
