// =============================================================================
// PRESTAGO - Plugin Applications - Service: Evaluation Management
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, EVALUATION_WEIGHTS, VALIDATION } from '../../shared/constants';
import { EvaluationRating, APPLICATION_EVENTS } from '../../shared/types';

export class EvaluationService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Create or update an evaluation
   */
  async submitEvaluation(data: {
    application_id: string;
    scores: {
      technical_skills: number;
      experience: number;
      communication: number;
      cultural_fit: number;
      motivation: number;
      availability: number;
      rate_fit: number;
    };
    strengths?: string[];
    weaknesses?: string[];
    recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire' | 'strong_no_hire';
    comments?: string;
  }, evaluatorId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    // Validate scores (1-5)
    const scoreFields = Object.keys(data.scores);
    for (const field of scoreFields) {
      const score = (data.scores as any)[field];
      if (score < 1 || score > 5) {
        throw new Error(`Score for ${field} must be between 1 and 5`);
      }
    }

    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(data.scores);
    const overallRating = this.scoreToRating(overallScore);

    // Check if evaluation already exists
    const existing = await collection.repository.findOne({
      filter: {
        application_id: data.application_id,
        evaluator_id: evaluatorId,
      },
    });

    let evaluation;
    let isUpdate = false;

    if (existing) {
      // Update existing evaluation
      const updated = await collection.repository.update({
        filter: { id: existing.id },
        values: {
          score_technical_skills: data.scores.technical_skills,
          score_experience: data.scores.experience,
          score_communication: data.scores.communication,
          score_cultural_fit: data.scores.cultural_fit,
          score_motivation: data.scores.motivation,
          score_availability: data.scores.availability,
          score_rate_fit: data.scores.rate_fit,
          overall_score: overallScore,
          overall_rating: overallRating,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          recommendation: data.recommendation,
          comments: data.comments,
        },
      });
      evaluation = updated[0];
      isUpdate = true;
    } else {
      // Create new evaluation
      evaluation = await collection.repository.create({
        values: {
          application_id: data.application_id,
          evaluator_id: evaluatorId,
          score_technical_skills: data.scores.technical_skills,
          score_experience: data.scores.experience,
          score_communication: data.scores.communication,
          score_cultural_fit: data.scores.cultural_fit,
          score_motivation: data.scores.motivation,
          score_availability: data.scores.availability,
          score_rate_fit: data.scores.rate_fit,
          overall_score: overallScore,
          overall_rating: overallRating,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          recommendation: data.recommendation,
          comments: data.comments,
        },
      });
    }

    // Update application internal rating (average of all evaluations)
    await this.updateApplicationRating(data.application_id);

    // Emit event
    if (this.eventEmitter) {
      const eventType = isUpdate ? APPLICATION_EVENTS.EVALUATION_UPDATED : APPLICATION_EVENTS.EVALUATION_ADDED;
      this.eventEmitter.emit(eventType, { evaluation, evaluatorId });
    }

    return evaluation;
  }

  /**
   * Calculate overall score from individual scores
   */
  private calculateOverallScore(scores: Record<string, number>): number {
    let totalWeight = 0;
    let weightedSum = 0;

    const weights: Record<string, number> = {
      technical_skills: EVALUATION_WEIGHTS.TECHNICAL_SKILLS,
      experience: EVALUATION_WEIGHTS.EXPERIENCE,
      communication: EVALUATION_WEIGHTS.COMMUNICATION,
      cultural_fit: EVALUATION_WEIGHTS.CULTURAL_FIT,
      motivation: EVALUATION_WEIGHTS.MOTIVATION,
      availability: EVALUATION_WEIGHTS.AVAILABILITY,
      rate_fit: EVALUATION_WEIGHTS.RATE_FIT,
    };

    for (const [key, weight] of Object.entries(weights)) {
      if (scores[key] !== undefined) {
        weightedSum += scores[key] * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
  }

  /**
   * Convert score to rating enum
   */
  private scoreToRating(score: number): EvaluationRating {
    if (score >= 4.5) return EvaluationRating.EXCELLENT;
    if (score >= 3.5) return EvaluationRating.VERY_GOOD;
    if (score >= 2.5) return EvaluationRating.GOOD;
    if (score >= 1.5) return EvaluationRating.FAIR;
    return EvaluationRating.POOR;
  }

  /**
   * Update application's internal rating based on all evaluations
   */
  private async updateApplicationRating(applicationId: string): Promise<void> {
    const evalCollection = this.db.getCollection(COLLECTIONS.EVALUATIONS);
    const appCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    const evaluations = await evalCollection.repository.find({
      filter: { application_id: applicationId },
    });

    if (evaluations.length === 0) return;

    const averageRating = evaluations.reduce((sum: number, e: any) => sum + e.overall_score, 0) / evaluations.length;

    await appCollection.repository.update({
      filter: { id: applicationId },
      values: {
        internal_rating: Math.round(averageRating),
      },
    });
  }

  /**
   * Get evaluations for an application
   */
  async getEvaluationsByApplication(applicationId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    return collection.repository.find({
      filter: { application_id: applicationId },
      appends: ['evaluator'],
      sort: ['-created_at'],
    });
  }

  /**
   * Get evaluation by ID
   */
  async getEvaluationById(evaluationId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    return collection.repository.findOne({
      filter: { id: evaluationId },
      appends: ['evaluator', 'application'],
    });
  }

  /**
   * Get evaluations by evaluator
   */
  async getEvaluationsByEvaluator(evaluatorId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    return collection.repository.find({
      filter: { evaluator_id: evaluatorId },
      appends: ['application'],
      sort: ['-created_at'],
    });
  }

  /**
   * Delete evaluation
   */
  async deleteEvaluation(evaluationId: string, userId: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    const evaluation = await collection.repository.findOne({
      filter: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    // Only evaluator can delete their own evaluation
    if (evaluation.evaluator_id !== userId) {
      throw new Error('You can only delete your own evaluations');
    }

    await collection.repository.destroy({
      filter: { id: evaluationId },
    });

    // Update application rating
    await this.updateApplicationRating(evaluation.application_id);
  }

  /**
   * Get evaluation summary for an application
   */
  async getEvaluationSummary(applicationId: string): Promise<any> {
    const evaluations = await this.getEvaluationsByApplication(applicationId);

    if (evaluations.length === 0) {
      return null;
    }

    const summary: any = {
      count: evaluations.length,
      average_scores: {},
      overall_average: 0,
      recommendations: {},
      common_strengths: {},
      common_weaknesses: {},
    };

    // Initialize score sums
    const scoreSums: Record<string, number> = {
      technical_skills: 0,
      experience: 0,
      communication: 0,
      cultural_fit: 0,
      motivation: 0,
      availability: 0,
      rate_fit: 0,
    };

    let overallSum = 0;

    for (const evaluation of evaluations) {
      // Sum scores
      for (const key of Object.keys(scoreSums)) {
        scoreSums[key] += evaluation[`score_${key}`] || 0;
      }
      overallSum += evaluation.overall_score || 0;

      // Count recommendations
      if (evaluation.recommendation) {
        summary.recommendations[evaluation.recommendation] =
          (summary.recommendations[evaluation.recommendation] || 0) + 1;
      }

      // Count strengths
      if (evaluation.strengths) {
        for (const strength of evaluation.strengths) {
          summary.common_strengths[strength] = (summary.common_strengths[strength] || 0) + 1;
        }
      }

      // Count weaknesses
      if (evaluation.weaknesses) {
        for (const weakness of evaluation.weaknesses) {
          summary.common_weaknesses[weakness] = (summary.common_weaknesses[weakness] || 0) + 1;
        }
      }
    }

    // Calculate averages
    for (const key of Object.keys(scoreSums)) {
      summary.average_scores[key] = parseFloat((scoreSums[key] / evaluations.length).toFixed(2));
    }
    summary.overall_average = parseFloat((overallSum / evaluations.length).toFixed(2));

    // Sort common strengths/weaknesses by frequency
    summary.top_strengths = Object.entries(summary.common_strengths)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    summary.top_weaknesses = Object.entries(summary.common_weaknesses)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return summary;
  }

  /**
   * Get evaluation statistics
   */
  async getEvaluationStats(rfpId?: string): Promise<any> {
    const evalCollection = this.db.getCollection(COLLECTIONS.EVALUATIONS);
    const appCollection = this.db.getCollection(COLLECTIONS.APPLICATIONS);

    let evaluations: any[];

    if (rfpId) {
      // Get applications for this RFP first
      const applications = await appCollection.repository.find({
        filter: { rfp_id: rfpId },
        fields: ['id'],
      });
      const appIds = applications.map((a: any) => a.id);

      evaluations = await evalCollection.repository.find({
        filter: { application_id: { $in: appIds } },
      });
    } else {
      evaluations = await evalCollection.repository.find({});
    }

    const stats: any = {
      total: evaluations.length,
      by_recommendation: {},
      by_rating: {},
      average_overall_score: 0,
    };

    let totalScore = 0;

    for (const evaluation of evaluations) {
      // By recommendation
      if (evaluation.recommendation) {
        stats.by_recommendation[evaluation.recommendation] =
          (stats.by_recommendation[evaluation.recommendation] || 0) + 1;
      }

      // By rating
      stats.by_rating[evaluation.overall_rating] =
        (stats.by_rating[evaluation.overall_rating] || 0) + 1;

      totalScore += evaluation.overall_score || 0;
    }

    stats.average_overall_score = evaluations.length > 0
      ? parseFloat((totalScore / evaluations.length).toFixed(2))
      : 0;

    return stats;
  }
}
