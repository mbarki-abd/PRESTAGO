// =============================================================================
// PRESTAGO - Plugin Missions - Service: Évaluations de mission
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, EVALUATION_WEIGHTS, calculateOverallScore } from '../../shared/constants';
import { MISSION_EVENTS } from '../../shared/types';

export class EvaluationService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Soumettre une évaluation
   */
  async submitEvaluation(data: {
    mission_id: string;
    evaluator_type: 'client' | 'consultant';
    evaluation_period?: 'interim' | 'final';
    scores: {
      quality: number;
      communication: number;
      reliability: number;
      expertise: number;
      collaboration: number;
    };
    strengths?: string[];
    improvements?: string[];
    comments?: string;
    would_recommend: boolean;
    would_work_again: boolean;
    is_public?: boolean;
  }, evaluatorId: string): Promise<any> {
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);
    const evalCollection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    // Vérifier que la mission existe
    const mission = await missionCollection.repository.findOne({
      filter: { id: data.mission_id }
    });

    if (!mission) {
      throw new Error('Mission non trouvée');
    }

    // Vérifier que l'évaluateur peut évaluer cette mission
    if (data.evaluator_type === 'client' && mission.client_manager_id !== evaluatorId) {
      throw new Error('Seul le responsable client peut soumettre une évaluation côté client');
    }

    if (data.evaluator_type === 'consultant' && mission.consultant_id !== evaluatorId) {
      throw new Error('Seul le consultant de la mission peut soumettre une évaluation côté consultant');
    }

    // Valider les scores (1-5)
    for (const [key, score] of Object.entries(data.scores)) {
      if (score < 1 || score > 5) {
        throw new Error(`Le score ${key} doit être entre 1 et 5`);
      }
    }

    // Vérifier qu'une évaluation n'existe pas déjà pour cette période
    const existingEval = await evalCollection.repository.findOne({
      filter: {
        mission_id: data.mission_id,
        evaluator_id: evaluatorId,
        evaluation_period: data.evaluation_period || 'final'
      }
    });

    if (existingEval) {
      throw new Error('Une évaluation existe déjà pour cette période');
    }

    // Calculer le score global
    const overallScore = calculateOverallScore(data.scores);

    const evaluation = await evalCollection.repository.create({
      values: {
        mission_id: data.mission_id,
        evaluator_id: evaluatorId,
        evaluator_type: data.evaluator_type,
        evaluation_period: data.evaluation_period || 'final',
        quality_score: data.scores.quality,
        communication_score: data.scores.communication,
        reliability_score: data.scores.reliability,
        expertise_score: data.scores.expertise,
        collaboration_score: data.scores.collaboration,
        overall_score: overallScore,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        comments: data.comments,
        would_recommend: data.would_recommend,
        would_work_again: data.would_work_again,
        is_public: data.is_public || false
      }
    });

    // Mettre à jour le score du profil si évaluation par le client
    if (data.evaluator_type === 'client' && mission.profile_id) {
      await this.updateProfileRating(mission.profile_id);
    }

    // Ajouter à l'historique
    await this.addMissionHistory(
      data.mission_id,
      evaluatorId,
      'evaluation_added',
      `Évaluation ${data.evaluator_type} ajoutée (score: ${overallScore})`
    );

    if (this.eventEmitter) {
      this.eventEmitter.emit(MISSION_EVENTS.EVALUATION_SUBMITTED, {
        evaluation,
        mission,
        evaluatorId
      });
    }

    return evaluation;
  }

  /**
   * Obtenir les évaluations d'une mission
   */
  async getEvaluationsByMission(missionId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    return collection.repository.find({
      filter: { mission_id: missionId },
      appends: ['evaluator'],
      sort: ['-created_at']
    });
  }

  /**
   * Obtenir les évaluations d'un profil
   */
  async getEvaluationsByProfile(profileId: string, publicOnly: boolean = false): Promise<any[]> {
    const missionCollection = this.db.getCollection(COLLECTIONS.MISSIONS);
    const evalCollection = this.db.getCollection(COLLECTIONS.EVALUATIONS);

    // Récupérer les missions du profil
    const missions = await missionCollection.repository.find({
      filter: { profile_id: profileId },
      fields: ['id']
    });

    const missionIds = missions.map((m: any) => m.id);

    const filter: any = {
      mission_id: { $in: missionIds },
      evaluator_type: 'client' // Seules les évaluations clients comptent pour le profil
    };

    if (publicOnly) {
      filter.is_public = true;
    }

    return evalCollection.repository.find({
      filter,
      appends: ['mission'],
      sort: ['-created_at']
    });
  }

  /**
   * Obtenir le résumé des évaluations d'un profil
   */
  async getProfileEvaluationSummary(profileId: string): Promise<any> {
    const evaluations = await this.getEvaluationsByProfile(profileId);

    if (evaluations.length === 0) {
      return null;
    }

    const summary: any = {
      count: evaluations.length,
      average_scores: {
        quality: 0,
        communication: 0,
        reliability: 0,
        expertise: 0,
        collaboration: 0,
        overall: 0
      },
      recommendation_rate: 0,
      work_again_rate: 0,
      common_strengths: {},
      common_improvements: {}
    };

    let recommendCount = 0;
    let workAgainCount = 0;

    for (const evaluation of evaluations) {
      // Somme des scores
      summary.average_scores.quality += evaluation.quality_score || 0;
      summary.average_scores.communication += evaluation.communication_score || 0;
      summary.average_scores.reliability += evaluation.reliability_score || 0;
      summary.average_scores.expertise += evaluation.expertise_score || 0;
      summary.average_scores.collaboration += evaluation.collaboration_score || 0;
      summary.average_scores.overall += evaluation.overall_score || 0;

      // Recommandations
      if (evaluation.would_recommend) recommendCount++;
      if (evaluation.would_work_again) workAgainCount++;

      // Points forts
      if (evaluation.strengths) {
        for (const strength of evaluation.strengths) {
          summary.common_strengths[strength] = (summary.common_strengths[strength] || 0) + 1;
        }
      }

      // Axes d'amélioration
      if (evaluation.improvements) {
        for (const improvement of evaluation.improvements) {
          summary.common_improvements[improvement] = (summary.common_improvements[improvement] || 0) + 1;
        }
      }
    }

    // Calculer les moyennes
    const count = evaluations.length;
    for (const key of Object.keys(summary.average_scores)) {
      summary.average_scores[key] = parseFloat((summary.average_scores[key] / count).toFixed(2));
    }

    summary.recommendation_rate = Math.round((recommendCount / count) * 100);
    summary.work_again_rate = Math.round((workAgainCount / count) * 100);

    // Top 5 points forts et améliorations
    summary.top_strengths = Object.entries(summary.common_strengths)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    summary.top_improvements = Object.entries(summary.common_improvements)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return summary;
  }

  /**
   * Mettre à jour la note du profil
   */
  private async updateProfileRating(profileId: string): Promise<void> {
    const summary = await this.getProfileEvaluationSummary(profileId);

    if (!summary) return;

    const profileCollection = this.db.getCollection('prestago_profiles');

    await profileCollection.repository.update({
      filter: { id: profileId },
      values: {
        rating: summary.average_scores.overall,
        rating_count: summary.count
      }
    });
  }

  /**
   * Ajouter à l'historique de la mission
   */
  private async addMissionHistory(
    missionId: string,
    userId: string,
    action: string,
    description?: string
  ): Promise<void> {
    const historyCollection = this.db.getCollection(COLLECTIONS.HISTORY);

    await historyCollection.repository.create({
      values: {
        mission_id: missionId,
        user_id: userId,
        action,
        description
      }
    });
  }
}
