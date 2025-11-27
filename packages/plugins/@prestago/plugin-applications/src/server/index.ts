// =============================================================================
// PRESTAGO - Plugin Applications - Server Entry Point
// =============================================================================

import { Plugin } from '@nocobase/server';

// Collections
import applications from './collections/applications';
import applicationDocuments from './collections/application-documents';
import interviews from './collections/interviews';
import evaluations from './collections/evaluations';
import offers from './collections/offers';
import applicationHistory from './collections/application-history';
import applicationNotes from './collections/application-notes';

// Services
import { ApplicationService } from './services/ApplicationService';
import { InterviewService } from './services/InterviewService';
import { OfferService } from './services/OfferService';
import { EvaluationService } from './services/EvaluationService';

import { COLLECTIONS, API_PREFIX } from '../shared/constants';

export class PrestagoApplicationsPlugin extends Plugin {
  private applicationService!: ApplicationService;
  private interviewService!: InterviewService;
  private offerService!: OfferService;
  private evaluationService!: EvaluationService;

  afterAdd() {}

  beforeLoad() {}

  async load() {
    // Register collections
    this.db.collection(applications);
    this.db.collection(applicationDocuments);
    this.db.collection(interviews);
    this.db.collection(evaluations);
    this.db.collection(offers);
    this.db.collection(applicationHistory);
    this.db.collection(applicationNotes);

    // Initialize services
    this.applicationService = new ApplicationService(this.db, this.app);
    this.interviewService = new InterviewService(this.db, this.app);
    this.offerService = new OfferService(this.db, this.app);
    this.evaluationService = new EvaluationService(this.db, this.app);

    // Register routes
    this.registerRoutes();

    this.app.logger.info('PRESTAGO Applications Plugin loaded');
  }

  private registerRoutes() {
    const router = this.app.resourcer.router;

    // =========================================================================
    // Applications Routes
    // =========================================================================

    // List applications
    router.get(`${API_PREFIX}/applications`, async (ctx) => {
      const { rfp_id, profile_id, status } = ctx.query;
      const userId = ctx.state?.currentUser?.id;

      let applications;
      if (rfp_id) {
        applications = await this.applicationService.getApplicationsByRFP(rfp_id as string, {
          status: status ? (status as string).split(',') as any[] : undefined,
          includeProfile: true,
        });
      } else if (profile_id) {
        applications = await this.applicationService.getApplicationsByProfile(profile_id as string);
      } else {
        ctx.status = 400;
        ctx.body = { error: 'rfp_id or profile_id is required' };
        return;
      }

      ctx.body = applications;
    });

    // Get my applications
    router.get(`${API_PREFIX}/applications/mine`, async (ctx) => {
      const profileId = ctx.state?.currentUser?.profileId;
      if (!profileId) {
        ctx.status = 400;
        ctx.body = { error: 'Profile not found' };
        return;
      }

      const applications = await this.applicationService.getApplicationsByProfile(profileId);
      ctx.body = applications;
    });

    // Create application
    router.post(`${API_PREFIX}/applications`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.createApplication(ctx.request.body, userId);
        ctx.status = 201;
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get single application
    router.get(`${API_PREFIX}/applications/:id`, async (ctx) => {
      const { id } = ctx.params;
      const application = await this.applicationService.getApplicationById(id);

      if (!application) {
        ctx.status = 404;
        ctx.body = { error: 'Application not found' };
        return;
      }

      ctx.body = application;
    });

    // Update application
    router.put(`${API_PREFIX}/applications/:id`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.updateApplication(id, ctx.request.body, userId);
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Submit application
    router.post(`${API_PREFIX}/applications/:id/submit`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.submitApplication(id, userId);
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Change application status
    router.post(`${API_PREFIX}/applications/:id/status`, async (ctx) => {
      const { id } = ctx.params;
      const { status, comment } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.changeStatus(id, status, userId, comment);
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Reject application
    router.post(`${API_PREFIX}/applications/:id/reject`, async (ctx) => {
      const { id } = ctx.params;
      const { reason, category } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.rejectApplication(id, userId, reason, category);
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Withdraw application
    router.post(`${API_PREFIX}/applications/:id/withdraw`, async (ctx) => {
      const { id } = ctx.params;
      const { reason } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const application = await this.applicationService.withdrawApplication(id, userId, reason);
        ctx.body = application;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get application statistics
    router.get(`${API_PREFIX}/applications/stats`, async (ctx) => {
      const { rfp_id, organization_id } = ctx.query;
      const stats = await this.applicationService.getApplicationStats(
        rfp_id as string,
        organization_id as string
      );
      ctx.body = stats;
    });

    // =========================================================================
    // Interview Routes
    // =========================================================================

    // Schedule interview
    router.post(`${API_PREFIX}/interviews`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const interview = await this.interviewService.scheduleInterview(ctx.request.body as any, userId);
        ctx.status = 201;
        ctx.body = interview;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get interviews for application
    router.get(`${API_PREFIX}/applications/:id/interviews`, async (ctx) => {
      const { id } = ctx.params;
      const interviews = await this.interviewService.getInterviewsByApplication(id);
      ctx.body = interviews;
    });

    // Get upcoming interviews
    router.get(`${API_PREFIX}/interviews/upcoming`, async (ctx) => {
      const { rfp_id, days } = ctx.query;
      const interviews = await this.interviewService.getUpcomingInterviews({
        rfpId: rfp_id as string,
        days: parseInt(days as string) || 7,
      });
      ctx.body = interviews;
    });

    // Confirm interview
    router.post(`${API_PREFIX}/interviews/:id/confirm`, async (ctx) => {
      const { id } = ctx.params;

      try {
        const interview = await this.interviewService.confirmInterview(id);
        ctx.body = interview;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Complete interview
    router.post(`${API_PREFIX}/interviews/:id/complete`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const interview = await this.interviewService.completeInterview(id, ctx.request.body as any, userId);
        ctx.body = interview;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Cancel interview
    router.post(`${API_PREFIX}/interviews/:id/cancel`, async (ctx) => {
      const { id } = ctx.params;
      const { reason } = ctx.request.body as any;
      const userId = ctx.state?.currentUser?.id;

      try {
        const interview = await this.interviewService.cancelInterview(id, reason, userId);
        ctx.body = interview;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Reschedule interview
    router.post(`${API_PREFIX}/interviews/:id/reschedule`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const interview = await this.interviewService.rescheduleInterview(id, ctx.request.body as any, userId);
        ctx.body = interview;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get interview stats
    router.get(`${API_PREFIX}/interviews/stats`, async (ctx) => {
      const { rfp_id } = ctx.query;
      const stats = await this.interviewService.getInterviewStats(rfp_id as string);
      ctx.body = stats;
    });

    // =========================================================================
    // Offer Routes
    // =========================================================================

    // Create offer
    router.post(`${API_PREFIX}/offers`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const offer = await this.offerService.createOffer(ctx.request.body as any, userId);
        ctx.status = 201;
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get offer by ID
    router.get(`${API_PREFIX}/offers/:id`, async (ctx) => {
      const { id } = ctx.params;
      const offer = await this.offerService.getOfferById(id);

      if (!offer) {
        ctx.status = 404;
        ctx.body = { error: 'Offer not found' };
        return;
      }

      ctx.body = offer;
    });

    // Get offers for application
    router.get(`${API_PREFIX}/applications/:id/offers`, async (ctx) => {
      const { id } = ctx.params;
      const offers = await this.offerService.getOffersByApplication(id);
      ctx.body = offers;
    });

    // Get my offers (for profile)
    router.get(`${API_PREFIX}/offers/mine`, async (ctx) => {
      const profileId = ctx.state?.currentUser?.profileId;
      if (!profileId) {
        ctx.status = 400;
        ctx.body = { error: 'Profile not found' };
        return;
      }

      const offers = await this.offerService.getOffersByProfile(profileId);
      ctx.body = offers;
    });

    // Submit offer for approval
    router.post(`${API_PREFIX}/offers/:id/submit-approval`, async (ctx) => {
      const { id } = ctx.params;

      try {
        const offer = await this.offerService.submitForApproval(id);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Approve offer
    router.post(`${API_PREFIX}/offers/:id/approve`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const offer = await this.offerService.approveOffer(id, userId);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Send offer
    router.post(`${API_PREFIX}/offers/:id/send`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const offer = await this.offerService.sendOffer(id, userId);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // View offer (mark as viewed)
    router.post(`${API_PREFIX}/offers/:id/view`, async (ctx) => {
      const { id } = ctx.params;

      try {
        const offer = await this.offerService.markViewed(id);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Accept offer
    router.post(`${API_PREFIX}/offers/:id/accept`, async (ctx) => {
      const { id } = ctx.params;
      const { comments } = ctx.request.body as any;

      try {
        const offer = await this.offerService.acceptOffer(id, comments);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Decline offer
    router.post(`${API_PREFIX}/offers/:id/decline`, async (ctx) => {
      const { id } = ctx.params;
      const { reason } = ctx.request.body as any;

      try {
        const offer = await this.offerService.declineOffer(id, reason);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Withdraw offer
    router.post(`${API_PREFIX}/offers/:id/withdraw`, async (ctx) => {
      const { id } = ctx.params;
      const { reason } = ctx.request.body as any;

      try {
        const offer = await this.offerService.withdrawOffer(id, reason);
        ctx.body = offer;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get expiring offers
    router.get(`${API_PREFIX}/offers/expiring`, async (ctx) => {
      const { days } = ctx.query;
      const offers = await this.offerService.getExpiringOffers(parseInt(days as string) || 2);
      ctx.body = offers;
    });

    // Get offer stats
    router.get(`${API_PREFIX}/offers/stats`, async (ctx) => {
      const { rfp_id } = ctx.query;
      const stats = await this.offerService.getOfferStats(rfp_id as string);
      ctx.body = stats;
    });

    // =========================================================================
    // Evaluation Routes
    // =========================================================================

    // Submit evaluation
    router.post(`${API_PREFIX}/evaluations`, async (ctx) => {
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        const evaluation = await this.evaluationService.submitEvaluation(ctx.request.body as any, userId);
        ctx.status = 201;
        ctx.body = evaluation;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get evaluations for application
    router.get(`${API_PREFIX}/applications/:id/evaluations`, async (ctx) => {
      const { id } = ctx.params;
      const evaluations = await this.evaluationService.getEvaluationsByApplication(id);
      ctx.body = evaluations;
    });

    // Get evaluation summary
    router.get(`${API_PREFIX}/applications/:id/evaluation-summary`, async (ctx) => {
      const { id } = ctx.params;
      const summary = await this.evaluationService.getEvaluationSummary(id);
      ctx.body = summary || {};
    });

    // Get evaluation by ID
    router.get(`${API_PREFIX}/evaluations/:id`, async (ctx) => {
      const { id } = ctx.params;
      const evaluation = await this.evaluationService.getEvaluationById(id);

      if (!evaluation) {
        ctx.status = 404;
        ctx.body = { error: 'Evaluation not found' };
        return;
      }

      ctx.body = evaluation;
    });

    // Delete evaluation
    router.delete(`${API_PREFIX}/evaluations/:id`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      try {
        await this.evaluationService.deleteEvaluation(id, userId);
        ctx.status = 204;
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      }
    });

    // Get evaluation stats
    router.get(`${API_PREFIX}/evaluations/stats`, async (ctx) => {
      const { rfp_id } = ctx.query;
      const stats = await this.evaluationService.getEvaluationStats(rfp_id as string);
      ctx.body = stats;
    });

    // =========================================================================
    // Application Notes Routes
    // =========================================================================

    // Add note
    router.post(`${API_PREFIX}/applications/:id/notes`, async (ctx) => {
      const { id } = ctx.params;
      const userId = ctx.state?.currentUser?.id;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication required' };
        return;
      }

      const notesCollection = this.db.getCollection(COLLECTIONS.APPLICATION_NOTES);
      const { content, is_private, is_pinned } = ctx.request.body as any;

      const note = await notesCollection.repository.create({
        values: {
          application_id: id,
          author_id: userId,
          content,
          is_private: is_private ?? true,
          is_pinned: is_pinned ?? false,
        },
      });

      ctx.status = 201;
      ctx.body = note;
    });

    // Get notes for application
    router.get(`${API_PREFIX}/applications/:id/notes`, async (ctx) => {
      const { id } = ctx.params;
      const notesCollection = this.db.getCollection(COLLECTIONS.APPLICATION_NOTES);

      const notes = await notesCollection.repository.find({
        filter: { application_id: id },
        appends: ['author'],
        sort: ['-is_pinned', '-created_at'],
      });

      ctx.body = notes;
    });
  }

  async install() {
    await this.db.sync();
    this.app.logger.info('PRESTAGO Applications Plugin installed');
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PrestagoApplicationsPlugin;
