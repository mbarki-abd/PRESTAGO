// =============================================================================
// PRESTAGO - Plugin RFP - Service: RFP Questions (Q&A)
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, VALIDATION } from '../../shared/constants';
import { RFP_EVENTS } from '../../shared/types';

export class RFPQuestionService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Ask a question about an RFP
   */
  async askQuestion(
    rfpId: string,
    data: {
      question: string;
      is_anonymous?: boolean;
    },
    userId: string,
    organizationId?: string
  ): Promise<any> {
    // Validate question length
    if (data.question.length > VALIDATION.QUESTION_MAX_LENGTH) {
      throw new Error(`Question must be at most ${VALIDATION.QUESTION_MAX_LENGTH} characters`);
    }

    // Check RFP exists and is published
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfp = await rfpCollection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    if (rfp.status !== 'published') {
      throw new Error('Questions can only be asked on published RFPs');
    }

    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const question = await collection.repository.create({
      values: {
        rfp_id: rfpId,
        asked_by_user_id: userId,
        asked_by_organization_id: organizationId,
        question: data.question,
        is_anonymous: data.is_anonymous || false,
        is_public: true, // Default to public, can be changed by admin
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_QUESTION_ASKED, {
        rfpId,
        questionId: question.id,
        userId,
        question: data.question,
      });
    }

    return question;
  }

  /**
   * Answer a question
   */
  async answerQuestion(
    questionId: string,
    answer: string,
    userId: string
  ): Promise<any> {
    // Validate answer length
    if (answer.length > VALIDATION.ANSWER_MAX_LENGTH) {
      throw new Error(`Answer must be at most ${VALIDATION.ANSWER_MAX_LENGTH} characters`);
    }

    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const question = await collection.repository.findOne({
      filter: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.answer) {
      throw new Error('Question has already been answered');
    }

    const updated = await collection.repository.update({
      filter: { id: questionId },
      values: {
        answer,
        answered_by_user_id: userId,
        answered_at: new Date(),
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_QUESTION_ANSWERED, {
        rfpId: question.rfp_id,
        questionId,
        answer,
        answeredBy: userId,
      });
    }

    return updated[0];
  }

  /**
   * Update question visibility
   */
  async updateQuestionVisibility(
    questionId: string,
    isPublic: boolean
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const updated = await collection.repository.update({
      filter: { id: questionId },
      values: { is_public: isPublic },
    });

    return updated[0];
  }

  /**
   * Get all questions for an RFP
   */
  async getQuestionsByRFP(
    rfpId: string,
    options: {
      publicOnly?: boolean;
      answered?: boolean;
    } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const filter: any = { rfp_id: rfpId };

    if (options.publicOnly) {
      filter.is_public = true;
    }

    if (options.answered !== undefined) {
      if (options.answered) {
        filter.answer = { $ne: null };
      } else {
        filter.answer = null;
      }
    }

    return collection.repository.find({
      filter,
      sort: ['-created_at'],
      appends: ['asked_by_user', 'answered_by_user'],
    });
  }

  /**
   * Get public Q&A for an RFP (visible to candidates)
   */
  async getPublicQA(rfpId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const questions = await collection.repository.find({
      filter: {
        rfp_id: rfpId,
        is_public: true,
        answer: { $ne: null },
      },
      sort: ['-answered_at'],
    });

    // Anonymize if needed
    return questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      answered_at: q.answered_at,
      asked_by: q.is_anonymous ? 'Anonymous' : q.asked_by_user?.nickname || 'User',
    }));
  }

  /**
   * Get questions asked by a user
   */
  async getQuestionsByUser(
    userId: string,
    options: { rfpId?: string } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const filter: any = { asked_by_user_id: userId };
    if (options.rfpId) {
      filter.rfp_id = options.rfpId;
    }

    return collection.repository.find({
      filter,
      sort: ['-created_at'],
      appends: ['rfp'],
    });
  }

  /**
   * Get unanswered questions count for an RFP
   */
  async getUnansweredCount(rfpId: string): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    return collection.repository.count({
      filter: {
        rfp_id: rfpId,
        answer: null,
      },
    });
  }

  /**
   * Delete a question (only if not answered)
   */
  async deleteQuestion(questionId: string, userId: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_QUESTIONS);

    const question = await collection.repository.findOne({
      filter: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.answer) {
      throw new Error('Cannot delete an answered question');
    }

    if (question.asked_by_user_id !== userId) {
      throw new Error('You can only delete your own questions');
    }

    await collection.repository.destroy({
      filter: { id: questionId },
    });
  }
}
