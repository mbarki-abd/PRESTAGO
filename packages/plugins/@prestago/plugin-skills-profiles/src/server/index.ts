// =============================================================================
// PRESTAGO - Plugin Skills & Profiles - Server Entry Point
// =============================================================================

import { Plugin } from '@nocobase/server';
import { collections } from './collections';
import { ProfileService } from './services/ProfileService';
import { SkillService } from './services/SkillService';
import { ProfileSearchService } from './services/ProfileSearchService';
import { PROFILE_EVENTS } from '../shared/types';
import { COLLECTIONS, API_PREFIX } from '../shared/constants';

export class PrestagoSkillsProfilesPlugin extends Plugin {
  private profileService!: ProfileService;
  private skillService!: SkillService;
  private searchService!: ProfileSearchService;

  get name() {
    return '@prestago/plugin-skills-profiles';
  }

  async afterAdd() {
    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin added');
  }

  async beforeLoad() {
    // Register collections
    for (const collection of collections) {
      this.db.collection(collection);
    }
    this.app.logger.info('[PRESTAGO] Skills & Profiles collections registered');
  }

  async load() {
    // Initialize services
    this.profileService = new ProfileService(this.db);
    this.skillService = new SkillService(this.db);
    this.searchService = new ProfileSearchService(this.db);

    // Register API routes
    this.registerRoutes();

    // Register event handlers
    this.registerEventHandlers();

    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin loaded');
  }

  /**
   * Register API routes
   */
  private registerRoutes() {
    const { resourcer } = this.app;

    // =========================================================================
    // Profile Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-profiles',
      actions: {
        // Get current user's profile
        me: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);

            ctx.body = {
              success: true,
              data: profile,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Create profile for current user
        createMine: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const values = ctx.action.params.values || {};
            const profile = await this.profileService.createProfile(userId, values);

            this.app.emit(PROFILE_EVENTS.PROFILE_CREATED, { profile });

            ctx.body = {
              success: true,
              data: profile,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Update current user's profile
        updateMine: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const values = ctx.action.params.values || {};
            const updated = await this.profileService.updateProfile(profile.id, values);

            this.app.emit(PROFILE_EVENTS.PROFILE_UPDATED, { profile: updated });

            ctx.body = {
              success: true,
              data: updated,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get profile by ID
        get: async (ctx, next) => {
          try {
            const { filterByTk } = ctx.action.params;
            const profile = await this.profileService.getProfileById(filterByTk);

            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            // Record view
            const viewerId = ctx.state.currentUser?.id;
            if (viewerId && viewerId !== (profile as any).user_id) {
              await this.profileService.recordProfileView(filterByTk, viewerId);
              this.app.emit(PROFILE_EVENTS.PROFILE_VIEWED, { profileId: filterByTk, viewerId });
            }

            ctx.body = {
              success: true,
              data: profile,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get profile by slug (public URL)
        getBySlug: async (ctx, next) => {
          try {
            const { slug } = ctx.action.params;
            const profile = await this.profileService.getProfileBySlug(slug);

            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            // Record view
            await this.profileService.recordProfileView(profile.id);

            ctx.body = {
              success: true,
              data: profile,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Search profiles
        search: async (ctx, next) => {
          try {
            const { filters = {}, page, pageSize, sortBy } = ctx.action.params;
            const organizationId = ctx.state.currentUser?.organizationId;

            const results = await this.searchService.searchProfiles(filters, {
              page,
              pageSize,
              sortBy,
              organizationId,
            });

            ctx.body = {
              success: true,
              ...results,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get completeness
        completeness: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const completeness = await this.profileService.recalculateCompleteness(profile.id);

            ctx.body = {
              success: true,
              data: completeness,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Activate profile
        activate: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const activated = await this.profileService.activateProfile(profile.id);

            this.app.emit(PROFILE_EVENTS.PROFILE_ACTIVATED, { profile: activated });

            ctx.body = {
              success: true,
              data: activated,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Deactivate profile
        deactivate: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const deactivated = await this.profileService.deactivateProfile(profile.id);

            this.app.emit(PROFILE_EVENTS.PROFILE_DEACTIVATED, { profile: deactivated });

            ctx.body = {
              success: true,
              data: deactivated,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Update availability
        updateAvailability: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const { status, available_from, days_per_week } = ctx.action.params.values || {};
            const updated = await this.profileService.updateAvailability(
              profile.id,
              status,
              available_from,
              days_per_week
            );

            this.app.emit(PROFILE_EVENTS.AVAILABILITY_CHANGED, { profile: updated });

            ctx.body = {
              success: true,
              data: updated,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get similar profiles
        similar: async (ctx, next) => {
          try {
            const { filterByTk, limit = 5 } = ctx.action.params;
            const results = await this.searchService.getSimilarProfiles(filterByTk, limit);

            ctx.body = {
              success: true,
              data: results,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },
      },
    });

    // =========================================================================
    // Skills Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-skills',
      actions: {
        // List all skills
        list: async (ctx, next) => {
          try {
            const repo = this.db.getRepository(COLLECTIONS.SKILLS);
            const { page = 1, pageSize = 50, filter, category } = ctx.action.params;

            const queryFilter: any = { ...filter };
            if (category) {
              queryFilter.category = category;
            }

            const [data, total] = await repo.findAndCount({
              filter: queryFilter,
              limit: pageSize,
              offset: (page - 1) * pageSize,
              sort: ['-usage_count', 'name'],
              appends: ['parent', 'children'],
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
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Search skills
        search: async (ctx, next) => {
          try {
            const { query, category, limit, validated_only } = ctx.action.params;

            if (!query || query.length < 2) {
              ctx.throw(400, 'Query must be at least 2 characters');
            }

            const skills = await this.skillService.searchSkills(query, {
              category,
              limit,
              validated_only,
            });

            ctx.body = {
              success: true,
              data: skills,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get skills grouped by category
        grouped: async (ctx, next) => {
          try {
            const grouped = await this.skillService.getSkillsGroupedByCategory();

            ctx.body = {
              success: true,
              data: grouped,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get popular skills
        popular: async (ctx, next) => {
          try {
            const { limit, category } = ctx.action.params;
            const skills = await this.skillService.getPopularSkills({ limit, category });

            ctx.body = {
              success: true,
              data: skills,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Create skill
        create: async (ctx, next) => {
          try {
            const values = ctx.action.params.values || {};
            const skill = await this.skillService.createSkill(values);

            this.app.emit(PROFILE_EVENTS.SKILL_CREATED, { skill });

            ctx.body = {
              success: true,
              data: skill,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Get skill by ID
        get: async (ctx, next) => {
          try {
            const { filterByTk } = ctx.action.params;
            const skill = await this.skillService.getSkillById(filterByTk);

            if (!skill) {
              ctx.throw(404, 'Skill not found');
            }

            ctx.body = {
              success: true,
              data: skill,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },
      },
    });

    // =========================================================================
    // Profile Skills Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-profile-skills',
      actions: {
        // Get my profile skills
        list: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const skills = await this.skillService.getProfileSkills(profile.id);

            ctx.body = {
              success: true,
              data: skills,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Add skill to profile
        add: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const { skill_id, level, years_experience, last_used_year, is_primary, is_highlighted } =
              ctx.action.params.values || {};

            await this.skillService.addSkillToProfile(profile.id, skill_id, {
              level,
              years_experience,
              last_used_year,
              is_primary,
              is_highlighted,
            });

            // Recalculate completeness
            await this.profileService.recalculateCompleteness(profile.id);

            const skills = await this.skillService.getProfileSkills(profile.id);

            ctx.body = {
              success: true,
              data: skills,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Update profile skill
        update: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const { skill_id, ...data } = ctx.action.params.values || {};
            await this.skillService.updateProfileSkill(profile.id, skill_id, data);

            const skills = await this.skillService.getProfileSkills(profile.id);

            ctx.body = {
              success: true,
              data: skills,
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Remove skill from profile
        remove: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const { skill_id } = ctx.action.params;
            await this.skillService.removeSkillFromProfile(profile.id, skill_id);

            // Recalculate completeness
            await this.profileService.recalculateCompleteness(profile.id);

            ctx.body = {
              success: true,
              message: 'Skill removed',
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },

        // Reorder skills
        reorder: async (ctx, next) => {
          try {
            const userId = ctx.state.currentUser?.id;
            if (!userId) {
              ctx.throw(401, 'Not authenticated');
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
              ctx.throw(404, 'Profile not found');
            }

            const { skill_ids } = ctx.action.params.values || {};
            await this.skillService.reorderProfileSkills(profile.id, skill_ids);

            ctx.body = {
              success: true,
              message: 'Skills reordered',
            };
          } catch (error: any) {
            ctx.throw(400, error.message);
          }
          await next();
        },
      },
    });

    // =========================================================================
    // Experiences Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-experiences',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EXPERIENCES);
          const { profile_id, page = 1, pageSize = 20 } = ctx.action.params;

          const filter: any = {};
          if (profile_id) {
            filter.profile_id = profile_id;
          }

          const [data, total] = await repo.findAndCount({
            filter,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            sort: ['-is_current', '-start_date'],
          });

          ctx.body = {
            success: true,
            data,
            meta: { total, page, pageSize },
          };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EXPERIENCES);
          const values = ctx.action.params.values || {};

          const experience = await repo.create({ values });

          this.app.emit(PROFILE_EVENTS.EXPERIENCE_ADDED, { experience });

          // Recalculate completeness
          if (values.profile_id) {
            await this.profileService.recalculateCompleteness(values.profile_id);
          }

          ctx.body = {
            success: true,
            data: experience,
          };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EXPERIENCES);
          const { filterByTk, values } = ctx.action.params;

          await repo.update({ filterByTk, values });
          const experience = await repo.findOne({ filterByTk });

          this.app.emit(PROFILE_EVENTS.EXPERIENCE_UPDATED, { experience });

          ctx.body = {
            success: true,
            data: experience,
          };
          await next();
        },

        destroy: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EXPERIENCES);
          const { filterByTk } = ctx.action.params;

          const experience = await repo.findOne({ filterByTk });
          await repo.destroy({ filterByTk });

          this.app.emit(PROFILE_EVENTS.EXPERIENCE_REMOVED, { experience });

          // Recalculate completeness
          if (experience?.profile_id) {
            await this.profileService.recalculateCompleteness((experience as any).profile_id);
          }

          ctx.body = {
            success: true,
            message: 'Experience deleted',
          };
          await next();
        },
      },
    });

    // =========================================================================
    // Educations Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-educations',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EDUCATIONS);
          const { profile_id } = ctx.action.params;

          const data = await repo.find({
            filter: profile_id ? { profile_id } : {},
            sort: ['-is_current', '-start_date'],
          });

          ctx.body = { success: true, data };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EDUCATIONS);
          const values = ctx.action.params.values || {};

          const education = await repo.create({ values });

          if (values.profile_id) {
            await this.profileService.recalculateCompleteness(values.profile_id);
          }

          ctx.body = { success: true, data: education };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EDUCATIONS);
          const { filterByTk, values } = ctx.action.params;

          await repo.update({ filterByTk, values });
          const education = await repo.findOne({ filterByTk });

          ctx.body = { success: true, data: education };
          await next();
        },

        destroy: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.EDUCATIONS);
          const { filterByTk } = ctx.action.params;

          const education = await repo.findOne({ filterByTk });
          await repo.destroy({ filterByTk });

          if (education?.profile_id) {
            await this.profileService.recalculateCompleteness((education as any).profile_id);
          }

          ctx.body = { success: true, message: 'Education deleted' };
          await next();
        },
      },
    });

    // =========================================================================
    // Certifications Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-certifications',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.CERTIFICATIONS);
          const { profile_id } = ctx.action.params;

          const data = await repo.find({
            filter: profile_id ? { profile_id } : {},
            sort: ['-issue_date'],
            appends: ['skill'],
          });

          ctx.body = { success: true, data };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.CERTIFICATIONS);
          const values = ctx.action.params.values || {};

          const certification = await repo.create({ values });

          this.app.emit(PROFILE_EVENTS.CERTIFICATION_ADDED, { certification });

          if (values.profile_id) {
            await this.profileService.recalculateCompleteness(values.profile_id);
          }

          ctx.body = { success: true, data: certification };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.CERTIFICATIONS);
          const { filterByTk, values } = ctx.action.params;

          await repo.update({ filterByTk, values });
          const certification = await repo.findOne({ filterByTk });

          ctx.body = { success: true, data: certification };
          await next();
        },

        destroy: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.CERTIFICATIONS);
          const { filterByTk } = ctx.action.params;

          const certification = await repo.findOne({ filterByTk });
          await repo.destroy({ filterByTk });

          if (certification?.profile_id) {
            await this.profileService.recalculateCompleteness((certification as any).profile_id);
          }

          ctx.body = { success: true, message: 'Certification deleted' };
          await next();
        },
      },
    });

    // =========================================================================
    // Languages Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-languages',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.LANGUAGES);
          const { profile_id } = ctx.action.params;

          const data = await repo.find({
            filter: profile_id ? { profile_id } : {},
            sort: ['-is_native', '-overall_level', 'sort_order'],
          });

          ctx.body = { success: true, data };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.LANGUAGES);
          const values = ctx.action.params.values || {};

          const language = await repo.create({ values });

          if (values.profile_id) {
            await this.profileService.recalculateCompleteness(values.profile_id);
          }

          ctx.body = { success: true, data: language };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.LANGUAGES);
          const { filterByTk, values } = ctx.action.params;

          await repo.update({ filterByTk, values });
          const language = await repo.findOne({ filterByTk });

          ctx.body = { success: true, data: language };
          await next();
        },

        destroy: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.LANGUAGES);
          const { filterByTk } = ctx.action.params;

          const language = await repo.findOne({ filterByTk });
          await repo.destroy({ filterByTk });

          if (language?.profile_id) {
            await this.profileService.recalculateCompleteness((language as any).profile_id);
          }

          ctx.body = { success: true, message: 'Language deleted' };
          await next();
        },
      },
    });

    // =========================================================================
    // Profile Documents Routes
    // =========================================================================
    resourcer.define({
      name: 'prestago-profile-documents',
      actions: {
        list: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.PROFILE_DOCUMENTS);
          const { profile_id } = ctx.action.params;

          const data = await repo.find({
            filter: profile_id ? { profile_id } : {},
            sort: ['-is_primary_cv', 'type', 'sort_order'],
          });

          ctx.body = { success: true, data };
          await next();
        },

        create: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.PROFILE_DOCUMENTS);
          const values = ctx.action.params.values || {};

          // If setting as primary CV, unset other primary CVs
          if (values.is_primary_cv && values.profile_id) {
            await repo.update({
              filter: { profile_id: values.profile_id, is_primary_cv: true },
              values: { is_primary_cv: false },
            });
          }

          const document = await repo.create({
            values: {
              ...values,
              uploaded_at: new Date(),
            },
          });

          if (values.profile_id) {
            await this.profileService.recalculateCompleteness(values.profile_id);
          }

          ctx.body = { success: true, data: document };
          await next();
        },

        update: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.PROFILE_DOCUMENTS);
          const { filterByTk, values } = ctx.action.params;

          // If setting as primary CV, unset other primary CVs
          if (values.is_primary_cv) {
            const doc = await repo.findOne({ filterByTk });
            if (doc?.profile_id) {
              await repo.update({
                filter: { profile_id: (doc as any).profile_id, is_primary_cv: true },
                values: { is_primary_cv: false },
              });
            }
          }

          await repo.update({ filterByTk, values });
          const document = await repo.findOne({ filterByTk });

          ctx.body = { success: true, data: document };
          await next();
        },

        destroy: async (ctx, next) => {
          const repo = this.db.getRepository(COLLECTIONS.PROFILE_DOCUMENTS);
          const { filterByTk } = ctx.action.params;

          const document = await repo.findOne({ filterByTk });
          await repo.destroy({ filterByTk });

          if (document?.profile_id) {
            await this.profileService.recalculateCompleteness((document as any).profile_id);
          }

          ctx.body = { success: true, message: 'Document deleted' };
          await next();
        },
      },
    });

    this.app.logger.info('[PRESTAGO] Skills & Profiles routes registered');
  }

  /**
   * Register event handlers
   */
  private registerEventHandlers() {
    // Profile events
    this.app.on(PROFILE_EVENTS.PROFILE_CREATED, ({ profile }) => {
      this.app.logger.info(`[PRESTAGO] Profile created: ${profile.id}`);
    });

    this.app.on(PROFILE_EVENTS.PROFILE_ACTIVATED, ({ profile }) => {
      this.app.logger.info(`[PRESTAGO] Profile activated: ${profile.id}`);
    });

    this.app.on(PROFILE_EVENTS.PROFILE_VIEWED, ({ profileId, viewerId }) => {
      this.app.logger.debug(`[PRESTAGO] Profile ${profileId} viewed by ${viewerId}`);
    });

    // Skill events
    this.app.on(PROFILE_EVENTS.SKILL_CREATED, ({ skill }) => {
      this.app.logger.info(`[PRESTAGO] Skill created: ${skill.name}`);
    });

    // Listen to user events from users plugin
    this.app.on('user:created', async ({ user }) => {
      // Auto-create profile for freelance users
      if (user.user_type === 'freelance') {
        try {
          await this.profileService.createProfile(user.id, {
            title: 'Consultant',
          });
          this.app.logger.info(`[PRESTAGO] Auto-created profile for user: ${user.email}`);
        } catch (error) {
          this.app.logger.error(`[PRESTAGO] Failed to create profile for user: ${user.email}`);
        }
      }
    });
  }

  async install() {
    // Seed initial skills data
    await this.seedInitialSkills();
    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin installed');
  }

  /**
   * Seed initial skills data
   */
  private async seedInitialSkills() {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const count = await repo.count();

    if (count > 0) {
      return; // Already seeded
    }

    const skills = [
      // Technical - Frontend
      { name: 'JavaScript', category: 'technical', subcategory: 'frontend' },
      { name: 'TypeScript', category: 'technical', subcategory: 'frontend' },
      { name: 'React', category: 'technical', subcategory: 'frontend' },
      { name: 'Vue.js', category: 'technical', subcategory: 'frontend' },
      { name: 'Angular', category: 'technical', subcategory: 'frontend' },
      { name: 'HTML5', category: 'technical', subcategory: 'frontend' },
      { name: 'CSS3', category: 'technical', subcategory: 'frontend' },
      { name: 'Tailwind CSS', category: 'technical', subcategory: 'frontend' },

      // Technical - Backend
      { name: 'Node.js', category: 'technical', subcategory: 'backend' },
      { name: 'Python', category: 'technical', subcategory: 'backend' },
      { name: 'Java', category: 'technical', subcategory: 'backend' },
      { name: 'PHP', category: 'technical', subcategory: 'backend' },
      { name: 'C#', category: 'technical', subcategory: 'backend' },
      { name: 'Go', category: 'technical', subcategory: 'backend' },
      { name: 'Rust', category: 'technical', subcategory: 'backend' },

      // Technical - Database
      { name: 'PostgreSQL', category: 'technical', subcategory: 'database' },
      { name: 'MySQL', category: 'technical', subcategory: 'database' },
      { name: 'MongoDB', category: 'technical', subcategory: 'database' },
      { name: 'Redis', category: 'technical', subcategory: 'database' },
      { name: 'Elasticsearch', category: 'technical', subcategory: 'database' },

      // Technical - Cloud
      { name: 'AWS', category: 'technical', subcategory: 'cloud' },
      { name: 'Azure', category: 'technical', subcategory: 'cloud' },
      { name: 'Google Cloud', category: 'technical', subcategory: 'cloud' },
      { name: 'Docker', category: 'technical', subcategory: 'devops' },
      { name: 'Kubernetes', category: 'technical', subcategory: 'devops' },

      // Functional
      { name: 'Project Management', category: 'functional', subcategory: 'project_management' },
      { name: 'Product Management', category: 'functional', subcategory: 'product' },
      { name: 'Business Analysis', category: 'functional', subcategory: 'business_analysis' },
      { name: 'Agile/Scrum', category: 'methodology', subcategory: 'agile' },
      { name: 'SAFe', category: 'methodology', subcategory: 'agile' },

      // Soft Skills
      { name: 'Leadership', category: 'soft_skill', subcategory: 'leadership' },
      { name: 'Communication', category: 'soft_skill', subcategory: 'communication' },
      { name: 'Problem Solving', category: 'soft_skill', subcategory: 'problem_solving' },

      // Certifications
      { name: 'AWS Solutions Architect', category: 'certification', subcategory: 'aws' },
      { name: 'Azure Administrator', category: 'certification', subcategory: 'azure' },
      { name: 'PMP', category: 'certification', subcategory: 'pmp' },
      { name: 'Scrum Master (PSM)', category: 'certification', subcategory: 'scrum' },
    ];

    for (const skill of skills) {
      try {
        await this.skillService.createSkill({
          ...skill,
          is_validated: true,
        } as any);
      } catch (error) {
        // Skip duplicates
      }
    }

    this.app.logger.info('[PRESTAGO] Initial skills seeded');
  }

  async afterEnable() {
    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin enabled');
  }

  async afterDisable() {
    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin disabled');
  }

  async remove() {
    this.app.logger.info('[PRESTAGO] Skills & Profiles plugin removed');
  }
}

export default PrestagoSkillsProfilesPlugin;
