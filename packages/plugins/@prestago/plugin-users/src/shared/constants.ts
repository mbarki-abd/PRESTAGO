// =============================================================================
// PRESTAGO - Plugin Users - Constants
// =============================================================================

/**
 * Collection names
 */
export const COLLECTIONS = {
  USERS: 'prestago_users',
  ORGANIZATIONS: 'prestago_organizations',
  USER_ORGANIZATIONS: 'prestago_user_organizations',
  ROLES: 'prestago_roles',
  USER_ROLES: 'prestago_user_roles',
  SESSIONS: 'prestago_sessions',
  PASSWORD_RESETS: 'prestago_password_resets',
  EMAIL_VERIFICATIONS: 'prestago_email_verifications',
} as const;

/**
 * API routes prefix
 */
export const API_PREFIX = '/api/prestago';

/**
 * Auth routes
 */
export const AUTH_ROUTES = {
  LOGIN: `${API_PREFIX}/auth/login`,
  REGISTER: `${API_PREFIX}/auth/register`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
  RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
  VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
  ME: `${API_PREFIX}/auth/me`,
} as const;

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
} as const;

/**
 * Token expiration times
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '7d',
  REFRESH_TOKEN: '30d',
  PASSWORD_RESET: '1h',
  EMAIL_VERIFICATION: '24h',
} as const;

/**
 * Default pagination
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * SIRET validation regex (French company ID)
 */
export const SIRET_REGEX = /^[0-9]{14}$/;

/**
 * VAT number validation regex (European)
 */
export const VAT_REGEX = /^[A-Z]{2}[0-9A-Z]{2,12}$/;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (international)
 */
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Default system roles
 */
export const SYSTEM_ROLES = {
  PLATFORM_ADMIN: {
    name: 'Platform Administrator',
    description: 'Full access to all platform features',
  },
  CLIENT_ADMIN: {
    name: 'Client Administrator',
    description: 'Manage client organization and users',
  },
  CLIENT_MANAGER: {
    name: 'Client Manager',
    description: 'Manage RFPs and missions',
  },
  ESN_ADMIN: {
    name: 'ESN Administrator',
    description: 'Manage ESN organization and consultants',
  },
  ESN_COMMERCIAL: {
    name: 'ESN Commercial',
    description: 'Manage applications and missions',
  },
  FREELANCE: {
    name: 'Freelance',
    description: 'Individual consultant',
  },
} as const;

/**
 * Permission resources
 */
export const RESOURCES = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  PROFILES: 'profiles',
  RFP: 'rfp',
  APPLICATIONS: 'applications',
  MISSIONS: 'missions',
  TIMESHEETS: 'timesheets',
  INVOICES: 'invoices',
  CONTRACTS: 'contracts',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

/**
 * Permission actions
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // All actions
} as const;
