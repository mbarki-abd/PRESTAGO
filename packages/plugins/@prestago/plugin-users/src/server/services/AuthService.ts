// =============================================================================
// PRESTAGO - Plugin Users - Authentication Service
// =============================================================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Database } from '@nocobase/database';
import {
  IUser,
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
  IJwtPayload,
  UserType,
  UserStatus,
  OrganizationType,
  OrganizationStatus,
  OrganizationRole,
} from '../../shared/types';
import { COLLECTIONS, TOKEN_EXPIRATION, PASSWORD_REQUIREMENTS } from '../../shared/constants';

const SALT_ROUNDS = 12;

export class AuthService {
  private db: Database;
  private jwtSecret: string;
  private jwtExpiration: string;
  private refreshExpiration: string;

  constructor(db: Database) {
    this.db = db;
    this.jwtSecret = process.env.JWT_SECRET || 'prestago-dev-secret-change-in-prod';
    this.jwtExpiration = process.env.JWT_EXPIRATION || TOKEN_EXPIRATION.ACCESS_TOKEN;
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || TOKEN_EXPIRATION.REFRESH_TOKEN;
  }

  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password requirements
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
    }
    if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
      errors.push(`Password must be at most ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`);
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshExpiration,
    });
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): IJwtPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as IJwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Login user
   */
  async login(request: ILoginRequest): Promise<ILoginResponse> {
    const { email, password } = request;

    // Find user by email
    const userRepo = this.db.getRepository(COLLECTIONS.USERS);
    const user = await userRepo.findOne({
      filter: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(`Account is ${user.status}. Please contact support.`);
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Get user's primary organization
    const userOrgRepo = this.db.getRepository(COLLECTIONS.USER_ORGANIZATIONS);
    const primaryOrg = await userOrgRepo.findOne({
      filter: {
        user_id: user.id,
        is_primary: true,
      },
    });

    // Generate tokens
    const tokenPayload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      organizationId: primaryOrg?.organization_id,
      organizationRole: primaryOrg?.role,
    };

    const token = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Update last login
    await userRepo.update({
      filter: { id: user.id },
      values: { last_login_at: new Date() },
    });

    // Return response (exclude password)
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<IUser, 'password_hash'>,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + this.parseExpiration(this.jwtExpiration)),
    };
  }

  /**
   * Register new user
   */
  async register(request: IRegisterRequest): Promise<ILoginResponse> {
    const {
      email,
      password,
      first_name,
      last_name,
      user_type,
      phone,
      organization_name,
    } = request;

    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Check if email already exists
    const userRepo = this.db.getRepository(COLLECTIONS.USERS);
    const existingUser = await userRepo.findOne({
      filter: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Determine initial status
    const initialStatus = user_type === UserType.FREELANCE
      ? UserStatus.ACTIVE
      : UserStatus.PENDING;

    // Create user
    const user = await userRepo.create({
      values: {
        email: email.toLowerCase(),
        password_hash,
        first_name,
        last_name,
        phone,
        user_type,
        status: initialStatus,
        email_verified: false,
      },
    });

    // Create organization if needed (for ESN/Client admins)
    let organizationId: string | undefined;
    if (
      organization_name &&
      [UserType.ESN_ADMIN, UserType.CLIENT_ADMIN].includes(user_type)
    ) {
      const orgRepo = this.db.getRepository(COLLECTIONS.ORGANIZATIONS);
      const orgType = user_type === UserType.ESN_ADMIN
        ? OrganizationType.ESN
        : OrganizationType.CLIENT;

      const organization = await orgRepo.create({
        values: {
          name: organization_name,
          type: orgType,
          status: OrganizationStatus.PENDING,
        },
      });

      organizationId = organization.id;

      // Link user to organization
      const userOrgRepo = this.db.getRepository(COLLECTIONS.USER_ORGANIZATIONS);
      await userOrgRepo.create({
        values: {
          user_id: user.id,
          organization_id: organization.id,
          role: OrganizationRole.OWNER,
          is_primary: true,
          joined_at: new Date(),
        },
      });
    }

    // Generate tokens
    const tokenPayload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      organizationId,
    };

    const token = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Return response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<IUser, 'password_hash'>,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + this.parseExpiration(this.jwtExpiration)),
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresAt: Date }> {
    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    // Verify user still exists and is active
    const userRepo = this.db.getRepository(COLLECTIONS.USERS);
    const user = await userRepo.findOne({
      filter: { id: payload.userId },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const newPayload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      organizationId: payload.organizationId,
      organizationRole: payload.organizationRole,
    };

    const token = this.generateAccessToken(newPayload);

    return {
      token,
      expiresAt: new Date(Date.now() + this.parseExpiration(this.jwtExpiration)),
    };
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(token: string): Promise<Omit<IUser, 'password_hash'> | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const userRepo = this.db.getRepository(COLLECTIONS.USERS);
    const user = await userRepo.findOne({
      filter: { id: payload.userId },
      appends: ['organizations'],
    });

    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<IUser, 'password_hash'>;
  }

  /**
   * Parse expiration string to milliseconds
   */
  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export default AuthService;
