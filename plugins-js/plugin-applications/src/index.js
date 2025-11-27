const { Plugin } = require("@nocobase/server");

class PrestagoApplicationsPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_applications",
      title: "Applications",
      fields: [
        {
          type: "belongsTo",
          name: "rfp",
          target: "prestago_rfps",
          foreignKey: "rfp_id"
        },
        {
          type: "belongsTo",
          name: "consultant",
          target: "users",
          foreignKey: "consultant_id"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "pending"
        },
        {
          type: "text",
          name: "cover_letter",
          title: "Cover Letter"
        },
        {
          type: "decimal",
          name: "proposed_rate",
          title: "Proposed Rate"
        },
        {
          type: "decimal",
          name: "matching_score",
          title: "Matching Score"
        },
        {
          type: "date",
          name: "created_at",
          title: "Created At"
        },
        {
          type: "date",
          name: "updated_at",
          title: "Updated At"
        }
      ]
    });
  }

  async load() {
    this.app.logger.info("[PRESTAGO] Applications plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoApplicationsPlugin;
