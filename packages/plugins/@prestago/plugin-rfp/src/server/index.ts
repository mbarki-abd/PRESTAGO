// =============================================================================
// PRESTAGO - Plugin RFP (Request for Proposals) - Server Entry Point
// =============================================================================

import { Plugin } from '@nocobase/server';
import path from 'path';

// Collections
import rfps from './collections/rfps';
import rfpSkillRequirements from './collections/rfp-skill-requirements';
import rfpDocuments from './collections/rfp-documents';
import rfpQuestions from './collections/rfp-questions';
import rfpInvitations from './collections/rfp-invitations';
import rfpHistory from './collections/rfp-history';
import rfpViews from './collections/rfp-views';
import rfpSaved from './collections/rfp-saved';

// Services
import { RFPService } from './services/RFPService';
import { RFPSkillService } from './services/RFPSkillService';
import { RFPSearchService } from './services/RFPSearchService';
import { RFPMatchingService } from './services/RFPMatchingService';
import { RFPQuestionService } from './services/RFPQuestionService';
import { RFPInvitationService } from './services/RFPInvitationService';

import { COLLECTIONS, API_PREFIX } from '../shared/constants';

export class PrestagoRFPPlugin extends Plugin {
  private rfpService!: RFPService;
  private rfpSkillService!: RFPSkillService;
  private rfpSearchService!: RFPSearchService;
  private rfpMatchingService!: RFPMatchingService;
  private rfpQuestionService!: RFPQuestionService;
  private rfpInvitationService!: RFPInvitationService;

  afterAdd() {}

  beforeLoad() {}

  async load() {
    // Register collections
    this.db.collection(rfps);
    this.db.collection(rfpSkillRequirements);
    this.db.collection(rfpDocuments);
    this.db.collection(rfpQuestions);
    this.db.collection(rfpInvitations);
    this.db.collection(rfpHistory);
    this.db.collection(rfpViews);
    this.db.collection(rfpSaved);

    // Initialize services
    this.rfpService = new RFPService(this.db, this.app);
    this.rfpSkillService = new RFPSkillService(this.db, this.app);
    this.rfpSearchService = new RFPSearchService(this.db);
    this.rfpMatchingService = new RFPMatchingService(this.db, this.app);
    this.rfpQuestionService = new RFPQuestionService(this.db, this.app);
    this.rfpInvitationService = new RFPInvitationService(this.db, this.app);

    // Register routes
    this.registerRoutes();

    this.app.logger.info('PRESTAGO RFP Plugin loaded');
  }

  private registerRoutes() {
    const router = this.app.resourcer.router;

    // =========================================================================
    // RFP CRUD & Status Routes
    // =========================================================================

    // List/Search RFPs
    router.get(`${API_PREFIX}/rfps`, async (ctx) => {
      const { page, pageSize, sort, ...filters } = ctx.query;
      const userId = ctx.state?.currentUser?.id;
      const organizationId = ctx.state?.currentUser?.organizationId;

      const result = await this.rfpSearchService.searchRFPs(filters as any, {
        page: parseInt(page as string) || 1,
        pageSize: parseInt(pageSize as string) || 20,
        sort: sort ? (sort as string).split(',') : undefined,
        userId,
        organizationId,
      });

      ctx.body = result;
    });

    // Get published RFPs (public)
    router.get(`${API_PREFIX}/rfps/published`, async (ctx) => {
      const { page, pageSize } = ctx.query;

      const result = await this.rfpSearchService.getPublishedRFPs({
        page: parseInt(page as string) || 1,
        pageSize: parseInt(pageSize as string) || 20,
      });

      ctx.body = result;
    });

    // Get my RFPs (created by current user)
    router.get(`${API_PREFIX}/rfps/mine`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      const rfps = await this.rfpService.getRFPsByUser(userId);
      ctx.body = rfps;
    });

    // Get organization RFPs
    router.get(`${API_PREFIX}/rfps/organization/:orgId`, async (ctx) => {
      const { orgId } = ctx.params;
      const rfps = await this.rfpService.getRFPsByOrganization(orgId);
      ctx.body = rfps;
    });

    // Get trending RFPs
    router.get(`${API_PREFIX}/rfps/trending`, async (ctx) => {
      const limit = parseInt(ctx.query.limit as string) || 10;
      const rfps = await this.rfpSearchService.getTrendingRFPs(limit);
      ctx.body = rfps;
    });

    // Get recent RFPs
    router.get(`${API_PREFIX}/rfps/recent`, async (ctx) => {
      const limit = parseInt(ctx.query.limit as string) || 10;
      const rfps = await this.rfpSearchService.getRecentRFPs(limit);
      ctx.body = rfps;
    });

    // Get closing soon RFPs
    router.get(`${API_PREFIX}/rfps/closing-soon`, async (ctx) => {
      const days = parseInt(ctx.query.days as string) || 7;
      const limit = parseInt(ctx.query.limit as string) || 10;
      const rfps = await this.rfpSearchService.getClosingSoonRFPs(days, limit);
      ctx.body = rfps;
    });

    // Get search facets
    router.get(`${API_PREFIX}/rfps/facets`, async (ctx) => {
      const facets = await this.rfpSearchService.getSearchFacets();
      ctx.body = facets;
    });

    // Create RFP
    router.post(`${API_PREFIX}/rfps`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const rfp = await this.rfpService.createRFP(ctx.request.body, userId);
        ctx.status = 201;
        ctx.body = rfp;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get single RFP
    router.get(`${API_PREFIX}/rfps/:id`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      const rfp = await this.rfpService.getRFPById(id);
      if (!rfp) {
        ctx.status = 404;
        ctx.body = { error: 'RFP not found' };
        return;
      }

      // Record view
      if (userId) {
        await this.rfpService.recordView(id, {
          userId,
          profileId: ctx.state?.currentUser?.profileId,
          organizationId: ctx.state?.currentUser?.organizationId,
          ipAddress: ctx.ip,
          userAgent: ctx.headers['user-agent'],
          referer: ctx.headers['referer'],
        });
      }

      ctx.body = rfp;
    });

    // Update RFP
    router.put(`${API_PREFIX}/rfps/:id`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const rfp = await this.rfpService.updateRFP(id, ctx.request.body, userId);
        ctx.body = rfp;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Change RFP status
    router.post(`${API_PREFIX}/rfps/:id/status`, async (ctx) => {
      const { id } = ctx.params;
      const { status, comment } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const rfp = await this.rfpService.changeStatus(id, status, userId, comment);
        ctx.body = rfp;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Publish RFP
    router.post(`${API_PREFIX}/rfps/:id/publish`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const rfp = await this.rfpService.publishRFP(id, userId);
        ctx.body = rfp;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Cancel RFP
    router.post(`${API_PREFIX}/rfps/:id/cancel`, async (ctx) => {
      const { id } = ctx.params;
      const { reason } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const rfp = await this.rfpService.cancelRFP(id, userId, reason);
        ctx.body = rfp;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get RFP statistics
    router.get(`${API_PREFIX}/rfps/stats`, async (ctx) => {
      const organizationId = ctx.query.organizationId as string;
      const stats = await this.rfpService.getRFPStats(organizationId);
      ctx.body = stats;
    });

    // =========================================================================
    // RFP Skills Routes
    // =========================================================================

    // Get RFP skills
    router.get(`${API_PREFIX}/rfps/:id/skills`, async (ctx) => {
      const { id } = ctx.params;
      const skills = await this.rfpSkillService.getSkillRequirements(id);
      ctx.body = skills;
    });

    // Add skill to RFP
    router.post(`${API_PREFIX}/rfps/:id/skills`, async (ctx) => {
      const { id } = ctx.params;
      const { skill_id, ...data } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      try {
        const skill = await this.rfpSkillService.addSkillRequirement(id, skill_id, data, userId);
        ctx.status = 201;
        ctx.body = skill;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Update skill requirement
    router.put(`${API_PREFIX}/rfps/:rfpId/skills/:skillId`, async (ctx) => {
      const { rfpId, skillId } = ctx.params;

      try {
        const skill = await this.rfpSkillService.updateSkillRequirement(rfpId, skillId, ctx.request.body as any);
        ctx.body = skill;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Remove skill from RFP
    router.delete(`${API_PREFIX}/rfps/:rfpId/skills/:skillId`, async (ctx) => {
      const { rfpId, skillId } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      await this.rfpSkillService.removeSkillRequirement(rfpId, skillId, userId);
      ctx.status = 204;
    });

    // Bulk add skills
    router.post(`${API_PREFIX}/rfps/:id/skills/bulk`, async (ctx) => {
      const { id } = ctx.params;
      const { skills } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      const results = await this.rfpSkillService.bulkAddSkills(id, skills, userId);
      ctx.body = results;
    });

    // Get skill statistics
    router.get(`${API_PREFIX}/rfps/skills/stats`, async (ctx) => {
      const organizationId = ctx.query.organizationId as string;
      const stats = await this.rfpSkillService.getSkillStats(organizationId);
      ctx.body = stats;
    });

    // =========================================================================
    // RFP Matching Routes
    // =========================================================================

    // Calculate match score
    router.get(`${API_PREFIX}/rfps/:rfpId/match/:profileId`, async (ctx) => {
      const { rfpId, profileId } = ctx.params;

      try {
        const score = await this.rfpMatchingService.calculateMatchScore(profileId, rfpId);
        ctx.body = score;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Find matching profiles for RFP
    router.get(`${API_PREFIX}/rfps/:id/matching-profiles`, async (ctx) => {
      const { id } = ctx.params;
      const { minScore, limit, excludeMissingMandatory } = ctx.query;

      try {
        const matches = await this.rfpMatchingService.findMatchingProfiles(id, {
          minScore: parseInt(minScore as string) || undefined,
          limit: parseInt(limit as string) || undefined,
          excludeMissingMandatory: excludeMissingMandatory === 'true',
        });
        ctx.body = matches;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Find matching RFPs for profile
    router.get(`${API_PREFIX}/profiles/:profileId/matching-rfps`, async (ctx) => {
      const { profileId } = ctx.params;
      const { minScore, limit } = ctx.query;

      try {
        const matches = await this.rfpMatchingService.findMatchingRFPs(profileId, {
          minScore: parseInt(minScore as string) || undefined,
          limit: parseInt(limit as string) || undefined,
        });
        ctx.body = matches;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get match recommendations
    router.get(`${API_PREFIX}/rfps/:rfpId/recommendations/:profileId`, async (ctx) => {
      const { rfpId, profileId } = ctx.params;

      try {
        const recommendations = await this.rfpMatchingService.getMatchRecommendations(profileId, rfpId);
        ctx.body = { recommendations };
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get similar RFPs
    router.get(`${API_PREFIX}/rfps/:id/similar`, async (ctx) => {
      const { id } = ctx.params;
      const limit = parseInt(ctx.query.limit as string) || 5;

      const similar = await this.rfpSearchService.getSimilarRFPs(id, limit);
      ctx.body = similar;
    });

    // =========================================================================
    // RFP Questions Routes
    // =========================================================================

    // Get questions for RFP
    router.get(`${API_PREFIX}/rfps/:id/questions`, async (ctx) => {
      const { id } = ctx.params;
      const { publicOnly, answered } = ctx.query;

      const questions = await this.rfpQuestionService.getQuestionsByRFP(id, {
        publicOnly: publicOnly === 'true',
        answered: answered === undefined ? undefined : answered === 'true',
      });
      ctx.body = questions;
    });

    // Get public Q&A
    router.get(`${API_PREFIX}/rfps/:id/qa`, async (ctx) => {
      const { id } = ctx.params;
      const qa = await this.rfpQuestionService.getPublicQA(id);
      ctx.body = qa;
    });

    // Ask a question
    router.post(`${API_PREFIX}/rfps/:id/questions`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;
      const organizationId = ctx.state?.currentUser?.organizationId;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const question = await this.rfpQuestionService.askQuestion(
          id,
          ctx.request.body as any,
          userId,
          organizationId
        );
        ctx.status = 201;
        ctx.body = question;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Answer a question
    router.post(`${API_PREFIX}/rfp-questions/:questionId/answer`, async (ctx) => {
      const { questionId } = ctx.params;
      const { answer } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const question = await this.rfpQuestionService.answerQuestion(questionId, answer, userId);
        ctx.body = question;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Delete question
    router.delete(`${API_PREFIX}/rfp-questions/:questionId`, async (ctx) => {
      const { questionId } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        await this.rfpQuestionService.deleteQuestion(questionId, userId);
        ctx.status = 204;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // =========================================================================
    // RFP Invitations Routes
    // =========================================================================

    // Get invitations for RFP
    router.get(`${API_PREFIX}/rfps/:id/invitations`, async (ctx) => {
      const { id } = ctx.params;
      const { status } = ctx.query;

      const invitations = await this.rfpInvitationService.getInvitationsByRFP(id, {
        status: status as string,
      });
      ctx.body = invitations;
    });

    // Send invitation
    router.post(`${API_PREFIX}/rfps/:id/invitations`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const invitation = await this.rfpInvitationService.sendInvitation(
          id,
          ctx.request.body as any,
          userId
        );
        ctx.status = 201;
        ctx.body = invitation;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Bulk invite
    router.post(`${API_PREFIX}/rfps/:id/invitations/bulk`, async (ctx) => {
      const { id } = ctx.params;
      const { profileIds, message } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      const results = await this.rfpInvitationService.bulkInviteProfiles(id, profileIds, message, userId);
      ctx.body = results;
    });

    // Accept invitation
    router.post(`${API_PREFIX}/rfp-invitations/:invitationId/accept`, async (ctx) => {
      const { invitationId } = ctx.params;

      try {
        const invitation = await this.rfpInvitationService.acceptInvitation(invitationId);
        ctx.body = invitation;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Decline invitation
    router.post(`${API_PREFIX}/rfp-invitations/:invitationId/decline`, async (ctx) => {
      const { invitationId } = ctx.params;

      try {
        const invitation = await this.rfpInvitationService.declineInvitation(invitationId);
        ctx.body = invitation;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get my invitations (profile)
    router.get(`${API_PREFIX}/rfp-invitations/my-profile`, async (ctx) => {
      const profileId = ctx.state?.currentUser?.profileId;
      if (!profileId) {
        ctx.status = 400;
        ctx.body = { error: 'Profile ID required' };
        return;
      }

      const invitations = await this.rfpInvitationService.getInvitationsForProfile(profileId);
      ctx.body = invitations;
    });

    // Get organization invitations
    router.get(`${API_PREFIX}/rfp-invitations/organization/:orgId`, async (ctx) => {
      const { orgId } = ctx.params;
      const invitations = await this.rfpInvitationService.getInvitationsForOrganization(orgId);
      ctx.body = invitations;
    });

    // Get invitation stats
    router.get(`${API_PREFIX}/rfps/:id/invitations/stats`, async (ctx) => {
      const { id } = ctx.params;
      const stats = await this.rfpInvitationService.getInvitationStats(id);
      ctx.body = stats;
    });

    // =========================================================================
    // RFP Saved/Bookmarks Routes
    // =========================================================================

    // Save RFP
    router.post(`${API_PREFIX}/rfps/:id/save`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;
      const profileId = ctx.state?.currentUser?.profileId;
      const { notes } = ctx.request.body as any;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      const saved = await this.rfpService.saveRFP(id, userId, profileId, notes);
      ctx.body = saved;
    });

    // Unsave RFP
    router.delete(`${API_PREFIX}/rfps/:id/save`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      await this.rfpService.unsaveRFP(id, userId);
      ctx.status = 204;
    });

    // Get saved RFPs
    router.get(`${API_PREFIX}/rfps/saved`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      const saved = await this.rfpService.getSavedRFPs(userId);
      ctx.body = saved;
    });
  }

  async install() {
    // Sync database collections
    await this.db.sync();
    this.app.logger.info('PRESTAGO RFP Plugin installed');
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PrestagoRFPPlugin;
