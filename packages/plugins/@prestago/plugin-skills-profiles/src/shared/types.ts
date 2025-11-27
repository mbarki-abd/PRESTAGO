// =============================================================================
// PRESTAGO - Plugin Skills & Profiles - Shared Types
// =============================================================================

/**
 * Skill level enumeration
 */
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Skill category types
 */
export enum SkillCategory {
  TECHNICAL = 'technical',
  FUNCTIONAL = 'functional',
  SOFT_SKILL = 'soft_skill',
  LANGUAGE = 'language',
  CERTIFICATION = 'certification',
  TOOL = 'tool',
  METHODOLOGY = 'methodology',
  DOMAIN = 'domain',
}

/**
 * Profile status
 */
export enum ProfileStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Profile visibility
 */
export enum ProfileVisibility {
  PUBLIC = 'public',
  ORGANIZATION_ONLY = 'organization_only',
  PRIVATE = 'private',
}

/**
 * Availability status
 */
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  PARTIALLY_AVAILABLE = 'partially_available',
  NOT_AVAILABLE = 'not_available',
  ON_MISSION = 'on_mission',
}

/**
 * Contract preference
 */
export enum ContractPreference {
  CDI = 'cdi',
  CDD = 'cdd',
  FREELANCE = 'freelance',
  PORTAGE = 'portage',
  ANY = 'any',
}

/**
 * Work mode preference
 */
export enum WorkMode {
  ONSITE = 'onsite',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ANY = 'any',
}

/**
 * Experience level
 */
export enum ExperienceLevel {
  JUNIOR = 'junior',        // 0-2 years
  CONFIRMED = 'confirmed',   // 2-5 years
  SENIOR = 'senior',         // 5-10 years
  LEAD = 'lead',             // 10-15 years
  EXPERT = 'expert',         // 15+ years
}

/**
 * Document type for profile attachments
 */
export enum ProfileDocumentType {
  CV = 'cv',
  CERTIFICATION = 'certification',
  DIPLOMA = 'diploma',
  PORTFOLIO = 'portfolio',
  RECOMMENDATION = 'recommendation',
  OTHER = 'other',
}

/**
 * Skill interface
 */
export interface ISkill {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  parent_id?: string;
  description?: string;
  aliases?: string[];
  is_validated: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Profile skill (junction with level and years)
 */
export interface IProfileSkill {
  id: string;
  profile_id: string;
  skill_id: string;
  level: SkillLevel;
  years_experience?: number;
  last_used_year?: number;
  is_primary: boolean;
  is_highlighted: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Consultant profile interface
 */
export interface IConsultantProfile {
  id: string;
  user_id: string;
  organization_id?: string;

  // Professional info
  title: string;
  headline?: string;
  summary?: string;
  experience_level: ExperienceLevel;
  years_experience: number;

  // Availability
  availability_status: AvailabilityStatus;
  available_from?: Date;
  available_days_per_week?: number;

  // Preferences
  contract_preferences: ContractPreference[];
  work_mode: WorkMode;
  mobility_radius_km?: number;
  mobility_regions?: string[];
  mobility_countries?: string[];

  // Rates
  daily_rate_min?: number;
  daily_rate_max?: number;
  daily_rate_currency: string;
  rate_negotiable: boolean;

  // Location
  location_city?: string;
  location_country: string;
  location_postal_code?: string;

  // Status
  status: ProfileStatus;
  visibility: ProfileVisibility;
  completeness_score: number;

  // SEO & Search
  keywords?: string[];

  // Metadata
  last_activity_at?: Date;
  views_count: number;
  applications_count: number;
  missions_count: number;

  created_at: Date;
  updated_at: Date;
}

/**
 * Experience entry (work history)
 */
export interface IExperience {
  id: string;
  profile_id: string;

  // Company info
  company_name: string;
  company_logo_url?: string;
  company_industry?: string;
  company_size?: string;

  // Position
  job_title: string;
  job_type: ContractPreference;

  // Duration
  start_date: Date;
  end_date?: Date;
  is_current: boolean;

  // Location
  location_city?: string;
  location_country?: string;
  is_remote: boolean;

  // Description
  description?: string;
  responsibilities?: string[];
  achievements?: string[];

  // Skills used
  skill_ids?: string[];

  // Validation
  is_verified: boolean;
  reference_name?: string;
  reference_email?: string;
  reference_phone?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Education entry
 */
export interface IEducation {
  id: string;
  profile_id: string;

  institution_name: string;
  institution_logo_url?: string;
  institution_country?: string;

  degree: string;
  field_of_study: string;
  grade?: string;

  start_date: Date;
  end_date?: Date;
  is_current: boolean;

  description?: string;
  activities?: string[];

  is_verified: boolean;

  created_at: Date;
  updated_at: Date;
}

/**
 * Certification entry
 */
export interface ICertification {
  id: string;
  profile_id: string;
  skill_id?: string;

  name: string;
  issuing_organization: string;
  issuing_organization_logo_url?: string;

  issue_date: Date;
  expiration_date?: string;
  does_not_expire: boolean;

  credential_id?: string;
  credential_url?: string;

  is_verified: boolean;
  verification_date?: Date;

  created_at: Date;
  updated_at: Date;
}

/**
 * Language proficiency
 */
export interface ILanguage {
  id: string;
  profile_id: string;

  language_code: string;
  language_name: string;

  speaking_level: SkillLevel;
  reading_level: SkillLevel;
  writing_level: SkillLevel;

  is_native: boolean;
  certification?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Profile document/attachment
 */
export interface IProfileDocument {
  id: string;
  profile_id: string;

  type: ProfileDocumentType;
  name: string;
  description?: string;

  file_url: string;
  file_name: string;
  file_size: number;
  file_mime_type: string;

  is_public: boolean;
  download_count: number;

  uploaded_at: Date;
  expires_at?: Date;
}

/**
 * Profile completeness calculation
 */
export interface IProfileCompleteness {
  total_score: number;
  sections: {
    basic_info: number;
    skills: number;
    experience: number;
    education: number;
    certifications: number;
    languages: number;
    documents: number;
    preferences: number;
  };
  missing_fields: string[];
  recommendations: string[];
}

/**
 * Profile search filters
 */
export interface IProfileSearchFilters {
  query?: string;
  skill_ids?: string[];
  skill_categories?: SkillCategory[];
  experience_levels?: ExperienceLevel[];
  availability_status?: AvailabilityStatus[];
  contract_preferences?: ContractPreference[];
  work_modes?: WorkMode[];
  location_cities?: string[];
  location_countries?: string[];
  daily_rate_min?: number;
  daily_rate_max?: number;
  years_experience_min?: number;
  years_experience_max?: number;
  language_codes?: string[];
  has_certifications?: boolean;
  organization_id?: string;
  is_freelance?: boolean;
}

/**
 * Profile search result
 */
export interface IProfileSearchResult {
  profile: IConsultantProfile;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  skills: Array<{
    skill: ISkill;
    level: SkillLevel;
    years_experience?: number;
  }>;
  match_score?: number;
  highlights?: Record<string, string[]>;
}

/**
 * Events emitted by the skills-profiles plugin
 */
export const PROFILE_EVENTS = {
  // Profile events
  PROFILE_CREATED: 'profile:created',
  PROFILE_UPDATED: 'profile:updated',
  PROFILE_ACTIVATED: 'profile:activated',
  PROFILE_DEACTIVATED: 'profile:deactivated',
  PROFILE_VIEWED: 'profile:viewed',
  PROFILE_COMPLETENESS_CHANGED: 'profile:completeness_changed',

  // Skill events
  SKILL_CREATED: 'skill:created',
  SKILL_UPDATED: 'skill:updated',
  SKILL_MERGED: 'skill:merged',
  SKILL_VALIDATED: 'skill:validated',

  // Experience events
  EXPERIENCE_ADDED: 'experience:added',
  EXPERIENCE_UPDATED: 'experience:updated',
  EXPERIENCE_REMOVED: 'experience:removed',
  EXPERIENCE_VERIFIED: 'experience:verified',

  // Certification events
  CERTIFICATION_ADDED: 'certification:added',
  CERTIFICATION_VERIFIED: 'certification:verified',
  CERTIFICATION_EXPIRED: 'certification:expired',

  // Availability events
  AVAILABILITY_CHANGED: 'availability:changed',
} as const;

export type ProfileEventType = typeof PROFILE_EVENTS[keyof typeof PROFILE_EVENTS];
