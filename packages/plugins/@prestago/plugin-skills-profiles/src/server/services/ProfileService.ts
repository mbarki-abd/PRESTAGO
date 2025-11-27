// =============================================================================
// PRESTAGO - Profile Service
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS, COMPLETENESS_WEIGHTS, COMPLETENESS_REQUIREMENTS } from '../../shared/constants';
import {
  IConsultantProfile,
  IProfileCompleteness,
  ProfileStatus,
  ProfileVisibility,
  AvailabilityStatus,
  ExperienceLevel,
} from '../../shared/types';

/**
 * Service for managing consultant profiles
 */
export class ProfileService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new profile for a user
   */
  async createProfile(userId: string, data: Partial<IConsultantProfile>): Promise<IConsultantProfile> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    // Check if profile already exists
    const existing = await repo.findOne({ filter: { user_id: userId } });
    if (existing) {
      throw new Error('Profile already exists for this user');
    }

    // Generate slug from user info
    const userRepo = this.db.getRepository('prestago_users');
    const user = await userRepo.findOne({ filterByTk: userId });
    const slug = this.generateSlug(user?.first_name, user?.last_name);

    // Create profile with defaults
    const profile = await repo.create({
      values: {
        user_id: userId,
        slug,
        status: ProfileStatus.DRAFT,
        visibility: ProfileVisibility.PUBLIC,
        availability_status: AvailabilityStatus.AVAILABLE,
        experience_level: ExperienceLevel.CONFIRMED,
        years_experience: 0,
        daily_rate_currency: 'EUR',
        rate_negotiable: true,
        location_country: 'FR',
        completeness_score: 0,
        views_count: 0,
        applications_count: 0,
        missions_count: 0,
        ...data,
      },
    });

    // Calculate initial completeness
    await this.recalculateCompleteness(profile.id);

    return profile;
  }

  /**
   * Update profile data
   */
  async updateProfile(profileId: string, data: Partial<IConsultantProfile>): Promise<IConsultantProfile> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    await repo.update({
      filterByTk: profileId,
      values: {
        ...data,
        updated_at: new Date(),
      },
    });

    // Recalculate completeness
    await this.recalculateCompleteness(profileId);

    const profile = await repo.findOne({
      filterByTk: profileId,
      appends: ['user', 'profile_skills', 'experiences', 'educations', 'certifications', 'languages', 'documents'],
    });

    return profile;
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<IConsultantProfile | null> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    const profile = await repo.findOne({
      filter: { user_id: userId },
      appends: ['user', 'profile_skills', 'profile_skills.skill', 'experiences', 'educations', 'certifications', 'languages', 'documents'],
    });

    return profile;
  }

  /**
   * Get profile by ID with all relations
   */
  async getProfileById(profileId: string): Promise<IConsultantProfile | null> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    const profile = await repo.findOne({
      filterByTk: profileId,
      appends: ['user', 'profile_skills', 'profile_skills.skill', 'experiences', 'educations', 'certifications', 'languages', 'documents'],
    });

    return profile;
  }

  /**
   * Get profile by slug (for public URLs)
   */
  async getProfileBySlug(slug: string): Promise<IConsultantProfile | null> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    const profile = await repo.findOne({
      filter: {
        slug,
        status: ProfileStatus.ACTIVE,
        visibility: { $ne: ProfileVisibility.PRIVATE },
      },
      appends: ['user', 'profile_skills', 'profile_skills.skill', 'experiences', 'educations', 'certifications', 'languages'],
    });

    return profile;
  }

  /**
   * Calculate and update profile completeness score
   */
  async recalculateCompleteness(profileId: string): Promise<IProfileCompleteness> {
    const profile = await this.getProfileById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const sections: IProfileCompleteness['sections'] = {
      basic_info: 0,
      skills: 0,
      experience: 0,
      education: 0,
      certifications: 0,
      languages: 0,
      documents: 0,
      preferences: 0,
    };

    const missing_fields: string[] = [];
    const recommendations: string[] = [];

    // Basic Info (15 points)
    let basicScore = 0;
    if (profile.title) basicScore += 4;
    else missing_fields.push('title');

    if (profile.headline && profile.headline.length >= COMPLETENESS_REQUIREMENTS.MIN_HEADLINE_LENGTH) basicScore += 3;
    else missing_fields.push('headline');

    if (profile.summary && profile.summary.length >= COMPLETENESS_REQUIREMENTS.MIN_SUMMARY_LENGTH) basicScore += 4;
    else {
      missing_fields.push('summary');
      recommendations.push('Add a detailed summary (at least 100 characters) to attract employers');
    }

    if (profile.location_city) basicScore += 2;
    else missing_fields.push('location_city');

    if (profile.years_experience > 0) basicScore += 2;
    sections.basic_info = Math.min(basicScore, COMPLETENESS_WEIGHTS.BASIC_INFO);

    // Skills (25 points)
    const profileSkills = (profile as any).profile_skills || [];
    const primarySkills = profileSkills.filter((ps: any) => ps.is_primary);

    if (profileSkills.length >= COMPLETENESS_REQUIREMENTS.MIN_SKILLS) {
      sections.skills = 15;
    } else if (profileSkills.length > 0) {
      sections.skills = Math.round((profileSkills.length / COMPLETENESS_REQUIREMENTS.MIN_SKILLS) * 15);
      recommendations.push(`Add ${COMPLETENESS_REQUIREMENTS.MIN_SKILLS - profileSkills.length} more skills to complete your profile`);
    } else {
      missing_fields.push('skills');
      recommendations.push('Add at least 5 skills to your profile');
    }

    if (primarySkills.length >= COMPLETENESS_REQUIREMENTS.MIN_PRIMARY_SKILLS) {
      sections.skills += 10;
    } else if (primarySkills.length > 0) {
      sections.skills += Math.round((primarySkills.length / COMPLETENESS_REQUIREMENTS.MIN_PRIMARY_SKILLS) * 10);
      recommendations.push(`Mark ${COMPLETENESS_REQUIREMENTS.MIN_PRIMARY_SKILLS - primarySkills.length} more skills as primary`);
    }
    sections.skills = Math.min(sections.skills, COMPLETENESS_WEIGHTS.SKILLS);

    // Experience (20 points)
    const experiences = (profile as any).experiences || [];
    if (experiences.length >= COMPLETENESS_REQUIREMENTS.MIN_EXPERIENCES) {
      // Check quality
      const hasDetailedExperience = experiences.some((exp: any) =>
        exp.description && exp.description.length > 50
      );
      sections.experience = hasDetailedExperience ? 20 : 15;
      if (!hasDetailedExperience) {
        recommendations.push('Add detailed descriptions to your experiences');
      }
    } else {
      missing_fields.push('experience');
      recommendations.push('Add at least one work experience');
    }

    // Education (10 points)
    const educations = (profile as any).educations || [];
    if (educations.length >= COMPLETENESS_REQUIREMENTS.MIN_EDUCATIONS) {
      sections.education = 10;
    } else {
      missing_fields.push('education');
      recommendations.push('Add your educational background');
    }

    // Certifications (10 points - optional but valuable)
    const certifications = (profile as any).certifications || [];
    if (certifications.length > 0) {
      sections.certifications = Math.min(certifications.length * 3, 10);
    } else {
      recommendations.push('Adding certifications can increase your visibility');
    }

    // Languages (5 points)
    const languages = (profile as any).languages || [];
    if (languages.length >= COMPLETENESS_REQUIREMENTS.MIN_LANGUAGES) {
      sections.languages = 5;
    } else {
      missing_fields.push('languages');
      recommendations.push('Add at least one language');
    }

    // Documents (10 points)
    const documents = (profile as any).documents || [];
    const hasCV = documents.some((doc: any) => doc.type === 'cv');
    if (hasCV) {
      sections.documents = 10;
    } else {
      missing_fields.push('cv');
      recommendations.push('Upload your CV to receive more opportunities');
    }

    // Preferences (5 points)
    let prefScore = 0;
    if (profile.availability_status) prefScore += 1;
    if (profile.daily_rate_min || profile.daily_rate_max) prefScore += 2;
    if (profile.work_mode) prefScore += 1;
    if ((profile.contract_preferences as any)?.length > 0) prefScore += 1;
    sections.preferences = Math.min(prefScore, COMPLETENESS_WEIGHTS.PREFERENCES);

    // Calculate total
    const total_score = Object.values(sections).reduce((sum, val) => sum + val, 0);

    // Update profile
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);
    await repo.update({
      filterByTk: profileId,
      values: {
        completeness_score: total_score,
        completeness_details: {
          sections,
          missing_fields,
          recommendations,
          calculated_at: new Date(),
        },
      },
    });

    return {
      total_score,
      sections,
      missing_fields,
      recommendations,
    };
  }

  /**
   * Update availability status
   */
  async updateAvailability(
    profileId: string,
    status: AvailabilityStatus,
    availableFrom?: Date,
    daysPerWeek?: number
  ): Promise<IConsultantProfile> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    await repo.update({
      filterByTk: profileId,
      values: {
        availability_status: status,
        available_from: availableFrom,
        available_days_per_week: daysPerWeek,
        updated_at: new Date(),
      },
    });

    return repo.findOne({ filterByTk: profileId });
  }

  /**
   * Activate profile (change from draft to active)
   */
  async activateProfile(profileId: string): Promise<IConsultantProfile> {
    const profile = await this.getProfileById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check minimum requirements
    const completeness = await this.recalculateCompleteness(profileId);
    if (completeness.total_score < 50) {
      throw new Error('Profile must be at least 50% complete to activate. ' +
        `Current: ${completeness.total_score}%. Missing: ${completeness.missing_fields.join(', ')}`);
    }

    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);
    await repo.update({
      filterByTk: profileId,
      values: {
        status: ProfileStatus.ACTIVE,
        updated_at: new Date(),
      },
    });

    return repo.findOne({ filterByTk: profileId });
  }

  /**
   * Deactivate profile
   */
  async deactivateProfile(profileId: string): Promise<IConsultantProfile> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    await repo.update({
      filterByTk: profileId,
      values: {
        status: ProfileStatus.INACTIVE,
        updated_at: new Date(),
      },
    });

    return repo.findOne({ filterByTk: profileId });
  }

  /**
   * Increment profile view count
   */
  async recordProfileView(profileId: string, viewerId?: string): Promise<void> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);
    const profile = await repo.findOne({ filterByTk: profileId });

    if (profile) {
      await repo.update({
        filterByTk: profileId,
        values: {
          views_count: (profile.views_count || 0) + 1,
          last_activity_at: new Date(),
        },
      });

      // Optionally record detailed view in a separate table
      // This would allow tracking who viewed the profile
    }
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(firstName?: string, lastName?: string): string {
    const base = [firstName, lastName]
      .filter(Boolean)
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Add random suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeProfileId?: string): Promise<boolean> {
    const repo = this.db.getRepository(COLLECTIONS.CONSULTANT_PROFILES);

    const filter: any = { slug };
    if (excludeProfileId) {
      filter.id = { $ne: excludeProfileId };
    }

    const existing = await repo.findOne({ filter });
    return !existing;
  }
}

export default ProfileService;
