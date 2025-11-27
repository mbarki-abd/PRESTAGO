// =============================================================================
// PRESTAGO - Skill Service
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';
import { ISkill, SkillCategory, SkillLevel } from '../../shared/types';

/**
 * Service for managing skills
 */
export class SkillService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new skill
   */
  async createSkill(data: Partial<ISkill>): Promise<ISkill> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);

    // Generate slug
    const slug = this.generateSlug(data.name || '');

    // Check if skill already exists
    const existing = await repo.findOne({
      filter: {
        $or: [
          { slug },
          { name: { $iLike: data.name } },
        ],
      },
    });

    if (existing) {
      throw new Error(`Skill "${data.name}" already exists`);
    }

    const skill = await repo.create({
      values: {
        ...data,
        slug,
        is_validated: false,
        usage_count: 0,
        search_count: 0,
      },
    });

    return skill;
  }

  /**
   * Get skill by ID
   */
  async getSkillById(skillId: string): Promise<ISkill | null> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    return repo.findOne({
      filterByTk: skillId,
      appends: ['parent', 'children'],
    });
  }

  /**
   * Get skill by slug
   */
  async getSkillBySlug(slug: string): Promise<ISkill | null> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    return repo.findOne({
      filter: { slug },
      appends: ['parent', 'children'],
    });
  }

  /**
   * Search skills by name
   */
  async searchSkills(
    query: string,
    options: {
      category?: SkillCategory;
      limit?: number;
      validated_only?: boolean;
    } = {}
  ): Promise<ISkill[]> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const { category, limit = 20, validated_only = false } = options;

    const filter: any = {
      $or: [
        { name: { $iLike: `%${query}%` } },
        { aliases: { $contains: query.toLowerCase() } },
      ],
    };

    if (category) {
      filter.category = category;
    }

    if (validated_only) {
      filter.is_validated = true;
    }

    const skills = await repo.find({
      filter,
      limit,
      sort: ['-usage_count', 'name'],
    });

    // Increment search count for tracking
    if (skills.length > 0) {
      await this.incrementSearchCount(skills.map((s: any) => s.id));
    }

    return skills;
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(
    category: SkillCategory,
    options: {
      limit?: number;
      includeChildren?: boolean;
    } = {}
  ): Promise<ISkill[]> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const { limit = 100, includeChildren = false } = options;

    const appends = includeChildren ? ['children'] : [];

    return repo.find({
      filter: {
        category,
        parent_id: null, // Only top-level skills
      },
      limit,
      sort: ['-usage_count', 'name'],
      appends,
    });
  }

  /**
   * Get all skills organized by category
   */
  async getSkillsGroupedByCategory(): Promise<Record<SkillCategory, ISkill[]>> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);

    const skills = await repo.find({
      filter: { parent_id: null },
      sort: ['category', '-usage_count', 'name'],
      appends: ['children'],
    });

    const grouped: Record<string, ISkill[]> = {};

    for (const skill of skills) {
      const category = (skill as any).category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    }

    return grouped as Record<SkillCategory, ISkill[]>;
  }

  /**
   * Get popular skills
   */
  async getPopularSkills(
    options: {
      limit?: number;
      category?: SkillCategory;
    } = {}
  ): Promise<ISkill[]> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const { limit = 20, category } = options;

    const filter: any = { is_validated: true };
    if (category) {
      filter.category = category;
    }

    return repo.find({
      filter,
      limit,
      sort: ['-usage_count'],
    });
  }

  /**
   * Add skill to profile
   */
  async addSkillToProfile(
    profileId: string,
    skillId: string,
    data: {
      level: SkillLevel;
      years_experience?: number;
      last_used_year?: number;
      is_primary?: boolean;
      is_highlighted?: boolean;
    }
  ): Promise<void> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    // Check if already exists
    const existing = await profileSkillsRepo.findOne({
      filter: { profile_id: profileId, skill_id: skillId },
    });

    if (existing) {
      throw new Error('Skill already added to profile');
    }

    // Get current count for sort order
    const count = await profileSkillsRepo.count({
      filter: { profile_id: profileId },
    });

    await profileSkillsRepo.create({
      values: {
        profile_id: profileId,
        skill_id: skillId,
        level: data.level,
        years_experience: data.years_experience,
        last_used_year: data.last_used_year,
        is_primary: data.is_primary || false,
        is_highlighted: data.is_highlighted || false,
        sort_order: count,
        is_verified: false,
        endorsements_count: 0,
      },
    });

    // Increment skill usage count
    await this.incrementUsageCount(skillId);
  }

  /**
   * Update profile skill
   */
  async updateProfileSkill(
    profileId: string,
    skillId: string,
    data: {
      level?: SkillLevel;
      years_experience?: number;
      last_used_year?: number;
      is_primary?: boolean;
      is_highlighted?: boolean;
    }
  ): Promise<void> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    await profileSkillsRepo.update({
      filter: { profile_id: profileId, skill_id: skillId },
      values: data,
    });
  }

  /**
   * Remove skill from profile
   */
  async removeSkillFromProfile(profileId: string, skillId: string): Promise<void> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    await profileSkillsRepo.destroy({
      filter: { profile_id: profileId, skill_id: skillId },
    });

    // Decrement skill usage count
    await this.decrementUsageCount(skillId);
  }

  /**
   * Get profile skills
   */
  async getProfileSkills(profileId: string): Promise<any[]> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    return profileSkillsRepo.find({
      filter: { profile_id: profileId },
      sort: ['-is_primary', '-is_highlighted', 'sort_order'],
      appends: ['skill'],
    });
  }

  /**
   * Reorder profile skills
   */
  async reorderProfileSkills(profileId: string, skillIds: string[]): Promise<void> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);

    for (let i = 0; i < skillIds.length; i++) {
      await profileSkillsRepo.update({
        filter: { profile_id: profileId, skill_id: skillIds[i] },
        values: { sort_order: i },
      });
    }
  }

  /**
   * Validate a skill (admin action)
   */
  async validateSkill(skillId: string, validatorId: string): Promise<ISkill> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);

    await repo.update({
      filterByTk: skillId,
      values: {
        is_validated: true,
        validated_by: validatorId,
        validated_at: new Date(),
      },
    });

    return repo.findOne({ filterByTk: skillId });
  }

  /**
   * Merge duplicate skills
   */
  async mergeSkills(targetSkillId: string, sourceSkillIds: string[]): Promise<void> {
    const profileSkillsRepo = this.db.getRepository(COLLECTIONS.PROFILE_SKILLS);
    const skillsRepo = this.db.getRepository(COLLECTIONS.SKILLS);

    // Update all profile skills to use target skill
    for (const sourceId of sourceSkillIds) {
      // Get all profile skills with source skill
      const profileSkills = await profileSkillsRepo.find({
        filter: { skill_id: sourceId },
      });

      for (const ps of profileSkills) {
        // Check if target skill already exists for this profile
        const existing = await profileSkillsRepo.findOne({
          filter: { profile_id: (ps as any).profile_id, skill_id: targetSkillId },
        });

        if (existing) {
          // Delete duplicate
          await profileSkillsRepo.destroy({ filterByTk: (ps as any).id });
        } else {
          // Update to target
          await profileSkillsRepo.update({
            filterByTk: (ps as any).id,
            values: { skill_id: targetSkillId },
          });
        }
      }

      // Add source skill name to target aliases
      const sourceSkill = await skillsRepo.findOne({ filterByTk: sourceId });
      const targetSkill = await skillsRepo.findOne({ filterByTk: targetSkillId });

      if (sourceSkill && targetSkill) {
        const aliases = (targetSkill as any).aliases || [];
        if (!aliases.includes((sourceSkill as any).name.toLowerCase())) {
          aliases.push((sourceSkill as any).name.toLowerCase());
        }

        await skillsRepo.update({
          filterByTk: targetSkillId,
          values: {
            aliases,
            usage_count: ((targetSkill as any).usage_count || 0) + ((sourceSkill as any).usage_count || 0),
          },
        });
      }

      // Delete source skill
      await skillsRepo.destroy({ filterByTk: sourceId });
    }
  }

  /**
   * Increment usage count
   */
  private async incrementUsageCount(skillId: string): Promise<void> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const skill = await repo.findOne({ filterByTk: skillId });

    if (skill) {
      await repo.update({
        filterByTk: skillId,
        values: { usage_count: ((skill as any).usage_count || 0) + 1 },
      });
    }
  }

  /**
   * Decrement usage count
   */
  private async decrementUsageCount(skillId: string): Promise<void> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);
    const skill = await repo.findOne({ filterByTk: skillId });

    if (skill) {
      await repo.update({
        filterByTk: skillId,
        values: { usage_count: Math.max(0, ((skill as any).usage_count || 0) - 1) },
      });
    }
  }

  /**
   * Increment search count for skills
   */
  private async incrementSearchCount(skillIds: string[]): Promise<void> {
    const repo = this.db.getRepository(COLLECTIONS.SKILLS);

    for (const skillId of skillIds) {
      const skill = await repo.findOne({ filterByTk: skillId });
      if (skill) {
        await repo.update({
          filterByTk: skillId,
          values: { search_count: ((skill as any).search_count || 0) + 1 },
        });
      }
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export default SkillService;
