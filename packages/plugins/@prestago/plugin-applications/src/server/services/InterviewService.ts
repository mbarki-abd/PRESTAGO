// =============================================================================
// PRESTAGO - Plugin Applications - Service: Interview Management
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, INTERVIEW_TYPES, DEFAULTS, TIME_THRESHOLDS } from '../../shared/constants';
import { InterviewStatus, InterviewType, ApplicationStatus, APPLICATION_EVENTS } from '../../shared/types';

export class InterviewService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Schedule an interview
   */
  async scheduleInterview(data: {
    application_id: string;
    type: InterviewType;
    scheduled_at: Date;
    duration_minutes?: number;
    timezone?: string;
    location?: string;
    meeting_link?: string;
    phone_number?: string;
    meeting_password?: string;
    interviewer_ids?: string[];
    interviewer_names?: string[];
    internal_notes?: string;
  }, userId: string): Promise<any> {
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);
    const interviewCollection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    // Get application
    const application = await applicationCollection.repository.findOne({
      filter: { id: data.application_id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Validate application status allows interview scheduling
    const validStatuses = [
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_COMPLETED,
    ];

    if (!validStatuses.includes(application.status as ApplicationStatus)) {
      throw new Error('Application must be shortlisted before scheduling interviews');
    }

    // Validate interview date is in the future with minimum notice
    const scheduledDate = new Date(data.scheduled_at);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + TIME_THRESHOLDS.INTERVIEW_NOTICE);

    if (scheduledDate < new Date()) {
      throw new Error('Interview cannot be scheduled in the past');
    }

    // Validate required fields based on interview type
    const typeConfig = INTERVIEW_TYPES[data.type];
    if (typeConfig.requires_location && !data.location) {
      throw new Error(`Location is required for ${data.type} interviews`);
    }
    if (typeConfig.requires_link && !data.meeting_link) {
      throw new Error(`Meeting link is required for ${data.type} interviews`);
    }

    // Count existing interviews to determine round
    const existingInterviews = await interviewCollection.repository.count({
      filter: { application_id: data.application_id },
    });

    const interview = await interviewCollection.repository.create({
      values: {
        application_id: data.application_id,
        rfp_id: application.rfp_id,
        type: data.type,
        status: InterviewStatus.SCHEDULED,
        round: existingInterviews + 1,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes || typeConfig.default_duration,
        timezone: data.timezone || DEFAULTS.INTERVIEW_TIMEZONE,
        location: data.location,
        meeting_link: data.meeting_link,
        phone_number: data.phone_number,
        meeting_password: data.meeting_password,
        interviewer_ids: data.interviewer_ids || [],
        interviewer_names: data.interviewer_names || [],
        internal_notes: data.internal_notes,
        reminder_sent: false,
      },
    });

    // Update application status if first interview
    if (existingInterviews === 0) {
      await applicationCollection.repository.update({
        filter: { id: data.application_id },
        values: { status: ApplicationStatus.INTERVIEW_SCHEDULED },
      });
    }

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.INTERVIEW_SCHEDULED, {
        interview,
        application,
        userId,
      });
    }

    return interview;
  }

  /**
   * Confirm interview (by candidate)
   */
  async confirmInterview(interviewId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    const interview = await collection.repository.findOne({
      filter: { id: interviewId },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status !== InterviewStatus.SCHEDULED) {
      throw new Error('Only scheduled interviews can be confirmed');
    }

    const updated = await collection.repository.update({
      filter: { id: interviewId },
      values: { status: InterviewStatus.CONFIRMED },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.INTERVIEW_CONFIRMED, { interview: updated[0] });
    }

    return updated[0];
  }

  /**
   * Complete interview with feedback
   */
  async completeInterview(
    interviewId: string,
    data: {
      feedback?: string;
      rating?: number;
      recommendation?: 'hire' | 'consider' | 'reject' | 'undecided';
      internal_notes?: string;
    },
    userId: string
  ): Promise<any> {
    const interviewCollection = this.db.getCollection(COLLECTIONS.INTERVIEWS);
    const applicationCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const interview = await interviewCollection.repository.findOne({
      filter: { id: interviewId },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    const validStatuses = [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED];
    if (!validStatuses.includes(interview.status as InterviewStatus)) {
      throw new Error('Interview cannot be completed');
    }

    const updated = await interviewCollection.repository.update({
      filter: { id: interviewId },
      values: {
        status: InterviewStatus.COMPLETED,
        completed_at: new Date(),
        feedback: data.feedback,
        rating: data.rating,
        recommendation: data.recommendation,
        internal_notes: data.internal_notes,
      },
    });

    // Update application status
    await applicationCollection.repository.update({
      filter: { id: interview.application_id },
      values: { status: ApplicationStatus.INTERVIEW_COMPLETED },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.INTERVIEW_COMPLETED, {
        interview: updated[0],
        userId,
      });
    }

    return updated[0];
  }

  /**
   * Cancel interview
   */
  async cancelInterview(interviewId: string, reason?: string, userId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    const interview = await collection.repository.findOne({
      filter: { id: interviewId },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Completed interviews cannot be cancelled');
    }

    const updated = await collection.repository.update({
      filter: { id: interviewId },
      values: {
        status: InterviewStatus.CANCELLED,
        internal_notes: reason ? `Cancelled: ${reason}` : interview.internal_notes,
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(APPLICATION_EVENTS.INTERVIEW_CANCELLED, {
        interview: updated[0],
        reason,
        userId,
      });
    }

    return updated[0];
  }

  /**
   * Reschedule interview
   */
  async rescheduleInterview(
    interviewId: string,
    newData: {
      scheduled_at: Date;
      duration_minutes?: number;
      location?: string;
      meeting_link?: string;
    },
    userId: string
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    const interview = await collection.repository.findOne({
      filter: { id: interviewId },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if ([InterviewStatus.COMPLETED, InterviewStatus.CANCELLED].includes(interview.status as InterviewStatus)) {
      throw new Error('Cannot reschedule completed or cancelled interviews');
    }

    const updated = await collection.repository.update({
      filter: { id: interviewId },
      values: {
        status: InterviewStatus.RESCHEDULED,
        scheduled_at: newData.scheduled_at,
        duration_minutes: newData.duration_minutes || interview.duration_minutes,
        location: newData.location || interview.location,
        meeting_link: newData.meeting_link || interview.meeting_link,
        reminder_sent: false,
      },
    });

    return updated[0];
  }

  /**
   * Mark no-show
   */
  async markNoShow(interviewId: string, notes?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    const updated = await collection.repository.update({
      filter: { id: interviewId },
      values: {
        status: InterviewStatus.NO_SHOW,
        internal_notes: notes,
        completed_at: new Date(),
      },
    });

    return updated[0];
  }

  /**
   * Get interviews for an application
   */
  async getInterviewsByApplication(applicationId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    return collection.repository.find({
      filter: { application_id: applicationId },
      sort: ['round'],
    });
  }

  /**
   * Get upcoming interviews
   */
  async getUpcomingInterviews(
    options: {
      userId?: string;
      rfpId?: string;
      days?: number;
    } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (options.days || 7));

    const filter: any = {
      status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED] },
      scheduled_at: {
        $gte: now,
        $lte: futureDate,
      },
    };

    if (options.rfpId) {
      filter.rfp_id = options.rfpId;
    }

    return collection.repository.find({
      filter,
      appends: ['application', 'application.profile'],
      sort: ['scheduled_at'],
    });
  }

  /**
   * Get interviews needing reminders
   */
  async getInterviewsNeedingReminders(hoursAhead: number = 24): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED] },
        scheduled_at: {
          $gte: now,
          $lte: reminderTime,
        },
        reminder_sent: false,
      },
      appends: ['application', 'application.profile', 'application.user'],
    });
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(interviewId: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    await collection.repository.update({
      filter: { id: interviewId },
      values: { reminder_sent: true },
    });
  }

  /**
   * Get interview statistics
   */
  async getInterviewStats(rfpId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.INTERVIEWS);

    const filter: any = rfpId ? { rfp_id: rfpId } : {};
    const all = await collection.repository.find({ filter });

    const stats: any = {
      total: all.length,
      by_status: {},
      by_type: {},
      average_rating: 0,
      recommendations: {},
    };

    let totalRating = 0;
    let ratingCount = 0;

    for (const interview of all) {
      stats.by_status[interview.status] = (stats.by_status[interview.status] || 0) + 1;
      stats.by_type[interview.type] = (stats.by_type[interview.type] || 0) + 1;

      if (interview.rating) {
        totalRating += interview.rating;
        ratingCount++;
      }

      if (interview.recommendation) {
        stats.recommendations[interview.recommendation] =
          (stats.recommendations[interview.recommendation] || 0) + 1;
      }
    }

    stats.average_rating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return stats;
  }
}
