// =============================================================================
// PRESTAGO - Plugin Users - Shared Types
// =============================================================================

/**
 * User types in the platform
 */
export enum UserType {
  FREELANCE = 'freelance',
  ESN_ADMIN = 'esn_admin',
  ESN_COMMERCIAL = 'esn_commercial',
  CLIENT_ADMIN = 'client_admin',
  CLIENT_MANAGER = 'client_manager',
  PLATFORM_ADMIN = 'platform_admin',
}

/**
 * User account status
 */
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

/**
 * Organization types
 */
export enum OrganizationType {
  ESN = 'esn',
  CLIENT = 'client',
  PLATFORM = 'platform',
}

/**
 * Organization status
 */
export enum OrganizationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

/**
 * User role within an organization
 */
export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

/**
 * User entity interface
 */
export interface IUser {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: UserType;
  status: UserStatus;
  email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Organization entity interface
 */
export interface IOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  legal_name?: string;
  siret?: string;
  vat_number?: string;
  address?: IAddress;
  logo_url?: string;
  website?: string;
  status: OrganizationStatus;
  parent_id?: string;
  settings?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Address structure
 */
export interface IAddress {
  street?: string;
  city?: string;
  postal_code?: string;
  country: string;
}

/**
 * User-Organization relationship
 */
export interface IUserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  is_primary: boolean;
  joined_at: Date;
}

/**
 * JWT Token payload
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  userType: UserType;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  iat?: number;
  exp?: number;
}

/**
 * Login request
 */
export interface ILoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface ILoginResponse {
  user: Omit<IUser, 'password_hash'>;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Register request
 */
export interface IRegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  phone?: string;
  organization_name?: string; // For ESN/Client admins
}

/**
 * Permission definition
 */
export interface IPermission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, unknown>;
}

/**
 * Role with permissions
 */
export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions: IPermission[];
  is_system: boolean;
  created_at: Date;
}

/**
 * Events emitted by the users plugin
 */
export const USER_EVENTS = {
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_PASSWORD_RESET: 'user:password_reset',
  USER_EMAIL_VERIFIED: 'user:email_verified',
  ORGANIZATION_CREATED: 'organization:created',
  ORGANIZATION_UPDATED: 'organization:updated',
  ORGANIZATION_VERIFIED: 'organization:verified',
  USER_JOINED_ORGANIZATION: 'user:joined_organization',
  USER_LEFT_ORGANIZATION: 'user:left_organization',
} as const;

export type UserEventType = typeof USER_EVENTS[keyof typeof USER_EVENTS];
