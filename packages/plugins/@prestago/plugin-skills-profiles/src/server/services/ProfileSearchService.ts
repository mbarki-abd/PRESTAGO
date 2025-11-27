// =============================================================================
// PRESTAGO - Profile Search Service
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, SEARCH_CONFIG, SKILL_LEVEL_WEIGHTS } from '../../shared/constants';
import {
  IProfileSearchFilters,
  IProfileSearchResult,
  ProfileStatus,
  ProfileVisibility,
} from '../../shared/types';

interface SearchOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'recent' | 'experience' | 'rate_asc' | 'rate_desc';
  organizationId?: string;
}

/**
 * Service for searching consultant profiles
 */
export class ProfileSearchService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Search profiles with filters
   */
  async searchProfiles(
    filters: IProfileSearchFilters,
    options: SearchOptions = {}
  ): Promise<{
    results: IProfileSearchResult[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      pageSize = Math.min(options.pageSize || SEARCH_CONFIG.DEFAULT_PAGE_SIZE, SEARCH_CONFIG.MAX_PAGE_SIZE),
      sortBy = 'relevance',
      organizationId,
    } = options;

    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    // Build base filter
    const filter: any = {
      status: ProfileStatus.ACTIVE,
    };

    // Visibility filter
    if (organizationId) {
      filter.$or = [
        { visibility: ProfileVisibility.PUBLIC },
        { visibility: ProfileVisibility.ORGANIZATION_ONLY, organization_id: organizationId },
      ];
    } else {
      filter.visibility = ProfileVisibility.PUBLIC;
    }

    // Apply filters
    if (filters.organization_id) {
      filter.organization_id = filters.organization_id;
    }

    if (filters.experience_levels?.length) {
      filter.experience_level = { $in: filters.experience_levels };
    }

    if (filters.availability_status?.length) {
      filter.availability_status = { $in: filters.availability_status };
    }

    if (filters.contract_preferences?.length) {
      filter.contract_preferences = { $overlap: filters.contract_preferences };
    }

    if (filters.work_modes?.length) {
      filter.work_mode = { $in: filters.work_modes };
    }

    if (filters.location_countries?.length) {
      filter.location_country = { $in: filters.location_countries };
    }

    if (filters.location_cities?.length) {
      filter.location_city = { $in: filters.location_cities };
    }

    if (filters.daily_rate_min !== undefined) {
      filter.daily_rate_max = { $gte: filters.daily_rate_min };
    }

    if (filters.daily_rate_max !== undefined) {
      filter.daily_rate_min = { $lte: filters.daily_rate_max };
    }

    if (filters.years_experience_min !== undefined) {
      filter.years_experience = { $gte: filters.years_experience_min };
    }

    if (filters.years_experience_max !== undefined) {
      filter.years_experience = {
        ...filter.years_experience,
        $lte: filters.years_experience_max,
      };
    }

    if (filters.is_freelance !== undefined) {
      if (filters.is_freelance) {
        filter.organization_id = null;
      } else {
        filter.organization_id = { $ne: null };
      }
    }

    // Text search
    if (filters.query && filters.query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      filter.$or = [
        ...(filter.$or || []),
        { title: { $iLike: `%${filters.query}%` } },
        { headline: { $iLike: `%${filters.query}%` } },
        { summary: { $iLike: `%${filters.query}%` } },
        { keywords: { $contains: filters.query.toLowerCase() } },
      ];
    }

    // Determine sort
    let sort: any = ['-completeness_score', '-last_activity_at'];
    switch (sortBy) {
      case 'recent':
        sort = ['-last_activity_at', '-completeness_score'];
        break;
      case 'experience':
        sort = ['-years_experience', '-completeness_score'];
        break;
      case 'rate_asc':
        sort = ['daily_rate_min', '-completeness_score'];
        break;
      case 'rate_desc':
        sort = ['-daily_rate_max', '-completeness_score'];
        break;
    }

    // Execute query
    const [profiles, total] = await Promise.all([
      repo.find({
        filter,
        sort,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        appends: ['user', 'profile_skills', 'profile_skills.skill'],
      }),
      repo.count({ filter }),
    ]);

    // Filter by skills if specified (complex query)
    let filteredProfiles = profiles;
    if (filters.skill_ids?.length) {
      filteredProfiles = profiles.filter((profile: any) => {
        const profileSkillIds = profile.profile_skills?.map((ps: any) => ps.skill_id) || [];
        return filters.skill_ids!.some(skillId => profileSkillIds.includes(skillId));
      });
    }

    // Calculate match scores if searching by skills
    const results: IProfileSearchResult[] = filteredProfiles.map((profile: any) => {
      const result: IProfileSearchResult = {
        profile,
        user: {
          id: profile.user?.id,
          first_name: profile.user?.first_name,
          last_name: profile.user?.last_name,
          avatar_url: profile.user?.avatar_url,
        },
        skills: (profile.profile_skills || []).map((ps: any) => ({
          skill: ps.skill,
          level: ps.level,
          years_experience: ps.years_experience,
        })),
      };

      // Calculate match score for skill-based search
      if (filters.skill_ids?.length) {
        result.match_score = this.calculateMatchScore(profile, filters.skill_ids);
      }

      return result;
    });

    // Sort by match score if skill search
    if (filters.skill_ids?.length && sortBy === 'relevance') {
      results.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }

    return {
      results,
      total: filters.skill_ids?.length ? filteredProfiles.length : total,
      page,
      pageSize,
      totalPages: Math.ceil((filters.skill_ids?.length ? filteredProfiles.length : total) / pageSize),
    };
  }

  /**
   * Calculate match score for a profile against requested skills
   */
  private calculateMatchScore(profile: any, requestedSkillIds: string[]): number {
    let score = 0;
    const profileSkills = profile.profile_skills || [];

    for (const skillId of requestedSkillIds) {
      const profileSkill = profileSkills.find((ps: any) => ps.skill_id === skillId);

      if (profileSkill) {
        // Base score for having the skill
        let skillScore = 25;

        // Level bonus
        const levelWeight = SKILL_LEVEL_WEIGHTS[profileSkill.level as keyof typeof SKILL_LEVEL_WEIGHTS] || 1;
        skillScore *= levelWeight;

        // Primary skill bonus
        if (profileSkill.is_primary) {
          skillScore *= SEARCH_CONFIG.BOOST_PRIMARY_SKILLS;
        }

        // Highlighted skill bonus
        if (profileSkill.is_highlighted) {
          skillScore *= SEARCH_CONFIG.BOOST_HIGHLIGHTED_SKILLS;
        }

        // Experience bonus
        if (profileSkill.years_experience) {
          skillScore += profileSkill.years_experience * 2;
        }

        // Recency bonus
        const currentYear = new Date().getFullYear();
        if (profileSkill.last_used_year && profileSkill.last_used_year >= currentYear - 2) {
          skillScore *= SEARCH_CONFIG.BOOST_RECENT_EXPERIENCE;
        }

        // Verified bonus
        if (profileSkill.is_verified) {
          skillScore *= SEARCH_CONFIG.BOOST_VERIFIED_EXPERIENCE;
        }

        score += skillScore;
      }
    }

    // Normalize by number of requested skills
    return Math.round(score / requestedSkillIds.length);
  }

  /**
   * Get similar profiles based on skills
   */
  async getSimilarProfiles(
    profileId: string,
    limit: number = 5
  ): Promise<IProfileSearchResult[]> {
    const profileRepo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    // Get source profile's skills
    const sourceSkills = await profileSkillsRepo.find({
      filter: { profile_id: profileId, is_primary: true },
    });

    if (!sourceSkills.length) {
      return [];
    }

    const skillIds = sourceSkills.map((s: any) => s.skill_id);

    // Find profiles with similar skills
    const { results } = await this.searchProfiles(
      { skill_ids: skillIds },
      { pageSize: limit + 1 } // +1 to exclude self
    );

    // Remove self and return
    return results.filter(r => r.profile.id !== profileId).slice(0, limit);
  }

  /**
   * Get profile suggestions for a client based on their RFP history
   */
  async getSuggestedProfiles(
    clientId: string,
    limit: number = 10
  ): Promise<IProfileSearchResult[]> {
    // This would typically analyze the client's RFP history
    // and suggest profiles that match common requirements
    // For now, return top rated available profiles

    const { results } = await this.searchProfiles(
      { availability_status: ['available', 'partially_available'] },
      { pageSize: limit, sortBy: 'relevance' }
    );

    return results;
  }

  /**
   * Search profiles by skills with AI matching (placeholder for Claude integration)
   */
  async searchProfilesWithAI(
    requirementsText: string,
    options: SearchOptions = {}
  ): Promise<{
    results: IProfileSearchResult[];
    extractedSkills: string[];
    explanation: string;
  }> {
    // TODO: Integrate with Claude/OpenAI to:
    // 1. Extract skills from requirements text
    // 2. Understand context and priorities
    // 3. Provide match explanations

    // For now, do basic keyword extraction
    const words = requirementsText.toLowerCase().split(/\s+/);
    const skillRepo = this.db.getRepository(COLLECTIONS.SKILLS);

    const matchingSkills = await skillRepo.find({
      filter: {
        $or: words.map(word => ({
          $or: [
            { name: { $iLike: `%${word}%` } },
            { aliases: { $contains: word } },
          ],
        })),
      },
      limit: 10,
    });

    const skillIds = matchingSkills.map((s: any) => s.id);
    const { results } = await this.searchProfiles({ skill_ids: skillIds }, options);

    return {
      results,
      extractedSkills: matchingSkills.map((s: any) => s.name),
      explanation: `Found ${results.length} profiles matching skills: ${matchingSkills.map((s: any) => s.name).join(', ')}`,
    };
  }
}

export default ProfileSearchService;
