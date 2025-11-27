// =============================================================================
// PRESTAGO - Plugin RFP (Request for Proposals) - Shared Types
// =============================================================================

/**
 * RFP Status - Workflow states
 */
export enum RFPStatus {
  DRAFT = 'draft',                     // En cours de rédaction
  PENDING_APPROVAL = 'pending_approval', // En attente d'approbation interne
  PUBLISHED = 'published',             // Publié et ouvert aux candidatures
  EVALUATING = 'evaluating',           // Évaluation des candidatures
  SHORTLISTED = 'shortlisted',         // Candidats présélectionnés
  NEGOTIATING = 'negotiating',         // Négociation en cours
  AWARDED = 'awarded',                 // Mission attribuée
  CANCELLED = 'cancelled',             // Annulé
  EXPIRED = 'expired',                 // Expiré sans attribution
  CLOSED = 'closed',                   // Fermé (archivé)
}

/**
 * RFP Priority
 */
export enum RFPPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * RFP Visibility
 */
export enum RFPVisibility {
  PUBLIC = 'public',                   // Visible par tous les consultants
  ORGANIZATION_ONLY = 'organization_only', // Visible uniquement par l'ESN partenaire
  INVITED_ONLY = 'invited_only',       // Sur invitation uniquement
  PRIVATE = 'private',                 // Interne (recherche directe)
}

/**
 * Mission Type
 */
export enum MissionType {
  FIXED_PRICE = 'fixed_price',         // Forfait
  TIME_AND_MATERIALS = 'time_and_materials', // Régie
  MIXED = 'mixed',                     // Mixte
}

/**
 * Contract Type (for the mission)
 */
export enum ContractType {
  FREELANCE = 'freelance',
  PORTAGE = 'portage',
  CDI = 'cdi',
  CDD = 'cdd',
  ANY = 'any',
}

/**
 * Work Mode for the mission
 */
export enum WorkMode {
  ONSITE = 'onsite',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

/**
 * Experience Level Required
 */
export enum ExperienceLevel {
  JUNIOR = 'junior',
  CONFIRMED = 'confirmed',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXPERT = 'expert',
}

/**
 * Skill Requirement Type
 */
export enum SkillRequirementType {
  MANDATORY = 'mandatory',
  PREFERRED = 'preferred',
  NICE_TO_HAVE = 'nice_to_have',
}

/**
 * RFP Interface
 */
export interface IRFP {
  id: string;

  // Basic Info
  reference_number: string;            // Numéro de référence unique
  title: string;
  description: string;
  client_context?: string;             // Contexte client (anonymisé ou non)

  // Organization
  client_organization_id: string;      // Client qui publie le RFP
  created_by_user_id: string;          // Utilisateur qui a créé le RFP
  assigned_manager_id?: string;        // Manager responsable côté client

  // Mission Details
  mission_type: MissionType;
  contract_types: ContractType[];
  work_mode: WorkMode;

  // Location
  location_city: string;
  location_country: string;
  location_address?: string;
  remote_percentage?: number;          // % de télétravail si hybride

  // Duration & Timing
  estimated_start_date: Date;
  estimated_end_date?: Date;
  duration_months?: number;
  extension_possible: boolean;
  max_extension_months?: number;

  // Resources
  positions_count: number;             // Nombre de postes à pourvoir
  team_context?: string;               // Contexte équipe
  reporting_to?: string;               // Hiérarchie

  // Budget
  budget_type: 'daily_rate' | 'fixed_price' | 'not_specified';
  daily_rate_min?: number;
  daily_rate_max?: number;
  fixed_price_budget?: number;
  budget_currency: string;
  budget_visible: boolean;

  // Requirements
  experience_level: ExperienceLevel;
  years_experience_min?: number;
  years_experience_max?: number;
  required_languages?: string[];
  certifications_required?: string[];

  // Status & Dates
  status: RFPStatus;
  priority: RFPPriority;
  visibility: RFPVisibility;

  application_deadline?: Date;
  published_at?: Date;
  closed_at?: Date;
  awarded_at?: Date;

  // Stats
  views_count: number;
  applications_count: number;
  shortlisted_count: number;

  // Metadata
  tags?: string[];
  internal_notes?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Skill Requirement for an RFP
 */
export interface IRFPSkillRequirement {
  id: string;
  rfp_id: string;
  skill_id: string;

  requirement_type: SkillRequirementType;
  minimum_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  minimum_years?: number;
  weight: number;                      // Poids dans le matching (1-10)

  notes?: string;

  created_at: Date;
}

/**
 * RFP Document/Attachment
 */
export interface IRFPDocument {
  id: string;
  rfp_id: string;

  type: 'specification' | 'context' | 'contract_template' | 'nda' | 'other';
  name: string;
  description?: string;

  file_url: string;
  file_name: string;
  file_size: number;
  file_mime_type: string;

  is_public: boolean;                  // Visible avant candidature
  requires_nda: boolean;               // Nécessite signature NDA

  uploaded_at: Date;
}

/**
 * RFP Question (Q&A from candidates)
 */
export interface IRFPQuestion {
  id: string;
  rfp_id: string;

  asked_by_user_id: string;
  asked_by_organization_id?: string;

  question: string;
  answer?: string;
  answered_by_user_id?: string;
  answered_at?: Date;

  is_public: boolean;                  // Visible par tous les candidats
  is_anonymous: boolean;               // Question anonyme

  created_at: Date;
}

/**
 * RFP Invitation (for invited-only RFPs)
 */
export interface IRFPInvitation {
  id: string;
  rfp_id: string;

  // Peut être une organisation (ESN) ou un profil consultant
  invited_organization_id?: string;
  invited_profile_id?: string;

  invited_by_user_id: string;
  message?: string;

  status: 'pending' | 'accepted' | 'declined' | 'expired';
  responded_at?: Date;

  created_at: Date;
  expires_at?: Date;
}

/**
 * RFP Workflow History
 */
export interface IRFPHistory {
  id: string;
  rfp_id: string;

  action: string;                      // 'status_changed', 'edited', 'published', etc.
  from_status?: RFPStatus;
  to_status?: RFPStatus;

  performed_by_user_id: string;
  comment?: string;

  changes?: Record<string, { old: any; new: any }>;

  created_at: Date;
}

/**
 * RFP Search/Filter parameters
 */
export interface IRFPSearchFilters {
  query?: string;
  status?: RFPStatus[];
  priority?: RFPPriority[];
  visibility?: RFPVisibility[];

  client_organization_id?: string;
  skill_ids?: string[];

  mission_types?: MissionType[];
  contract_types?: ContractType[];
  work_modes?: WorkMode[];
  experience_levels?: ExperienceLevel[];

  location_cities?: string[];
  location_countries?: string[];

  daily_rate_min?: number;
  daily_rate_max?: number;

  duration_min_months?: number;
  duration_max_months?: number;

  start_date_from?: Date;
  start_date_to?: Date;

  positions_min?: number;

  published_after?: Date;
  deadline_before?: Date;

  has_remote?: boolean;
}

/**
 * RFP Match Score (for consultant matching)
 */
export interface IRFPMatchScore {
  rfp_id: string;
  profile_id: string;

  overall_score: number;               // 0-100

  scores: {
    skills: number;                    // Score compétences
    experience: number;                // Score expérience
    location: number;                  // Score localisation
    availability: number;              // Score disponibilité
    rate: number;                      // Score tarif (compatibilité budget)
  };

  matching_skills: Array<{
    skill_id: string;
    skill_name: string;
    requirement_type: SkillRequirementType;
    required_level?: string;
    profile_level: string;
    match: boolean;
  }>;

  missing_mandatory_skills: string[];
  missing_preferred_skills: string[];

  calculated_at: Date;
}

/**
 * RFP Events
 */
export const RFP_EVENTS = {
  // RFP Lifecycle
  RFP_CREATED: 'rfp:created',
  RFP_UPDATED: 'rfp:updated',
  RFP_PUBLISHED: 'rfp:published',
  RFP_CLOSED: 'rfp:closed',
  RFP_CANCELLED: 'rfp:cancelled',
  RFP_EXPIRED: 'rfp:expired',
  RFP_AWARDED: 'rfp:awarded',
  RFP_STATUS_CHANGED: 'rfp:status_changed',

  // Skills
  RFP_SKILL_ADDED: 'rfp:skill_added',
  RFP_SKILL_REMOVED: 'rfp:skill_removed',

  // Documents
  RFP_DOCUMENT_ADDED: 'rfp:document_added',
  RFP_DOCUMENT_REMOVED: 'rfp:document_removed',

  // Q&A
  RFP_QUESTION_ASKED: 'rfp:question_asked',
  RFP_QUESTION_ANSWERED: 'rfp:question_answered',

  // Invitations
  RFP_INVITATION_SENT: 'rfp:invitation_sent',
  RFP_INVITATION_ACCEPTED: 'rfp:invitation_accepted',
  RFP_INVITATION_DECLINED: 'rfp:invitation_declined',

  // Matching
  RFP_MATCHING_REQUESTED: 'rfp:matching_requested',
  RFP_MATCHING_COMPLETED: 'rfp:matching_completed',
} as const;

export type RFPEventType = typeof RFP_EVENTS[keyof typeof RFP_EVENTS];
