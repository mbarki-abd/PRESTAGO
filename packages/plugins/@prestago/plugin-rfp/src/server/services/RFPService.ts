// =============================================================================
// PRESTAGO - Plugin RFP - Service: RFP Management
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, STATUS_TRANSITIONS, REFERENCE_NUMBER, VALIDATION, DEFAULTS } from '../../shared/constants';
import { RFPStatus, RFP_EVENTS } from '../../shared/types';

export class RFPService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Generate a unique reference number for RFP
   * Format: RFP-YYYY-XXXXX (e.g., RFP-2024-00001)
   */
  async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${REFERENCE_NUMBER.PREFIX}${REFERENCE_NUMBER.SEPARATOR}${year}${REFERENCE_NUMBER.SEPARATOR}`;

    // Get the latest reference number for this year
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const latest = await collection.repository.findOne({
      filter: {
        reference_number: {
          $startsWith: prefix,
        },
      },
      sort: ['-reference_number'],
    });

    let sequence = 1;
    if (latest?.reference_number) {
      const parts = latest.reference_number.split(REFERENCE_NUMBER.SEPARATOR);
      const lastSequence = parseInt(parts[parts.length - 1], 10);
      sequence = lastSequence + 1;
    }

    const sequenceStr = sequence.toString().padStart(REFERENCE_NUMBER.SEQUENCE_LENGTH, '0');
    return `${prefix}${sequenceStr}`;
  }

  /**
   * Create a new RFP
   */
  async createRFP(data: any, userId: string): Promise<any> {
    // Validate required fields
    this.validateRFPData(data);

    // Generate reference number
    const referenceNumber = await this.generateReferenceNumber();

    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfp = await collection.repository.create({
      values: {
        ...data,
        reference_number: referenceNumber,
        created_by_user_id: userId,
        status: DEFAULTS.STATUS,
        priority: data.priority || DEFAULTS.PRIORITY,
        visibility: data.visibility || DEFAULTS.VISIBILITY,
        budget_currency: data.budget_currency || DEFAULTS.BUDGET_CURRENCY,
        positions_count: data.positions_count || DEFAULTS.POSITIONS_COUNT,
        extension_possible: data.extension_possible ?? DEFAULTS.EXTENSION_POSSIBLE,
        budget_visible: data.budget_visible ?? DEFAULTS.BUDGET_VISIBLE,
        views_count: 0,
        applications_count: 0,
        shortlisted_count: 0,
        contract_types: data.contract_types || ['any'],
      },
    });

    // Record history
    await this.recordHistory(rfp.id, 'created', userId, null, null);

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_CREATED, { rfp, userId });
    }

    return rfp;
  }

  /**
   * Update an RFP
   */
  async updateRFP(rfpId: string, data: any, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    // Get current RFP
    const currentRfp = await collection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!currentRfp) {
      throw new Error('RFP not found');
    }

    // Cannot edit closed or cancelled RFPs (except to reopen)
    if (['closed'].includes(currentRfp.status) && !data.status) {
      throw new Error('Cannot edit a closed RFP');
    }

    // Validate data if provided
    if (data.title || data.description) {
      this.validateRFPData({ ...currentRfp, ...data });
    }

    // Track changes for history
    const changes: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(data)) {
      if (currentRfp[key] !== data[key]) {
        changes[key] = { old: currentRfp[key], new: data[key] };
      }
    }

    const rfp = await collection.repository.update({
      filter: { id: rfpId },
      values: data,
    });

    // Record history with changes
    if (Object.keys(changes).length > 0) {
      await this.recordHistory(rfpId, 'edited', userId, null, null, changes);
    }

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_UPDATED, { rfp: rfp[0], userId, changes });
    }

    return rfp[0];
  }

  /**
   * Change RFP status with workflow validation
   */
  async changeStatus(rfpId: string, newStatus: RFPStatus, userId: string, comment?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    const rfp = await collection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    const currentStatus = rfp.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    // Set special dates based on status
    const updateData: any = { status: newStatus };
    const now = new Date();

    if (newStatus === RFPStatus.PUBLISHED && !rfp.published_at) {
      updateData.published_at = now;
    }
    if (newStatus === RFPStatus.CLOSED) {
      updateData.closed_at = now;
    }
    if (newStatus === RFPStatus.AWARDED) {
      updateData.awarded_at = now;
    }

    const updatedRfp = await collection.repository.update({
      filter: { id: rfpId },
      values: updateData,
    });

    // Record history
    await this.recordHistory(rfpId, 'status_changed', userId, currentStatus, newStatus, null, comment);

    // Emit appropriate event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_STATUS_CHANGED, {
        rfp: updatedRfp[0],
        userId,
        fromStatus: currentStatus,
        toStatus: newStatus,
      });

      // Emit specific events
      const eventMap: Record<string, string> = {
        [RFPStatus.PUBLISHED]: RFP_EVENTS.RFP_PUBLISHED,
        [RFPStatus.CLOSED]: RFP_EVENTS.RFP_CLOSED,
        [RFPStatus.CANCELLED]: RFP_EVENTS.RFP_CANCELLED,
        [RFPStatus.EXPIRED]: RFP_EVENTS.RFP_EXPIRED,
        [RFPStatus.AWARDED]: RFP_EVENTS.RFP_AWARDED,
      };

      if (eventMap[newStatus]) {
        this.eventEmitter.emit(eventMap[newStatus], { rfp: updatedRfp[0], userId });
      }
    }

    return updatedRfp[0];
  }

  /**
   * Publish an RFP (shortcut for status change)
   */
  async publishRFP(rfpId: string, userId: string): Promise<any> {
    // Validate RFP has required data before publishing
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfp = await collection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    // Check minimum requirements for publishing
    const errors: string[] = [];
    if (!rfp.title || rfp.title.length < VALIDATION.TITLE_MIN_LENGTH) {
      errors.push(`Title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters`);
    }
    if (!rfp.description || rfp.description.length < VALIDATION.DESCRIPTION_MIN_LENGTH) {
      errors.push(`Description must be at least ${VALIDATION.DESCRIPTION_MIN_LENGTH} characters`);
    }
    if (!rfp.estimated_start_date) {
      errors.push('Estimated start date is required');
    }
    if (!rfp.application_deadline) {
      errors.push('Application deadline is required');
    }
    if (!rfp.experience_level) {
      errors.push('Experience level is required');
    }

    if (errors.length > 0) {
      throw new Error(`Cannot publish RFP: ${errors.join(', ')}`);
    }

    // If currently draft, go through pending_approval first (if configured)
    // For now, direct publish from draft is allowed
    if (rfp.status === RFPStatus.DRAFT) {
      return this.changeStatus(rfpId, RFPStatus.PUBLISHED, userId);
    }

    if (rfp.status === RFPStatus.PENDING_APPROVAL) {
      return this.changeStatus(rfpId, RFPStatus.PUBLISHED, userId);
    }

    throw new Error(`Cannot publish RFP with status '${rfp.status}'`);
  }

  /**
   * Cancel an RFP
   */
  async cancelRFP(rfpId: string, userId: string, reason?: string): Promise<any> {
    return this.changeStatus(rfpId, RFPStatus.CANCELLED, userId, reason);
  }

  /**
   * Close an RFP
   */
  async closeRFP(rfpId: string, userId: string, reason?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfp = await collection.repository.findOne({ filter: { id: rfpId } });

    if (rfp?.status === RFPStatus.AWARDED) {
      return this.changeStatus(rfpId, RFPStatus.CLOSED, userId, reason);
    }

    throw new Error('Can only close awarded RFPs');
  }

  /**
   * Get RFP by ID with relations
   */
  async getRFPById(rfpId: string, includeRelations = true): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    const appends = includeRelations
      ? ['skill_requirements', 'skill_requirements.skill', 'documents', 'client_organization', 'created_by_user']
      : [];

    return collection.repository.findOne({
      filter: { id: rfpId },
      appends,
    });
  }

  /**
   * Get RFPs by organization
   */
  async getRFPsByOrganization(organizationId: string, filters?: any): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    return collection.repository.find({
      filter: {
        client_organization_id: organizationId,
        ...filters,
      },
      sort: ['-created_at'],
    });
  }

  /**
   * Get RFPs created by user
   */
  async getRFPsByUser(userId: string, filters?: any): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    return collection.repository.find({
      filter: {
        created_by_user_id: userId,
        ...filters,
      },
      sort: ['-created_at'],
    });
  }

  /**
   * Record view for analytics
   */
  async recordView(rfpId: string, viewerData: any): Promise<void> {
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const viewsCollection = this.db.getCollection(COLLECTIONS.RFP_VIEWS);

    // Record detailed view
    await viewsCollection.repository.create({
      values: {
        rfp_id: rfpId,
        viewer_user_id: viewerData.userId,
        viewer_profile_id: viewerData.profileId,
        viewer_organization_id: viewerData.organizationId,
        ip_address: viewerData.ipAddress,
        user_agent: viewerData.userAgent,
        referer: viewerData.referer,
      },
    });

    // Increment view count
    await rfpCollection.repository.update({
      filter: { id: rfpId },
      values: {
        views_count: this.db.sequelize.literal('views_count + 1'),
      },
    });
  }

  /**
   * Save/bookmark RFP for a user
   */
  async saveRFP(rfpId: string, userId: string, profileId?: string, notes?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SAVED);

    // Check if already saved
    const existing = await collection.repository.findOne({
      filter: { rfp_id: rfpId, user_id: userId },
    });

    if (existing) {
      // Update notes if provided
      if (notes !== undefined) {
        return collection.repository.update({
          filter: { id: existing.id },
          values: { notes },
        });
      }
      return existing;
    }

    return collection.repository.create({
      values: {
        rfp_id: rfpId,
        user_id: userId,
        profile_id: profileId,
        notes,
      },
    });
  }

  /**
   * Unsave/remove bookmark
   */
  async unsaveRFP(rfpId: string, userId: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SAVED);

    await collection.repository.destroy({
      filter: { rfp_id: rfpId, user_id: userId },
    });
  }

  /**
   * Get saved RFPs for a user
   */
  async getSavedRFPs(userId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SAVED);

    return collection.repository.find({
      filter: { user_id: userId },
      appends: ['rfp'],
      sort: ['-saved_at'],
    });
  }

  /**
   * Check if RFP deadline is approaching
   */
  async checkDeadlines(): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const now = new Date();
    const urgentDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return collection.repository.find({
      filter: {
        status: RFPStatus.PUBLISHED,
        application_deadline: {
          $gte: now,
          $lte: warningDate,
        },
      },
      sort: ['application_deadline'],
    });
  }

  /**
   * Expire RFPs past their deadline
   */
  async expireOverdueRFPs(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const now = new Date();

    const overdueRfps = await collection.repository.find({
      filter: {
        status: RFPStatus.PUBLISHED,
        application_deadline: {
          $lt: now,
        },
      },
    });

    let count = 0;
    for (const rfp of overdueRfps) {
      await this.changeStatus(rfp.id, RFPStatus.EXPIRED, 'system', 'Application deadline passed');
      count++;
    }

    return count;
  }

  /**
   * Get RFP statistics
   */
  async getRFPStats(organizationId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const filter: any = organizationId ? { client_organization_id: organizationId } : {};

    const all = await collection.repository.find({ filter });

    const stats = {
      total: all.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      averageApplications: 0,
      totalViews: 0,
      avgTimeToAward: 0,
    };

    let totalApplications = 0;
    let awardedCount = 0;
    let totalTimeToAward = 0;

    for (const rfp of all) {
      // By status
      stats.byStatus[rfp.status] = (stats.byStatus[rfp.status] || 0) + 1;

      // By priority
      stats.byPriority[rfp.priority] = (stats.byPriority[rfp.priority] || 0) + 1;

      // Applications
      totalApplications += rfp.applications_count || 0;

      // Views
      stats.totalViews += rfp.views_count || 0;

      // Time to award
      if (rfp.status === RFPStatus.AWARDED && rfp.published_at && rfp.awarded_at) {
        const diff = new Date(rfp.awarded_at).getTime() - new Date(rfp.published_at).getTime();
        totalTimeToAward += diff / (1000 * 60 * 60 * 24); // Convert to days
        awardedCount++;
      }
    }

    stats.averageApplications = all.length > 0 ? totalApplications / all.length : 0;
    stats.avgTimeToAward = awardedCount > 0 ? totalTimeToAward / awardedCount : 0;

    return stats;
  }

  /**
   * Validate RFP data
   */
  private validateRFPData(data: any): void {
    const errors: string[] = [];

    if (data.title) {
      if (data.title.length < VALIDATION.TITLE_MIN_LENGTH) {
        errors.push(`Title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters`);
      }
      if (data.title.length > VALIDATION.TITLE_MAX_LENGTH) {
        errors.push(`Title must be at most ${VALIDATION.TITLE_MAX_LENGTH} characters`);
      }
    }

    if (data.description) {
      if (data.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
        errors.push(`Description must be at most ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`);
      }
    }

    if (data.daily_rate_min !== undefined && data.daily_rate_max !== undefined) {
      if (data.daily_rate_min > data.daily_rate_max) {
        errors.push('Minimum daily rate cannot be greater than maximum');
      }
      if (data.daily_rate_min < VALIDATION.DAILY_RATE_MIN) {
        errors.push(`Minimum daily rate must be at least ${VALIDATION.DAILY_RATE_MIN}`);
      }
      if (data.daily_rate_max > VALIDATION.DAILY_RATE_MAX) {
        errors.push(`Maximum daily rate must be at most ${VALIDATION.DAILY_RATE_MAX}`);
      }
    }

    if (data.duration_months !== undefined) {
      if (data.duration_months < VALIDATION.DURATION_MIN_MONTHS) {
        errors.push(`Duration must be at least ${VALIDATION.DURATION_MIN_MONTHS} month`);
      }
      if (data.duration_months > VALIDATION.DURATION_MAX_MONTHS) {
        errors.push(`Duration must be at most ${VALIDATION.DURATION_MAX_MONTHS} months`);
      }
    }

    if (data.positions_count !== undefined && data.positions_count > VALIDATION.POSITIONS_MAX) {
      errors.push(`Positions count must be at most ${VALIDATION.POSITIONS_MAX}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Record RFP history entry
   */
  private async recordHistory(
    rfpId: string,
    action: string,
    userId: string,
    fromStatus?: string | null,
    toStatus?: string | null,
    changes?: Record<string, any> | null,
    comment?: string
  ): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_HISTORY);

    await collection.repository.create({
      values: {
        rfp_id: rfpId,
        action,
        from_status: fromStatus,
        to_status: toStatus,
        performed_by_user_id: userId,
        comment,
        changes,
      },
    });
  }
}
