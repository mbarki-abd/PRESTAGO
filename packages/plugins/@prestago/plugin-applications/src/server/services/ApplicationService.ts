// =============================================================================
// PRESTAGO - Plugin Applications - Service: Application Management
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, STATUS_TRANSITIONS, DEFAULTS, VALIDATION } from '../../shared/constants';
import { ApplicationStatus, ApplicationSource, APPLICATION_EVENTS } from '../../shared/types';

export class ApplicationService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Create a new application
   */
  async createApplication(data: any, userId: string): Promise<any> {
    // Validate
    this.validateApplicationData(data);

    // Check if application already exists for this RFP/Profile
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);
    const existing = await collection.repository.findOne({
      filter: {
        rfp_id: data.rfp_id,
        profile_id: data.profile_id,
      },
    });

    if (existing) {
      throw new Error('An application already exists for this RFP');
    }

    // Check RFP is open for applications
    const rfpCollection = this.db.getCollection('prestago_rfps');
    const rfp = await rfpCollection.repository.findOne({
      filter: { id: data.rfp_id },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    if (rfp.status !== 'published') {
      throw new Error('This RFP is not open for applications');
    }

    if (rfp.application_deadline && new Date(rfp.application_deadline) < new Date()) {
      throw new Error('Application deadline has passed');
    }

    // Calculate match score
    const matchScore = await this.calculateMatchScore(data.profile_id, data.rfp_id);

    const application = await collection.repository.create({
      values: {
        ...data,
        user_id: userId,
        status: DEFAULTS.STATUS,
        source: data.source || DEFAULTS.SOURCE,
        rate_currency: data.rate_currency || DEFAULTS.RATE_CURRENCY,
        rate_negotiable: data.rate_negotiable ?? DEFAULTS.RATE_NEGOTIABLE,
        part_time_available: data.part_time_available ?? DEFAULTS.PART_TIME_AVAILABLE,
        match_score: matchScore.overall_score,
        match_details: matchScore,
      },
    });

    // Record history
    await this.recordHistory(application.id, 'created', userId);

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.APPLICATION_CREATED, { application, userId });
    }

    return application;
  }

  /**
   * Submit an application (change from draft to submitted)
   */
  async submitApplication(applicationId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const application = await collection.repository.findOne({
      filter: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status !== ApplicationStatus.DRAFT) {
      throw new Error('Only draft applications can be submitted');
    }

    // Validate required fields for submission
    const errors: string[] = [];
    if (!application.cover_letter || application.cover_letter.length < VALIDATION.COVER_LETTER_MIN_LENGTH) {
      errors.push('Cover letter is required (minimum 100 characters)');
    }
    if (!application.proposed_daily_rate) {
      errors.push('Proposed daily rate is required');
    }

    if (errors.length > 0) {
      throw new Error(`Cannot submit application: ${errors.join(', ')}`);
    }

    const updated = await collection.repository.update({
      filter: { id: applicationId },
      values: {
        status: ApplicationStatus.SUBMITTED,
        submitted_at: new Date(),
      },
    });

    // Increment RFP applications count
    const rfpCollection = this.db.getCollection('prestago_rfps');
    await rfpCollection.repository.update({
      filter: { id: application.rfp_id },
      values: {
        applications_count: this.db.sequelize.literal('applications_count + 1'),
      },
    });

    // Record history
    await this.recordHistory(applicationId, 'submitted', userId, ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED);

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.APPLICATION_SUBMITTED, {
        application: updated[0],
        userId,
      });
    }

    return updated[0];
  }

  /**
   * Change application status
   */
  async changeStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    userId: string,
    comment?: string
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const application = await collection.repository.findOne({
      filter: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const currentStatus = application.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    // Set special dates based on status
    const updateData: any = { status: newStatus };
    const now = new Date();

    switch (newStatus) {
      case ApplicationStatus.UNDER_REVIEW:
        updateData.reviewed_at = now;
        break;
      case ApplicationStatus.SHORTLISTED:
        updateData.shortlisted_at = now;
        break;
      case ApplicationStatus.REJECTED:
        updateData.rejected_at = now;
        break;
      case ApplicationStatus.WITHDRAWN:
        updateData.withdrawn_at = now;
        break;
    }

    const updated = await collection.repository.update({
      filter: { id: applicationId },
      values: updateData,
    });

    // Record history
    await this.recordHistory(applicationId, 'status_changed', userId, currentStatus, newStatus, comment);

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.APPLICATION_STATUS_CHANGED, {
        application: updated[0],
        userId,
        fromStatus: currentStatus,
        toStatus: newStatus,
      });

      // Emit specific events
      const eventMap: Record<string, string> = {
        [ApplicationStatus.UNDER_REVIEW]: APPLICATION_EVENTS.APPLICATION_UNDER_REVIEW,
        [ApplicationStatus.SHORTLISTED]: APPLICATION_EVENTS.APPLICATION_SHORTLISTED,
        [ApplicationStatus.REJECTED]: APPLICATION_EVENTS.APPLICATION_REJECTED,
        [ApplicationStatus.WITHDRAWN]: APPLICATION_EVENTS.APPLICATION_WITHDRAWN,
        [ApplicationStatus.ON_HOLD]: APPLICATION_EVENTS.APPLICATION_ON_HOLD,
      };

      if (eventMap[newStatus]) {
        this.eventEmitter.emit(eventMap[newStatus], { application: updated[0], userId });
      }
    }

    return updated[0];
  }

  /**
   * Reject application with reason
   */
  async rejectApplication(
    applicationId: string,
    userId: string,
    reason: string,
    category?: string
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    await collection.repository.update({
      filter: { id: applicationId },
      values: {
        rejection_reason: reason,
        rejection_category: category,
      },
    });

    return this.changeStatus(applicationId, ApplicationStatus.REJECTED, userId, reason);
  }

  /**
   * Withdraw application (by candidate)
   */
  async withdrawApplication(applicationId: string, userId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const application = await collection.repository.findOne({
      filter: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify ownership
    if (application.user_id !== userId) {
      throw new Error('You can only withdraw your own applications');
    }

    return this.changeStatus(applicationId, ApplicationStatus.WITHDRAWN, userId, reason);
  }

  /**
   * Update application
   */
  async updateApplication(applicationId: string, data: any, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const application = await collection.repository.findOne({
      filter: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Only draft applications can be fully edited
    if (application.status !== ApplicationStatus.DRAFT) {
      // Only allow updating certain fields after submission
      const allowedFields = ['internal_notes', 'internal_rating'];
      const attemptedFields = Object.keys(data);
      const invalidFields = attemptedFields.filter((f) => !allowedFields.includes(f));

      if (invalidFields.length > 0) {
        throw new Error(`Cannot update ${invalidFields.join(', ')} on submitted application`);
      }
    }

    // Validate
    this.validateApplicationData({ ...application, ...data });

    const updated = await collection.repository.update({
      filter: { id: applicationId },
      values: data,
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.APPLICATION_UPDATED, {
        application: updated[0],
        userId,
        changes: data,
      });
    }

    return updated[0];
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId: string, includeRelations = true): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const appends = includeRelations
      ? ['profile', 'rfp', 'documents', 'interviews', 'evaluations', 'offers', 'notes']
      : [];

    return collection.repository.findOne({
      filter: { id: applicationId },
      appends,
    });
  }

  /**
   * Get applications for a profile
   */
  async getApplicationsByProfile(profileId: string, filters?: any): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    return collection.repository.find({
      filter: {
        profile_id: profileId,
        ...filters,
      },
      appends: ['rfp'],
      sort: ['-created_at'],
    });
  }

  /**
   * Get applications for an RFP
   */
  async getApplicationsByRFP(
    rfpId: string,
    options: {
      status?: ApplicationStatus[];
      sortBy?: string;
      includeProfile?: boolean;
    } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const filter: any = { rfp_id: rfpId };
    if (options.status && options.status.length > 0) {
      filter.status = { $in: options.status };
    }

    const appends = options.includeProfile ? ['profile', 'profile.skills'] : [];
    const sort = options.sortBy ? [options.sortBy] : ['-match_score', '-submitted_at'];

    return collection.repository.find({
      filter,
      appends,
      sort,
    });
  }

  /**
   * Calculate match score using RFP matching service
   */
  private async calculateMatchScore(profileId: string, rfpId: string): Promise<any> {
    // This would integrate with RFPMatchingService
    // For now, return a placeholder structure
    try {
      // Call the RFP matching service if available
      const matchingCollection = this.db.getCollection('prestago_rfps');
      // Simplified calculation - in production, use RFPMatchingService
      return {
        overall_score: 75,
        skills: 80,
        experience: 70,
        location: 75,
        availability: 80,
        rate: 70,
      };
    } catch (error) {
      return { overall_score: 0 };
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(rfpId?: string, organizationId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const filter: any = {};
    if (rfpId) filter.rfp_id = rfpId;
    if (organizationId) filter.organization_id = organizationId;

    const all = await collection.repository.find({ filter });

    const stats: any = {
      total: all.length,
      by_status: {},
      by_source: {},
      average_match_score: 0,
      average_time_to_review_days: 0,
      conversion_rates: {},
    };

    let totalMatchScore = 0;
    let matchScoreCount = 0;
    let totalReviewTime = 0;
    let reviewedCount = 0;

    for (const app of all) {
      // By status
      stats.by_status[app.status] = (stats.by_status[app.status] || 0) + 1;

      // By source
      stats.by_source[app.source] = (stats.by_source[app.source] || 0) + 1;

      // Match score
      if (app.match_score) {
        totalMatchScore += app.match_score;
        matchScoreCount++;
      }

      // Time to review
      if (app.submitted_at && app.reviewed_at) {
        const diff = new Date(app.reviewed_at).getTime() - new Date(app.submitted_at).getTime();
        totalReviewTime += diff / (1000 * 60 * 60 * 24);
        reviewedCount++;
      }
    }

    stats.average_match_score = matchScoreCount > 0 ? totalMatchScore / matchScoreCount : 0;
    stats.average_time_to_review_days = reviewedCount > 0 ? totalReviewTime / reviewedCount : 0;

    // Conversion rates
    const submitted = stats.by_status[ApplicationStatus.SUBMITTED] || 0;
    const shortlisted = stats.by_status[ApplicationStatus.SHORTLISTED] || 0;
    const interviewed = (stats.by_status[ApplicationStatus.INTERVIEW_SCHEDULED] || 0) +
                       (stats.by_status[ApplicationStatus.INTERVIEW_COMPLETED] || 0);
    const offered = (stats.by_status[ApplicationStatus.OFFER_SENT] || 0) +
                   (stats.by_status[ApplicationStatus.OFFER_ACCEPTED] || 0);
    const accepted = stats.by_status[ApplicationStatus.OFFER_ACCEPTED] || 0;

    stats.conversion_rates = {
      submitted_to_shortlisted: submitted > 0 ? (shortlisted / submitted) * 100 : 0,
      shortlisted_to_interview: shortlisted > 0 ? (interviewed / shortlisted) * 100 : 0,
      interview_to_offer: interviewed > 0 ? (offered / interviewed) * 100 : 0,
      offer_to_accepted: offered > 0 ? (accepted / offered) * 100 : 0,
    };

    return stats;
  }

  /**
   * Validate application data
   */
  private validateApplicationData(data: any): void {
    const errors: string[] = [];

    if (data.cover_letter && data.cover_letter.length > VALIDATION.COVER_LETTER_MAX_LENGTH) {
      errors.push(`Cover letter must be at most ${VALIDATION.COVER_LETTER_MAX_LENGTH} characters`);
    }

    if (data.motivation && data.motivation.length > VALIDATION.MOTIVATION_MAX_LENGTH) {
      errors.push(`Motivation must be at most ${VALIDATION.MOTIVATION_MAX_LENGTH} characters`);
    }

    if (data.notice_period_days && data.notice_period_days > VALIDATION.NOTICE_PERIOD_MAX_DAYS) {
      errors.push(`Notice period must be at most ${VALIDATION.NOTICE_PERIOD_MAX_DAYS} days`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Record application history
   */
  private async recordHistory(
    applicationId: string,
    action: string,
    userId: string,
    fromStatus?: string,
    toStatus?: string,
    comment?: string,
    metadata?: any
  ): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.APPLICATION_HISTORY);

    await collection.repository.create({
      values: {
        application_id: applicationId,
        action,
        from_status: fromStatus,
        to_status: toStatus,
        performed_by_user_id: userId,
        comment,
        metadata,
      },
    });
  }
}
