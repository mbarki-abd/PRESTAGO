const { Plugin } = require("@nocobase/server");

class PrestagoReportingPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_dashboards",
      title: "Dashboards",
      fields: [
        {
          type: "string",
          name: "name",
          title: "Name",
          required: true
        },
        {
          type: "string",
          name: "type",
          title: "Type"
        },
        {
          type: "belongsTo",
          name: "owner",
          target: "users",
          foreignKey: "owner_id"
        },
        {
          type: "boolean",
          name: "is_default",
          title: "Is Default",
          defaultValue: false
        },
        {
          type: "json",
          name: "layout",
          title: "Layout Configuration"
        },
        {
          type: "json",
          name: "widgets",
          title: "Widgets"
        },
        {
          type: "text",
          name: "description",
          title: "Description"
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

    // Reports collection for scheduled/saved reports
    this.db.collection({
      name: "prestago_reports",
      title: "Reports",
      fields: [
        {
          type: "string",
          name: "name",
          title: "Name",
          required: true
        },
        {
          type: "string",
          name: "type",
          title: "Report Type"
        },
        {
          type: "belongsTo",
          name: "owner",
          target: "users",
          foreignKey: "owner_id"
        },
        {
          type: "json",
          name: "filters",
          title: "Filters"
        },
        {
          type: "json",
          name: "configuration",
          title: "Configuration"
        },
        {
          type: "string",
          name: "schedule",
          title: "Schedule (Cron Expression)"
        },
        {
          type: "date",
          name: "last_generated_at",
          title: "Last Generated At"
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
    this.app.logger.info("[PRESTAGO] Reporting plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoReportingPlugin;
