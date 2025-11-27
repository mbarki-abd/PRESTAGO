// =============================================================================
// PRESTAGO - Plugin RFP - Service: RFP Search & Filters
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, PAGINATION } from '../../shared/constants';
import { RFPStatus, RFPVisibility, IRFPSearchFilters } from '../../shared/types';

export class RFPSearchService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Search RFPs with filters
   */
  async searchRFPs(
    filters: IRFPSearchFilters,
    options: {
      page?: number;
      pageSize?: number;
      sort?: string[];
      userId?: string;
      organizationId?: string;
    } = {}
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const pageSize = Math.min(
      options.pageSize || PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    const offset = (page - 1) * pageSize;

    // Build filter conditions
    const where: any = this.buildFilterConditions(filters, options);

    // Get total count
    const total = await collection.repository.count({ filter: where });

    // Get paginated results
    const data = await collection.repository.find({
      filter: where,
      limit: pageSize,
      offset,
      sort: options.sort || ['-published_at', '-created_at'],
      appends: ['skill_requirements', 'skill_requirements.skill', 'client_organization'],
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Build filter conditions for search
   */
  private buildFilterConditions(
    filters: IRFPSearchFilters,
    options: { userId?: string; organizationId?: string }
  ): any {
    const conditions: any = {};

    // Text search (title, description)
    if (filters.query) {
      conditions.$or = [
        { title: { $iLike: `%${filters.query}%` } },
        { description: { $iLike: `%${filters.query}%` } },
        { reference_number: { $iLike: `%${filters.query}%` } },
      ];
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      conditions.status = { $in: filters.status };
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      conditions.priority = { $in: filters.priority };
    }

    // Visibility filter (with access control)
    if (filters.visibility && filters.visibility.length > 0) {
      conditions.visibility = { $in: filters.visibility };
    } else {
      // Default: only show accessible RFPs
      conditions.$or = conditions.$or || [];
      conditions.$or.push(
        { visibility: RFPVisibility.PUBLIC },
        { visibility: RFPVisibility.ORGANIZATION_ONLY, client_organization_id: options.organizationId },
        { created_by_user_id: options.userId }
      );
    }

    // Organization filter
    if (filters.client_organization_id) {
      conditions.client_organization_id = filters.client_organization_id;
    }

    // Mission types
    if (filters.mission_types && filters.mission_types.length > 0) {
      conditions.mission_type = { $in: filters.mission_types };
    }

    // Contract types
    if (filters.contract_types && filters.contract_types.length > 0) {
      conditions.contract_types = { $overlap: filters.contract_types };
    }

    // Work modes
    if (filters.work_modes && filters.work_modes.length > 0) {
      conditions.work_mode = { $in: filters.work_modes };
    }

    // Experience levels
    if (filters.experience_levels && filters.experience_levels.length > 0) {
      conditions.experience_level = { $in: filters.experience_levels };
    }

    // Location filters
    if (filters.location_cities && filters.location_cities.length > 0) {
      conditions.location_city = { $in: filters.location_cities };
    }

    if (filters.location_countries && filters.location_countries.length > 0) {
      conditions.location_country = { $in: filters.location_countries };
    }

    // Daily rate range
    if (filters.daily_rate_min !== undefined) {
      conditions.daily_rate_max = { $gte: filters.daily_rate_min };
    }
    if (filters.daily_rate_max !== undefined) {
      conditions.daily_rate_min = { $lte: filters.daily_rate_max };
    }

    // Duration range
    if (filters.duration_min_months !== undefined) {
      conditions.duration_months = { $gte: filters.duration_min_months };
    }
    if (filters.duration_max_months !== undefined) {
      conditions.duration_months = { ...conditions.duration_months, $lte: filters.duration_max_months };
    }

    // Start date range
    if (filters.start_date_from) {
      conditions.estimated_start_date = { $gte: new Date(filters.start_date_from) };
    }
    if (filters.start_date_to) {
      conditions.estimated_start_date = {
        ...conditions.estimated_start_date,
        $lte: new Date(filters.start_date_to)
      };
    }

    // Positions filter
    if (filters.positions_min !== undefined) {
      conditions.positions_count = { $gte: filters.positions_min };
    }

    // Published after
    if (filters.published_after) {
      conditions.published_at = { $gte: new Date(filters.published_after) };
    }

    // Deadline before (still open)
    if (filters.deadline_before) {
      conditions.application_deadline = {
        $gte: new Date(), // Not expired
        $lte: new Date(filters.deadline_before),
      };
    }

    // Remote availability
    if (filters.has_remote === true) {
      conditions.$or = conditions.$or || [];
      conditions.$or.push(
        { work_mode: 'remote' },
        { work_mode: 'hybrid' },
        { remote_percentage: { $gt: 0 } }
      );
    }

    return conditions;
  }

  /**
   * Get published RFPs (public listing)
   */
  async getPublishedRFPs(
    options: {
      page?: number;
      pageSize?: number;
      sort?: string[];
    } = {}
  ): Promise<any> {
    return this.searchRFPs(
      { status: [RFPStatus.PUBLISHED], visibility: [RFPVisibility.PUBLIC] },
      options
    );
  }

  /**
   * Get RFPs matching a consultant profile
   */
  async getMatchingRFPsForProfile(
    profileId: string,
    options: { page?: number; pageSize?: number } = {}
  ): Promise<any> {
    // Get profile data
    const profileCollection = this.db.getCollection('prestago_consultant_profiles');
    const profileSkillsCollection = this.db.getCollection('prestago_profile_skills');

    const profile = await profileCollection.repository.findOne({
      filter: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get profile skills
    const profileSkills = await profileSkillsCollection.repository.find({
      filter: { profile_id: profileId },
    });

    const skillIds = profileSkills.map((ps: any) => ps.skill_id);

    // Find RFPs with matching skills
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const skillReqCollection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    // Get RFPs that require any of the profile's skills
    const matchingRequirements = await skillReqCollection.repository.find({
      filter: {
        skill_id: { $in: skillIds },
      },
      fields: ['rfp_id'],
    });

    const rfpIds = [...new Set(matchingRequirements.map((r: any) => r.rfp_id))];

    // Build filter based on profile preferences
    const filters: IRFPSearchFilters = {
      status: [RFPStatus.PUBLISHED],
    };

    // Match work mode
    if (profile.preferred_work_mode && profile.preferred_work_mode !== 'any') {
      filters.work_modes = [profile.preferred_work_mode, 'hybrid'];
    }

    // Match location
    if (profile.location_city) {
      filters.location_cities = [profile.location_city];
    }

    // Match experience level
    if (profile.experience_level) {
      // Include same level and below
      const levels = ['junior', 'confirmed', 'senior', 'lead', 'expert'];
      const profileLevelIndex = levels.indexOf(profile.experience_level);
      filters.experience_levels = levels.slice(0, profileLevelIndex + 1) as any;
    }

    // Match daily rate
    if (profile.daily_rate_min) {
      filters.daily_rate_min = profile.daily_rate_min;
    }

    // Search with combined filters
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;

    const baseResults = await this.searchRFPs(filters, { page, pageSize });

    // Prioritize RFPs with skill matches
    const prioritized = baseResults.data.sort((a: any, b: any) => {
      const aHasSkillMatch = rfpIds.includes(a.id);
      const bHasSkillMatch = rfpIds.includes(b.id);
      if (aHasSkillMatch && !bHasSkillMatch) return -1;
      if (!aHasSkillMatch && bHasSkillMatch) return 1;
      return 0;
    });

    return {
      ...baseResults,
      data: prioritized,
    };
  }

  /**
   * Get similar RFPs
   */
  async getSimilarRFPs(rfpId: string, limit = 5): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const skillReqCollection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    // Get the reference RFP
    const rfp = await collection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      return [];
    }

    // Get skills of this RFP
    const skills = await skillReqCollection.repository.find({
      filter: { rfp_id: rfpId },
    });

    const skillIds = skills.map((s: any) => s.skill_id);

    // Find other RFPs with similar skills
    const similarSkillReqs = await skillReqCollection.repository.find({
      filter: {
        skill_id: { $in: skillIds },
        rfp_id: { $ne: rfpId },
      },
    });

    // Count skill matches per RFP
    const rfpMatchCounts: Record<string, number> = {};
    for (const req of similarSkillReqs) {
      rfpMatchCounts[req.rfp_id] = (rfpMatchCounts[req.rfp_id] || 0) + 1;
    }

    // Sort by match count
    const sortedRfpIds = Object.entries(rfpMatchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (sortedRfpIds.length === 0) {
      // Fallback: get RFPs in same domain/industry
      return collection.repository.find({
        filter: {
          id: { $ne: rfpId },
          status: RFPStatus.PUBLISHED,
          $or: [
            { industry: rfp.industry },
            { mission_domain: rfp.mission_domain },
            { location_city: rfp.location_city },
          ],
        },
        limit,
        sort: ['-published_at'],
      });
    }

    // Get full RFP data
    return collection.repository.find({
      filter: {
        id: { $in: sortedRfpIds },
        status: RFPStatus.PUBLISHED,
      },
      appends: ['client_organization'],
    });
  }

  /**
   * Get facets for search filters
   */
  async getSearchFacets(baseFilters?: IRFPSearchFilters): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    // Base filter for published/public RFPs
    const baseFilter: any = {
      status: RFPStatus.PUBLISHED,
      visibility: RFPVisibility.PUBLIC,
    };

    const allRfps = await collection.repository.find({
      filter: baseFilter,
    });

    // Calculate facets
    const facets: any = {
      status: {},
      priority: {},
      mission_type: {},
      work_mode: {},
      experience_level: {},
      location_city: {},
      location_country: {},
      industry: {},
      mission_domain: {},
    };

    for (const rfp of allRfps) {
      // Status
      facets.status[rfp.status] = (facets.status[rfp.status] || 0) + 1;

      // Priority
      if (rfp.priority) {
        facets.priority[rfp.priority] = (facets.priority[rfp.priority] || 0) + 1;
      }

      // Mission type
      if (rfp.mission_type) {
        facets.mission_type[rfp.mission_type] = (facets.mission_type[rfp.mission_type] || 0) + 1;
      }

      // Work mode
      if (rfp.work_mode) {
        facets.work_mode[rfp.work_mode] = (facets.work_mode[rfp.work_mode] || 0) + 1;
      }

      // Experience level
      if (rfp.experience_level) {
        facets.experience_level[rfp.experience_level] = (facets.experience_level[rfp.experience_level] || 0) + 1;
      }

      // Location
      if (rfp.location_city) {
        facets.location_city[rfp.location_city] = (facets.location_city[rfp.location_city] || 0) + 1;
      }
      if (rfp.location_country) {
        facets.location_country[rfp.location_country] = (facets.location_country[rfp.location_country] || 0) + 1;
      }

      // Industry
      if (rfp.industry) {
        facets.industry[rfp.industry] = (facets.industry[rfp.industry] || 0) + 1;
      }

      // Mission domain
      if (rfp.mission_domain) {
        facets.mission_domain[rfp.mission_domain] = (facets.mission_domain[rfp.mission_domain] || 0) + 1;
      }
    }

    // Calculate daily rate range
    const ratesMin = allRfps.filter((r: any) => r.daily_rate_min).map((r: any) => r.daily_rate_min);
    const ratesMax = allRfps.filter((r: any) => r.daily_rate_max).map((r: any) => r.daily_rate_max);

    facets.daily_rate_range = {
      min: ratesMin.length > 0 ? Math.min(...ratesMin) : 0,
      max: ratesMax.length > 0 ? Math.max(...ratesMax) : 0,
    };

    // Calculate duration range
    const durations = allRfps.filter((r: any) => r.duration_months).map((r: any) => r.duration_months);
    facets.duration_range = {
      min: durations.length > 0 ? Math.min(...durations) : 1,
      max: durations.length > 0 ? Math.max(...durations) : 36,
    };

    return facets;
  }

  /**
   * Get trending/popular RFPs
   */
  async getTrendingRFPs(limit = 10): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    return collection.repository.find({
      filter: {
        status: RFPStatus.PUBLISHED,
        visibility: RFPVisibility.PUBLIC,
        application_deadline: { $gte: new Date() },
      },
      sort: ['-views_count', '-applications_count', '-published_at'],
      limit,
      appends: ['client_organization', 'skill_requirements'],
    });
  }

  /**
   * Get recently published RFPs
   */
  async getRecentRFPs(limit = 10): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);

    return collection.repository.find({
      filter: {
        status: RFPStatus.PUBLISHED,
        visibility: RFPVisibility.PUBLIC,
      },
      sort: ['-published_at'],
      limit,
      appends: ['client_organization'],
    });
  }

  /**
   * Get RFPs closing soon
   */
  async getClosingSoonRFPs(days = 7, limit = 10): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFPS);
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return collection.repository.find({
      filter: {
        status: RFPStatus.PUBLISHED,
        visibility: RFPVisibility.PUBLIC,
        application_deadline: {
          $gte: now,
          $lte: deadline,
        },
      },
      sort: ['application_deadline'],
      limit,
      appends: ['client_organization'],
    });
  }
}
