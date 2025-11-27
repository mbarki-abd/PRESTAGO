// =============================================================================
// PRESTAGO - Plugin Users - Server Entry Point
// =============================================================================

import { Plugin } from '@nocobase/server';
import { collections } from './collections';
import { AuthService } from './services/AuthService';
import { AUTH_ROUTES } from '../shared/constants';
import { USER_EVENTS } from '../shared/types';

export class PrestagoUsersPlugin extends Plugin {
  private authService!: AuthService;

  get name() {
    return '@prestago/plugin-users';
  }

  async afterAdd() {
    // Plugin added to application
    this.app.logger.info('[PRESTAGO] Users plugin added');
  }

  async beforeLoad() {
    // Register collections
    for (const collection of collections) {
      this.db.collection(collection);
    }
    this.app.logger.info('[PRESTAGO] Users collections registered');
  }

  async load() {
    // Initialize services
    this.authService = new AuthService(this.db);

    // Register API routes
    this.registerRoutes();

    // Register event handlers
    this.registerEventHandlers();

    this.app.logger.info('[PRESTAGO] Users plugin loaded');
  }

  /**
   * Register API routes
   */
  private registerRoutes() {
    const { resourcer } = this.app;

    // =========================================================================
    // Authentication Routes
    // =========================================================================

    // POST /api/prestago/auth/login
    resourcer.define({
      name: 'prestago-auth',
      actions: {
        login: async (ctx, next) => {
          try {
            const { email, password } = ctx.action.params.values || {};

            if (!email || !password) {
              ctx.throw(400, 'Email and password are required');
            }

            const result = await this.authService.login({ email, password });

            ctx.body = {
              success: true,
              data: result,
            };
          } catch (error: any) {
            ctx.throw(401, error.message);
          }
          await next();
        },

        register: async (ctx, next) => {
          try {
            const values = ctx.action.params.values || {};

            if (!values.email || !values.password || !values.first_name || !values.last_name) {
              ctx.throw(400, 'Email, password, first name and last name are required');
            }

            const result = await this.authService.register(values);

            // Emit user created event
            this.app.emit(USER_EVENTS.USER_CREATED, { user: result.user });

            ctx.body = {
              success: true,
              data: result,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        me: async (ctx, next) => {
          try {
            const token = ctx.get('Authorization')?.replace('Bearer ', '');

            if (!token) {
              ctx.throw(401, 'No token provided');
            }

            const user = await this.authService.getCurrentUser(token);

            if (!user) {
              ctx.throw(401, 'Invalid token');
            }

            ctx.body = {
              success: true,
              data: user,
            };
          } catch (error: any) {
            ctx.throw(401, error.message);
          }
          await next();
        },

        refresh: async (ctx, next) => {
          try {
            const { refreshToken } = ctx.action.params.values || {};

            if (!refreshToken) {
              ctx.throw(400, 'Refresh token is required');
            }

            const result = await this.authService.refreshToken(refreshToken);

            ctx.body = {
              success: true,
              data: result,
            };
          } catch (error: any) {
            ctx.throw(401, error.message);
          }
          await next();
        },

        logout: async (ctx, next) => {
          // For stateless JWT, we just acknowledge the logout
          // In a production system, you might want to invalidate the token
          ctx.body = {
            success: true,
            message: 'Logged out successfully',
          };
          await next();
        },
      },
    });

    // =========================================================================
    // Users Resource Routes
    // =========================================================================

    resourcer.define({
      name: 'prestago-users',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_users');
          const { page = 1, pageSize = 20, filter } = ctx.action.params;

          const [data, total] = await repo.findAndCount({
            filter,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            appends: ['organizations'],
          });

          // Remove password from response
          const users = data.map((user: any) => {
            const { password_hash, ...rest } = user.toJSON();
            return rest;
          });

          ctx.body = {
            success: true,
            data: users,
            meta: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
            },
          };
          await next();
        },

        get: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_users');
          const { filterByTk } = ctx.action.params;

          const user = await repo.findOne({
            filterByTk,
            appends: ['organizations'],
          });

          if (!user) {
            ctx.throw(404, 'User not found');
          }

          const { password_hash, ...rest } = user.toJSON();

          ctx.body = {
            success: true,
            data: rest,
          };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_users');
          const { filterByTk, values } = ctx.action.params;

          // Don't allow password update through this endpoint
          delete values.password_hash;
          delete values.password;

          await repo.update({
            filterByTk,
            values,
          });

          const user = await repo.findOne({ filterByTk });
          const { password_hash, ...rest } = user.toJSON();

          this.app.emit(USER_EVENTS.USER_UPDATED, { user: rest });

          ctx.body = {
            success: true,
            data: rest,
          };
          await next();
        },
      },
    });

    // =========================================================================
    // Organizations Resource Routes
    // =========================================================================

    resourcer.define({
      name: 'prestago-organizations',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_organizations');
          const { page = 1, pageSize = 20, filter } = ctx.action.params;

          const [data, total] = await repo.findAndCount({
            filter,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            appends: ['users', 'parent', 'children'],
          });

          ctx.body = {
            success: true,
            data,
            meta: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
            },
          };
          await next();
        },

        get: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_organizations');
          const { filterByTk } = ctx.action.params;

          const organization = await repo.findOne({
            filterByTk,
            appends: ['users', 'parent', 'children'],
          });

          if (!organization) {
            ctx.throw(404, 'Organization not found');
          }

          ctx.body = {
            success: true,
            data: organization,
          };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_organizations');
          const { values } = ctx.action.params;

          const organization = await repo.create({ values });

          this.app.emit(USER_EVENTS.ORGANIZATION_CREATED, { organization });

          ctx.body = {
            success: true,
            data: organization,
          };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository('prestago_organizations');
          const { filterByTk, values } = ctx.action.params;

          await repo.update({
            filterByTk,
            values,
          });

          const organization = await repo.findOne({ filterByTk });

          this.app.emit(USER_EVENTS.ORGANIZATION_UPDATED, { organization });

          ctx.body = {
            success: true,
            data: organization,
          };
          await next();
        },
      },
    });

    this.app.logger.info('[PRESTAGO] Users routes registered');
  }

  /**
   * Register event handlers
   */
  private registerEventHandlers() {
    // Log user events
    this.app.on(USER_EVENTS.USER_CREATED, ({ user }) => {
      this.app.logger.info(`[PRESTAGO] User created: ${user.email}`);
    });

    this.app.on(USER_EVENTS.USER_LOGIN, ({ user }) => {
      this.app.logger.info(`[PRESTAGO] User logged in: ${user.email}`);
    });

    this.app.on(USER_EVENTS.ORGANIZATION_CREATED, ({ organization }) => {
      this.app.logger.info(`[PRESTAGO] Organization created: ${organization.name}`);
    });
  }

  async install() {
    // Run on first install
    this.app.logger.info('[PRESTAGO] Users plugin installed');
  }

  async afterEnable() {
    // Run after plugin is enabled
    this.app.logger.info('[PRESTAGO] Users plugin enabled');
  }

  async afterDisable() {
    // Run after plugin is disabled
    this.app.logger.info('[PRESTAGO] Users plugin disabled');
  }

  async remove() {
    // Run when plugin is removed
    this.app.logger.info('[PRESTAGO] Users plugin removed');
  }
}

export default PrestagoUsersPlugin;
