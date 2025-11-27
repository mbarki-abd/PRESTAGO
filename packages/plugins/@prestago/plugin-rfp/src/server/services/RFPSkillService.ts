// =============================================================================
// PRESTAGO - Plugin RFP - Service: RFP Skill Requirements
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, VALIDATION } from '../../shared/constants';
import { SkillRequirementType, RFP_EVENTS } from '../../shared/types';

export class RFPSkillService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Add skill requirement to RFP
   */
  async addSkillRequirement(
    rfpId: string,
    skillId: string,
    data: {
      requirement_type: SkillRequirementType;
      minimum_level?: string;
      minimum_years?: number;
      weight?: number;
      notes?: string;
    },
    userId?: string
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    // Check if skill already exists for this RFP
    const existing = await collection.repository.findOne({
      filter: { rfp_id: rfpId, skill_id: skillId },
    });

    if (existing) {
      throw new Error('This skill is already added to the RFP');
    }

    // Validate max skills
    const currentCount = await collection.repository.count({
      filter: { rfp_id: rfpId },
    });

    if (currentCount >= VALIDATION.SKILLS_MAX) {
      throw new Error(`Maximum ${VALIDATION.SKILLS_MAX} skills allowed per RFP`);
    }

    const requirement = await collection.repository.create({
      values: {
        rfp_id: rfpId,
        skill_id: skillId,
        requirement_type: data.requirement_type || SkillRequirementType.MANDATORY,
        minimum_level: data.minimum_level,
        minimum_years: data.minimum_years,
        weight: data.weight || 5,
        notes: data.notes,
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_SKILL_ADDED, {
        rfpId,
        skillId,
        requirement,
        userId,
      });
    }

    return requirement;
  }

  /**
   * Update skill requirement
   */
  async updateSkillRequirement(
    rfpId: string,
    skillId: string,
    data: {
      requirement_type?: SkillRequirementType;
      minimum_level?: string;
      minimum_years?: number;
      weight?: number;
      notes?: string;
    }
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    const existing = await collection.repository.findOne({
      filter: { rfp_id: rfpId, skill_id: skillId },
    });

    if (!existing) {
      throw new Error('Skill requirement not found');
    }

    const updated = await collection.repository.update({
      filter: { id: existing.id },
      values: data,
    });

    return updated[0];
  }

  /**
   * Remove skill requirement from RFP
   */
  async removeSkillRequirement(rfpId: string, skillId: string, userId?: string): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    await collection.repository.destroy({
      filter: { rfp_id: rfpId, skill_id: skillId },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_SKILL_REMOVED, {
        rfpId,
        skillId,
        userId,
      });
    }
  }

  /**
   * Get all skill requirements for an RFP
   */
  async getSkillRequirements(rfpId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    return collection.repository.find({
      filter: { rfp_id: rfpId },
      appends: ['skill'],
      sort: ['-requirement_type', '-weight'],
    });
  }

  /**
   * Get mandatory skills for an RFP
   */
  async getMandatorySkills(rfpId: string): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    return collection.repository.find({
      filter: {
        rfp_id: rfpId,
        requirement_type: SkillRequirementType.MANDATORY,
      },
      appends: ['skill'],
    });
  }

  /**
   * Bulk add skills to RFP
   */
  async bulkAddSkills(
    rfpId: string,
    skills: Array<{
      skill_id: string;
      requirement_type: SkillRequirementType;
      minimum_level?: string;
      minimum_years?: number;
      weight?: number;
    }>,
    userId?: string
  ): Promise<any[]> {
    const results: any[] = [];

    for (const skill of skills) {
      try {
        const result = await this.addSkillRequirement(
          rfpId,
          skill.skill_id,
          {
            requirement_type: skill.requirement_type,
            minimum_level: skill.minimum_level,
            minimum_years: skill.minimum_years,
            weight: skill.weight,
          },
          userId
        );
        results.push(result);
      } catch (error) {
        // Skip if skill already exists
        console.warn(`Skipping skill ${skill.skill_id}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Copy skills from another RFP
   */
  async copySkillsFromRFP(sourceRfpId: string, targetRfpId: string, userId?: string): Promise<any[]> {
    const sourceSkills = await this.getSkillRequirements(sourceRfpId);

    const skillsToAdd = sourceSkills.map((s) => ({
      skill_id: s.skill_id,
      requirement_type: s.requirement_type,
      minimum_level: s.minimum_level,
      minimum_years: s.minimum_years,
      weight: s.weight,
    }));

    return this.bulkAddSkills(targetRfpId, skillsToAdd, userId);
  }

  /**
   * Get RFPs requiring a specific skill
   */
  async getRFPsRequiringSkill(skillId: string, requirementType?: SkillRequirementType): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    const filter: any = { skill_id: skillId };
    if (requirementType) {
      filter.requirement_type = requirementType;
    }

    const requirements = await collection.repository.find({
      filter,
      appends: ['rfp'],
    });

    return requirements.map((r: any) => r.rfp).filter(Boolean);
  }

  /**
   * Get skill statistics for RFPs
   */
  async getSkillStats(organizationId?: string): Promise<any> {
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const skillReqCollection = this.db.getCollection(COLLECTIONS.RFP_SKILL_REQUIREMENTS);

    // Get all RFP IDs for the organization (if specified)
    let rfpIds: string[] = [];
    if (organizationId) {
      const rfps = await rfpCollection.repository.find({
        filter: { client_organization_id: organizationId },
        fields: ['id'],
      });
      rfpIds = rfps.map((r: any) => r.id);
    }

    const filter: any = rfpIds.length > 0 ? { rfp_id: { $in: rfpIds } } : {};

    const allRequirements = await skillReqCollection.repository.find({
      filter,
      appends: ['skill'],
    });

    // Count skills by frequency
    const skillCounts: Record<string, { count: number; skill: any; byType: Record<string, number> }> = {};

    for (const req of allRequirements) {
      const skillId = req.skill_id;
      if (!skillCounts[skillId]) {
        skillCounts[skillId] = {
          count: 0,
          skill: req.skill,
          byType: {},
        };
      }
      skillCounts[skillId].count++;
      skillCounts[skillId].byType[req.requirement_type] =
        (skillCounts[skillId].byType[req.requirement_type] || 0) + 1;
    }

    // Sort by frequency
    const sortedSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([skillId, data]) => ({
        skill_id: skillId,
        skill_name: data.skill?.name,
        total_count: data.count,
        by_requirement_type: data.byType,
      }));

    return {
      total_requirements: allRequirements.length,
      unique_skills: Object.keys(skillCounts).length,
      most_requested: sortedSkills.slice(0, 20),
      by_requirement_type: {
        mandatory: allRequirements.filter((r: any) => r.requirement_type === 'mandatory').length,
        preferred: allRequirements.filter((r: any) => r.requirement_type === 'preferred').length,
        nice_to_have: allRequirements.filter((r: any) => r.requirement_type === 'nice_to_have').length,
      },
    };
  }
}
