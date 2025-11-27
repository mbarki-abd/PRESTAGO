// =============================================================================
// PRESTAGO - Plugin Applications - Service: Offer Management
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, DEFAULTS, TIME_THRESHOLDS } from '../../shared/constants';
import { OfferStatus, ApplicationStatus, APPLICATION_EVENTS } from '../../shared/types';

export class OfferService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Create an offer
   */
  async createOffer(data: {
    application_id: string;
    position_title: string;
    daily_rate: number;
    rate_currency?: string;
    start_date: Date;
    end_date?: Date;
    duration_months?: number;
    work_mode: 'onsite' | 'remote' | 'hybrid';
    remote_percentage?: number;
    location?: string;
    contract_type: 'freelance' | 'portage' | 'cdi' | 'cdd';
    notice_period_days?: number;
    termination_clause?: string;
    special_conditions?: string;
    response_deadline?: Date;
  }, userId: string): Promise<any> {
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);
    const offerCollection = this.db.getCollection(COLLECTIONS.OFFERS);

    // Get application
    const application = await applicationCollection.repository.findOne({
      filter: { id: data.application_id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Validate application status
    const validStatuses = [
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.OFFER_PENDING,
    ];

    if (!validStatuses.includes(application.status as ApplicationStatus)) {
      throw new Error('Application must be shortlisted or interview completed before creating offer');
    }

    // Check for existing active offer
    const existingOffer = await offerCollection.repository.findOne({
      filter: {
        application_id: data.application_id,
        status: { $in: ['draft', 'pending_approval', 'approved', 'sent', 'viewed'] },
      },
    });

    if (existingOffer) {
      throw new Error('An active offer already exists for this application');
    }

    // Set default response deadline
    const responseDeadline = data.response_deadline ||
      new Date(Date.now() + TIME_THRESHOLDS.OFFER_RESPONSE * 24 * 60 * 60 * 1000);

    const offer = await offerCollection.repository.create({
      values: {
        ...data,
        rfp_id: application.rfp_id,
        profile_id: application.profile_id,
        status: OfferStatus.DRAFT,
        rate_currency: data.rate_currency || DEFAULTS.RATE_CURRENCY,
        response_deadline: responseDeadline,
      },
    });

    // Update application status
    await applicationCollection.repository.update({
      filter: { id: data.application_id },
      values: { status: ApplicationStatus.OFFER_PENDING },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_CREATED, { offer, application, userId });
    }

    return offer;
  }

  /**
   * Submit offer for approval
   */
  async submitForApproval(offerId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const offer = await collection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.status !== OfferStatus.DRAFT) {
      throw new Error('Only draft offers can be submitted for approval');
    }

    const updated = await collection.repository.update({
      filter: { id: offerId },
      values: { status: OfferStatus.PENDING_APPROVAL },
    });

    return updated[0];
  }

  /**
   * Approve offer
   */
  async approveOffer(offerId: string, approverId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const offer = await collection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.status !== OfferStatus.PENDING_APPROVAL) {
      throw new Error('Only pending offers can be approved');
    }

    const updated = await collection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.APPROVED,
        approved_by_id: approverId,
        approved_at: new Date(),
      },
    });

    return updated[0];
  }

  /**
   * Send offer to candidate
   */
  async sendOffer(offerId: string, senderId: string): Promise<any> {
    const offerCollection = this.db.getCollection(COLLECTIONS.OFFERS);
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const offer = await offerCollection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    // Can send from draft (skip approval) or approved status
    if (![OfferStatus.DRAFT, OfferStatus.APPROVED].includes(offer.status as OfferStatus)) {
      throw new Error('Offer cannot be sent in current status');
    }

    const updated = await offerCollection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.SENT,
        sent_at: new Date(),
        sent_by_id: senderId,
      },
    });

    // Update application status
    await applicationCollection.repository.update({
      filter: { id: offer.application_id },
      values: { status: ApplicationStatus.OFFER_SENT },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_SENT, { offer: updated[0], senderId });
    }

    return updated[0];
  }

  /**
   * Mark offer as viewed
   */
  async markViewed(offerId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const offer = await collection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.status !== OfferStatus.SENT) {
      return offer; // Already viewed or in different state
    }

    const updated = await collection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.VIEWED,
        viewed_at: new Date(),
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_VIEWED, { offer: updated[0] });
    }

    return updated[0];
  }

  /**
   * Accept offer
   */
  async acceptOffer(offerId: string, comments?: string): Promise<any> {
    const offerCollection = this.db.getCollection(COLLECTIONS.OFFERS);
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);
    const rfpCollection = this.db.getCollection('prestago_rfps');

    const offer = await offerCollection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (![OfferStatus.SENT, OfferStatus.VIEWED].includes(offer.status as OfferStatus)) {
      throw new Error('Offer cannot be accepted in current status');
    }

    // Check if deadline passed
    if (offer.response_deadline && new Date(offer.response_deadline) < new Date()) {
      throw new Error('Offer response deadline has passed');
    }

    const updated = await offerCollection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.ACCEPTED,
        responded_at: new Date(),
        response_comments: comments,
      },
    });

    // Update application status
    await applicationCollection.repository.update({
      filter: { id: offer.application_id },
      values: { status: ApplicationStatus.OFFER_ACCEPTED },
    });

    // Update RFP shortlisted count
    await rfpCollection.repository.update({
      filter: { id: offer.rfp_id },
      values: {
        shortlisted_count: this.db.sequelize.literal('shortlisted_count + 1'),
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_ACCEPTED, { offer: updated[0] });
    }

    return updated[0];
  }

  /**
   * Decline offer
   */
  async declineOffer(offerId: string, reason?: string): Promise<any> {
    const offerCollection = this.db.getCollection(COLLECTIONS.OFFERS);
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const offer = await offerCollection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (![OfferStatus.SENT, OfferStatus.VIEWED].includes(offer.status as OfferStatus)) {
      throw new Error('Offer cannot be declined in current status');
    }

    const updated = await offerCollection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.DECLINED,
        responded_at: new Date(),
        response_comments: reason,
      },
    });

    // Update application status
    await applicationCollection.repository.update({
      filter: { id: offer.application_id },
      values: { status: ApplicationStatus.OFFER_DECLINED },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_DECLINED, { offer: updated[0], reason });
    }

    return updated[0];
  }

  /**
   * Withdraw offer
   */
  async withdrawOffer(offerId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const offer = await collection.repository.findOne({
      filter: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if ([OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED].includes(offer.status as OfferStatus)) {
      throw new Error('Cannot withdraw offer in current status');
    }

    const updated = await collection.repository.update({
      filter: { id: offerId },
      values: {
        status: OfferStatus.WITHDRAWN,
        response_comments: reason,
      },
    });

    return updated[0];
  }

  /**
   * Expire overdue offers
   */
  async expireOverdueOffers(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);
    const now = new Date();

    const overdueOffers = await collection.repository.find({
      filter: {
        status: { $in: [OfferStatus.SENT, OfferStatus.VIEWED] },
        response_deadline: { $lt: now },
      },
    });

    let count = 0;
    for (const offer of overdueOffers) {
      await collection.repository.update({
        filter: { id: offer.id },
        values: { status: OfferStatus.EXPIRED },
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(APPLICATION_EVENTS.OFFER_EXPIRED, { offer });
      }

      count++;
    }

    return count;
  }

  /**
   * Get offers expiring soon
   */
  async getExpiringOffers(days: number = TIME_THRESHOLDS.OFFER_EXPIRING_REMINDER): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: { $in: [OfferStatus.SENT, OfferStatus.VIEWED] },
        response_deadline: {
          $gte: now,
          $lte: deadline,
        },
      },
      appends: ['application', 'profile'],
    });
  }

  /**
   * Get offer by ID
   */
  async getOfferById(offerId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    return collection.repository.findOne({
      filter: { id: offerId },
      appends: ['application', 'profile', 'rfp'],
    });
  }

  /**
   * Get offers for application
   */
  async getOffersByApplication(applicationId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    return collection.repository.find({
      filter: { application_id: applicationId },
      sort: ['-created_at'],
    });
  }

  /**
   * Get offers for profile
   */
  async getOffersByProfile(profileId: string, status?: OfferStatus[]): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const filter: any = { profile_id: profileId };
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    return collection.repository.find({
      filter,
      appends: ['rfp', 'application'],
      sort: ['-created_at'],
    });
  }

  /**
   * Get offer statistics
   */
  async getOfferStats(rfpId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.OFFERS);

    const filter: any = rfpId ? { rfp_id: rfpId } : {};
    const all = await collection.repository.find({ filter });

    const stats: any = {
      total: all.length,
      by_status: {},
      average_daily_rate: 0,
      acceptance_rate: 0,
      average_response_time_days: 0,
    };

    let totalRate = 0;
    let rateCount = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    for (const offer of all) {
      stats.by_status[offer.status] = (stats.by_status[offer.status] || 0) + 1;

      if (offer.daily_rate) {
        totalRate += offer.daily_rate;
        rateCount++;
      }

      if (offer.sent_at && offer.responded_at) {
        const diff = new Date(offer.responded_at).getTime() - new Date(offer.sent_at).getTime();
        totalResponseTime += diff / (1000 * 60 * 60 * 24);
        responseCount++;
      }
    }

    stats.average_daily_rate = rateCount > 0 ? totalRate / rateCount : 0;
    stats.average_response_time_days = responseCount > 0 ? totalResponseTime / responseCount : 0;

    const responded = (stats.by_status[OfferStatus.ACCEPTED] || 0) +
                     (stats.by_status[OfferStatus.DECLINED] || 0);
    const accepted = stats.by_status[OfferStatus.ACCEPTED] || 0;
    stats.acceptance_rate = responded > 0 ? (accepted / responded) * 100 : 0;

    return stats;
  }
}
