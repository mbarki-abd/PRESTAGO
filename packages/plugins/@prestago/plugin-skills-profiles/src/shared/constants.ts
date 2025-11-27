// =============================================================================
// PRESTAGO - Plugin Skills & Profiles - Constants
// =============================================================================

/**
 * Collection names for skills & profiles plugin
 */
export const COLLECTIONS = {
  SKILLS: 'prestago_skills',
  SKILL_ALIASES: 'prestago_skill_aliases',
  CONSULTANT_PROFILES: 'prestago_consultant_profiles',
  PROFILE_SKILLS: 'prestago_profile_skills',
  EXPERIENCES: 'prestago_experiences',
  EXPERIENCE_SKILLS: 'prestago_experience_skills',
  EDUCATIONS: 'prestago_educations',
  CERTIFICATIONS: 'prestago_certifications',
  LANGUAGES: 'prestago_languages',
  PROFILE_DOCUMENTS: 'prestago_profile_documents',
  PROFILE_VIEWS: 'prestago_profile_views',
} as const;

/**
 * API routes prefix
 */
export const API_PREFIX = '/api/prestago';

/**
 * Profile routes
 */
export const PROFILE_ROUTES = {
  PROFILES: `${API_PREFIX}/profiles`,
  MY_PROFILE: `${API_PREFIX}/profiles/me`,
  SKILLS: `${API_PREFIX}/skills`,
  EXPERIENCES: `${API_PREFIX}/experiences`,
  EDUCATIONS: `${API_PREFIX}/educations`,
  CERTIFICATIONS: `${API_PREFIX}/certifications`,
  LANGUAGES: `${API_PREFIX}/languages`,
  DOCUMENTS: `${API_PREFIX}/profile-documents`,
  SEARCH: `${API_PREFIX}/profiles/search`,
} as const;

/**
 * Profile completeness weights (total = 100)
 */
export const COMPLETENESS_WEIGHTS = {
  BASIC_INFO: 15,        // title, headline, summary, location
  SKILLS: 25,            // at least 5 skills
  EXPERIENCE: 20,        // at least 1 experience
  EDUCATION: 10,         // at least 1 education
  CERTIFICATIONS: 10,    // optional but valuable
  LANGUAGES: 5,          // at least 1 language
  DOCUMENTS: 10,         // CV uploaded
  PREFERENCES: 5,        // availability, rates, work mode
} as const;

/**
 * Minimum requirements for profile completeness sections
 */
export const COMPLETENESS_REQUIREMENTS = {
  MIN_SKILLS: 5,
  MIN_PRIMARY_SKILLS: 3,
  MIN_EXPERIENCES: 1,
  MIN_EDUCATIONS: 1,
  MIN_LANGUAGES: 1,
  MIN_SUMMARY_LENGTH: 100,
  MIN_HEADLINE_LENGTH: 10,
} as const;

/**
 * Experience level year ranges
 */
export const EXPERIENCE_LEVEL_YEARS = {
  junior: { min: 0, max: 2 },
  confirmed: { min: 2, max: 5 },
  senior: { min: 5, max: 10 },
  lead: { min: 10, max: 15 },
  expert: { min: 15, max: Infinity },
} as const;

/**
 * Default daily rate ranges by experience level (EUR)
 */
export const DEFAULT_DAILY_RATES = {
  junior: { min: 250, max: 400 },
  confirmed: { min: 400, max: 550 },
  senior: { min: 550, max: 750 },
  lead: { min: 700, max: 900 },
  expert: { min: 850, max: 1200 },
} as const;

/**
 * Skill level weights for matching
 */
export const SKILL_LEVEL_WEIGHTS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
} as const;

/**
 * Maximum items per section
 */
export const MAX_ITEMS = {
  SKILLS: 50,
  PRIMARY_SKILLS: 10,
  HIGHLIGHTED_SKILLS: 5,
  EXPERIENCES: 30,
  EDUCATIONS: 10,
  CERTIFICATIONS: 20,
  LANGUAGES: 10,
  DOCUMENTS: 20,
  KEYWORDS: 20,
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_CV_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_CERT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/**
 * Search configuration
 */
export const SEARCH_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  BOOST_PRIMARY_SKILLS: 2.0,
  BOOST_HIGHLIGHTED_SKILLS: 1.5,
  BOOST_RECENT_EXPERIENCE: 1.3,
  BOOST_VERIFIED_EXPERIENCE: 1.2,
} as const;

/**
 * Common skill categories for initialization
 */
export const DEFAULT_SKILL_CATEGORIES = [
  { category: 'technical', subcategories: ['frontend', 'backend', 'mobile', 'devops', 'database', 'cloud', 'security', 'data'] },
  { category: 'functional', subcategories: ['project_management', 'product', 'business_analysis', 'agile', 'finance', 'hr'] },
  { category: 'soft_skill', subcategories: ['leadership', 'communication', 'problem_solving', 'teamwork', 'creativity'] },
  { category: 'language', subcategories: [] },
  { category: 'certification', subcategories: ['aws', 'azure', 'gcp', 'scrum', 'itil', 'pmp'] },
  { category: 'tool', subcategories: ['ide', 'design', 'collaboration', 'monitoring', 'testing'] },
  { category: 'methodology', subcategories: ['agile', 'devops', 'lean', 'design_thinking'] },
  { category: 'domain', subcategories: ['banking', 'insurance', 'retail', 'healthcare', 'telecom', 'energy'] },
] as const;

/**
 * Common languages list
 */
export const COMMON_LANGUAGES = [
  { code: 'fr', name: 'French', native_name: 'Français' },
  { code: 'en', name: 'English', native_name: 'English' },
  { code: 'es', name: 'Spanish', native_name: 'Español' },
  { code: 'de', name: 'German', native_name: 'Deutsch' },
  { code: 'it', name: 'Italian', native_name: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native_name: 'Português' },
  { code: 'nl', name: 'Dutch', native_name: 'Nederlands' },
  { code: 'ar', name: 'Arabic', native_name: 'العربية' },
  { code: 'zh', name: 'Chinese', native_name: '中文' },
  { code: 'ja', name: 'Japanese', native_name: '日本語' },
  { code: 'ru', name: 'Russian', native_name: 'Русский' },
  { code: 'pl', name: 'Polish', native_name: 'Polski' },
] as const;

/**
 * French regions for mobility
 */
export const FRENCH_REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Provence-Alpes-Côte d\'Azur',
  'Occitanie',
  'Nouvelle-Aquitaine',
  'Hauts-de-France',
  'Grand Est',
  'Bretagne',
  'Pays de la Loire',
  'Normandie',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
  'Corse',
] as const;

/**
 * Validation patterns
 */
export const VALIDATION = {
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  LINKEDIN_URL_PATTERN: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  GITHUB_URL_PATTERN: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
  CREDENTIAL_URL_PATTERN: /^https?:\/\/.+/,
} as const;

/**
 * Cache TTL in seconds
 */
export const CACHE_TTL = {
  SKILL_LIST: 3600,        // 1 hour
  PROFILE_SEARCH: 300,     // 5 minutes
  PROFILE_DETAIL: 60,      // 1 minute
  COMPLETENESS: 300,       // 5 minutes
} as const;
