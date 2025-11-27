// =============================================================================
// PRESTAGO - Plugin RFP - Service: Profile-RFP Matching
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, MATCHING_WEIGHTS, MATCH_THRESHOLDS } from '../../shared/constants';
import { IRFPMatchScore, SkillRequirementType, RFP_EVENTS } from '../../shared/types';

export class RFPMatchingService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Calculate match score between a profile and an RFP
   */
  async calculateMatchScore(profileId: string, rfpId: string): Promise<IRFPMatchScore> {
    // Get profile with skills
    const profileCollection = this.db.getCollection('prestago_consultant_profiles');
    const profileSkillsCollection = this.db.getCollection('prestago_profile_skills');

    const profile = await profileCollection.repository.findOne({
      filter: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const profileSkills = await profileSkillsCollection.repository.find({
      filter: { profile_id: profileId },
      appends: ['skill'],
    });

    // Get RFP with skill requirements
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const skillReqCollection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    const rfp = await rfpCollection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    const rfpSkillRequirements = await skillReqCollection.repository.find({
      filter: { rfp_id: rfpId },
      appends: ['skill'],
    });

    // Calculate individual scores
    const skillsScore = this.calculateSkillsScore(profileSkills, rfpSkillRequirements);
    const experienceScore = this.calculateExperienceScore(profile, rfp);
    const locationScore = this.calculateLocationScore(profile, rfp);
    const availabilityScore = this.calculateAvailabilityScore(profile, rfp);
    const rateScore = this.calculateRateScore(profile, rfp);

    // Calculate overall score (weighted average)
    const overall = Math.round(
      (skillsScore.score * 0.35) +
      (experienceScore * 0.20) +
      (locationScore * 0.15) +
      (availabilityScore * 0.15) +
      (rateScore * 0.15)
    );

    const matchScore: IRFPMatchScore = {
      rfp_id: rfpId,
      profile_id: profileId,
      overall_score: overall,
      scores: {
        skills: skillsScore.score,
        experience: experienceScore,
        location: locationScore,
        availability: availabilityScore,
        rate: rateScore,
      },
      matching_skills: skillsScore.details,
      missing_mandatory_skills: skillsScore.missingMandatory,
      missing_preferred_skills: skillsScore.missingPreferred,
      calculated_at: new Date(),
    };

    return matchScore;
  }

  /**
   * Calculate skills matching score
   */
  private calculateSkillsScore(
    profileSkills: any[],
    rfpRequirements: any[]
  ): {
    score: number;
    details: any[];
    missingMandatory: string[];
    missingPreferred: string[];
  } {
    if (rfpRequirements.length === 0) {
      return {
        score: 100,
        details: [],
        missingMandatory: [],
        missingPreferred: [],
      };
    }

    const profileSkillMap = new Map<string, any>();
    for (const ps of profileSkills) {
      profileSkillMap.set(ps.skill_id, ps);
    }

    const details: any[] = [];
    const missingMandatory: string[] = [];
    const missingPreferred: string[] = [];

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const req of rfpRequirements) {
      const weight = this.getRequirementWeight(req.requirement_type);
      totalWeight += weight * (req.weight || 5);

      const profileSkill = profileSkillMap.get(req.skill_id);
      const matched = !!profileSkill;

      const detail = {
        skill_id: req.skill_id,
        skill_name: req.skill?.name || 'Unknown',
        requirement_type: req.requirement_type,
        required_level: req.minimum_level,
        profile_level: profileSkill?.level || null,
        match: matched,
      };

      if (matched) {
        // Check level match
        let levelMatch = 1;
        if (req.minimum_level && profileSkill.level) {
          levelMatch = this.compareLevels(profileSkill.level, req.minimum_level);
        }

        // Check years match
        let yearsMatch = 1;
        if (req.minimum_years && profileSkill.years_experience) {
          yearsMatch = profileSkill.years_experience >= req.minimum_years ? 1 : 0.5;
        }

        matchedWeight += weight * (req.weight || 5) * levelMatch * yearsMatch;
      } else {
        // Track missing skills
        if (req.requirement_type === SkillRequirementType.MANDATORY) {
          missingMandatory.push(req.skill?.name || req.skill_id);
        } else if (req.requirement_type === SkillRequirementType.PREFERRED) {
          missingPreferred.push(req.skill?.name || req.skill_id);
        }
      }

      details.push(detail);
    }

    // If missing mandatory skills, cap score at 60
    let score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
    if (missingMandatory.length > 0) {
      score = Math.min(score, 60);
    }

    return {
      score,
      details,
      missingMandatory,
      missingPreferred,
    };
  }

  /**
   * Get weight for requirement type
   */
  private getRequirementWeight(type: SkillRequirementType): number {
    switch (type) {
      case SkillRequirementType.MANDATORY:
        return MATCHING_WEIGHTS.MANDATORY_SKILL;
      case SkillRequirementType.PREFERRED:
        return MATCHING_WEIGHTS.PREFERRED_SKILL;
      case SkillRequirementType.NICE_TO_HAVE:
        return MATCHING_WEIGHTS.NICE_TO_HAVE_SKILL;
      default:
        return 1;
    }
  }

  /**
   * Compare skill levels
   */
  private compareLevels(profileLevel: string, requiredLevel: string): number {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const profileIndex = levels.indexOf(profileLevel);
    const requiredIndex = levels.indexOf(requiredLevel);

    if (profileIndex >= requiredIndex) {
      return 1; // Meets or exceeds
    }
    if (profileIndex === requiredIndex - 1) {
      return 0.7; // One level below
    }
    return 0.4; // More than one level below
  }

  /**
   * Calculate experience score
   */
  private calculateExperienceScore(profile: any, rfp: any): number {
    let score = 0;

    // Experience level match
    const levels = ['junior', 'confirmed', 'senior', 'lead', 'expert'];
    const profileLevelIndex = levels.indexOf(profile.experience_level);
    const rfpLevelIndex = levels.indexOf(rfp.experience_level);

    if (profileLevelIndex >= rfpLevelIndex) {
      score += MATCHING_WEIGHTS.EXPERIENCE_LEVEL_MATCH;
    } else if (profileLevelIndex === rfpLevelIndex - 1) {
      score += MATCHING_WEIGHTS.EXPERIENCE_LEVEL_MATCH * 0.5;
    }

    // Years experience match
    if (rfp.years_experience_min && profile.years_experience) {
      if (profile.years_experience >= rfp.years_experience_min) {
        score += MATCHING_WEIGHTS.YEARS_EXPERIENCE_MATCH;
      } else if (profile.years_experience >= rfp.years_experience_min - 1) {
        score += MATCHING_WEIGHTS.YEARS_EXPERIENCE_MATCH * 0.5;
      }
    } else {
      score += MATCHING_WEIGHTS.YEARS_EXPERIENCE_MATCH; // No requirement
    }

    const maxScore = MATCHING_WEIGHTS.EXPERIENCE_LEVEL_MATCH + MATCHING_WEIGHTS.YEARS_EXPERIENCE_MATCH;
    return Math.round((score / maxScore) * 100);
  }

  /**
   * Calculate location score
   */
  private calculateLocationScore(profile: any, rfp: any): number {
    let score = 0;
    const maxScore = MATCHING_WEIGHTS.LOCATION_MATCH + MATCHING_WEIGHTS.REMOTE_AVAILABLE;

    // Remote work
    if (rfp.work_mode === 'remote') {
      score += maxScore; // Full score if remote
      return 100;
    }

    // Location match
    if (profile.location_city === rfp.location_city) {
      score += MATCHING_WEIGHTS.LOCATION_MATCH;
    } else if (profile.location_country === rfp.location_country) {
      score += MATCHING_WEIGHTS.LOCATION_MATCH * 0.5;
    }

    // Hybrid with remote percentage
    if (rfp.work_mode === 'hybrid' && rfp.remote_percentage) {
      if (rfp.remote_percentage >= 50) {
        score += MATCHING_WEIGHTS.REMOTE_AVAILABLE;
      } else {
        score += MATCHING_WEIGHTS.REMOTE_AVAILABLE * (rfp.remote_percentage / 100);
      }
    }

    // Check mobility
    if (profile.mobility && profile.mobility_radius) {
      // Could calculate distance - simplified for now
      score += MATCHING_WEIGHTS.LOCATION_MATCH * 0.3;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(profile: any, rfp: any): number {
    // Check if profile is available
    if (profile.availability_status === 'not_available') {
      return 0;
    }

    if (profile.availability_status === 'on_mission') {
      // Check if available by start date
      if (profile.available_from && rfp.estimated_start_date) {
        const availableDate = new Date(profile.available_from);
        const startDate = new Date(rfp.estimated_start_date);
        if (availableDate <= startDate) {
          return MATCHING_WEIGHTS.AVAILABILITY_MATCH;
        }
        // Partial score if available within a month of start
        const diffDays = (availableDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 30) {
          return Math.round(MATCHING_WEIGHTS.AVAILABILITY_MATCH * 0.7);
        }
        return Math.round(MATCHING_WEIGHTS.AVAILABILITY_MATCH * 0.3);
      }
      return Math.round(MATCHING_WEIGHTS.AVAILABILITY_MATCH * 0.5);
    }

    if (profile.availability_status === 'partially_available') {
      return Math.round(MATCHING_WEIGHTS.AVAILABILITY_MATCH * 0.7);
    }

    // Fully available
    return 100;
  }

  /**
   * Calculate rate compatibility score
   */
  private calculateRateScore(profile: any, rfp: any): number {
    // If no budget specified, full compatibility
    if (!rfp.daily_rate_min && !rfp.daily_rate_max) {
      return 100;
    }

    // If profile has no rate, neutral score
    if (!profile.daily_rate_min && !profile.daily_rate_max) {
      return 50;
    }

    const profileRate = profile.daily_rate_min || profile.daily_rate_max || 0;
    const rfpMaxRate = rfp.daily_rate_max || rfp.daily_rate_min || 0;
    const rfpMinRate = rfp.daily_rate_min || 0;

    // Profile rate within budget
    if (profileRate >= rfpMinRate && profileRate <= rfpMaxRate) {
      return 100;
    }

    // Profile rate slightly above budget (up to 20%)
    if (profileRate > rfpMaxRate) {
      const overBy = (profileRate - rfpMaxRate) / rfpMaxRate;
      if (overBy <= 0.1) return 80;
      if (overBy <= 0.2) return 60;
      if (overBy <= 0.3) return 40;
      return 20;
    }

    // Profile rate below minimum (might indicate experience mismatch)
    const underBy = (rfpMinRate - profileRate) / rfpMinRate;
    if (underBy <= 0.2) return 90;
    return 70;
  }

  /**
   * Find best matching profiles for an RFP
   */
  async findMatchingProfiles(
    rfpId: string,
    options: {
      minScore?: number;
      limit?: number;
      excludeMissingMandatory?: boolean;
    } = {}
  ): Promise<Array<IRFPMatchScore & { profile: any }>> {
    const minScore = options.minScore || MATCH_THRESHOLDS.ACCEPTABLE;
    const limit = options.limit || 50;

    // Get all active profiles
    const profileCollection = this.db.getCollection('prestago_consultant_profiles');
    const profiles = await profileCollection.repository.find({
      filter: {
        status: 'active',
        availability_status: { $ne: 'not_available' },
      },
    });

    // Calculate match scores
    const matches: Array<IRFPMatchScore & { profile: any }> = [];

    for (const profile of profiles) {
      try {
        const score = await this.calculateMatchScore(profile.id, rfpId);

        // Filter by minimum score
        if (score.overall_score < minScore) continue;

        // Optionally exclude profiles missing mandatory skills
        if (options.excludeMissingMandatory && score.missing_mandatory_skills.length > 0) {
          continue;
        }

        matches.push({
          ...score,
          profile,
        });
      } catch (error) {
        console.error(`Error calculating match for profile ${profile.id}:`, error);
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.overall_score - a.overall_score);

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_MATCHING_COMPLETED, {
        rfpId,
        matchCount: matches.length,
      });
    }

    return matches.slice(0, limit);
  }

  /**
   * Find best matching RFPs for a profile
   */
  async findMatchingRFPs(
    profileId: string,
    options: {
      minScore?: number;
      limit?: number;
    } = {}
  ): Promise<Array<IRFPMatchScore & { rfp: any }>> {
    const minScore = options.minScore || MATCH_THRESHOLDS.ACCEPTABLE;
    const limit = options.limit || 50;

    // Get all published RFPs
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfps = await rfpCollection.repository.find({
      filter: {
        status: 'published',
        visibility: { $in: ['public', 'organization_only'] },
        application_deadline: { $gte: new Date() },
      },
    });

    // Calculate match scores
    const matches: Array<IRFPMatchScore & { rfp: any }> = [];

    for (const rfp of rfps) {
      try {
        const score = await this.calculateMatchScore(profileId, rfp.id);

        if (score.overall_score >= minScore) {
          matches.push({
            ...score,
            rfp,
          });
        }
      } catch (error) {
        console.error(`Error calculating match for RFP ${rfp.id}:`, error);
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.overall_score - a.overall_score);

    return matches.slice(0, limit);
  }

  /**
   * Get match quality label
   */
  getMatchQuality(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (score >= MATCH_THRESHOLDS.EXCELLENT) return 'excellent';
    if (score >= MATCH_THRESHOLDS.GOOD) return 'good';
    if (score >= MATCH_THRESHOLDS.ACCEPTABLE) return 'acceptable';
    return 'poor';
  }

  /**
   * Get match recommendations
   */
  async getMatchRecommendations(profileId: string, rfpId: string): Promise<string[]> {
    const score = await this.calculateMatchScore(profileId, rfpId);
    const recommendations: string[] = [];

    // Skills recommendations
    if (score.missing_mandatory_skills.length > 0) {
      recommendations.push(
        `Acquire these mandatory skills: ${score.missing_mandatory_skills.join(', ')}`
      );
    }
    if (score.missing_preferred_skills.length > 0 && score.missing_preferred_skills.length <= 3) {
      recommendations.push(
        `Consider adding these preferred skills: ${score.missing_preferred_skills.join(', ')}`
      );
    }

    // Score-specific recommendations
    if (score.scores.experience < 50) {
      recommendations.push('Gain more experience in this domain to improve your match');
    }
    if (score.scores.rate < 50) {
      recommendations.push('Your rate expectations may not align with this RFP budget');
    }
    if (score.scores.location < 50) {
      recommendations.push('Consider if you can accommodate the location requirements');
    }
    if (score.scores.availability < 50) {
      recommendations.push('Update your availability status if it has changed');
    }

    return recommendations;
  }
}
