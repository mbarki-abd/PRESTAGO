const { Plugin } = require("@nocobase/server");

class PrestagoSkillsProfilesPlugin extends Plugin {
  async beforeLoad() {
    // Skills collection
    this.db.collection({
      name: "prestago_skills",
      title: "Skills",
      fields: [
        {
          type: "string",
          name: "name",
          title: "Skill Name",
          required: true
        },
        {
          type: "string",
          name: "category",
          title: "Category"
        },
        {
          type: "text",
          name: "description",
          title: "Description"
        }
      ]
    });

    // Consultant Profiles collection
    this.db.collection({
      name: "prestago_consultant_profiles",
      title: "Consultant Profiles",
      fields: [
        {
          type: "belongsTo",
          name: "user",
          target: "users",
          foreignKey: "user_id"
        },
        {
          type: "string",
          name: "title",
          title: "Professional Title"
        },
        {
          type: "text",
          name: "bio",
          title: "Biography"
        },
        {
          type: "integer",
          name: "years_experience",
          title: "Years of Experience"
        },
        {
          type: "decimal",
          name: "daily_rate",
          title: "Daily Rate"
        },
        {
          type: "string",
          name: "availability_status",
          title: "Availability Status"
        },
        {
          type: "belongsToMany",
          name: "skills",
          target: "prestago_skills",
          through: "prestago_consultant_skills"
        }
      ]
    });

    // Junction table for consultant skills
    this.db.collection({
      name: "prestago_consultant_skills",
      fields: [
        {
          type: "belongsTo",
          name: "consultant_profile",
          target: "prestago_consultant_profiles"
        },
        {
          type: "belongsTo",
          name: "skill",
          target: "prestago_skills"
        },
        {
          type: "integer",
          name: "proficiency_level",
          title: "Proficiency Level"
        }
      ]
    });
  }

  async load() {
    this.app.logger.info("[PRESTAGO] Skills & Profiles plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoSkillsProfilesPlugin;
