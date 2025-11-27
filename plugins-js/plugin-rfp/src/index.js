const { Plugin } = require("@nocobase/server");

class PrestagoRFPPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_rfps",
      title: "RFPs",
      fields: [
        {
          type: "string",
          name: "title",
          title: "Title",
          required: true
        },
        {
          type: "text",
          name: "description",
          title: "Description"
        },
        {
          type: "belongsTo",
          name: "client",
          target: "users",
          foreignKey: "client_id"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "draft"
        },
        {
          type: "date",
          name: "start_date",
          title: "Start Date"
        },
        {
          type: "date",
          name: "end_date",
          title: "End Date"
        },
        {
          type: "decimal",
          name: "budget_min",
          title: "Minimum Budget"
        },
        {
          type: "decimal",
          name: "budget_max",
          title: "Maximum Budget"
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
    this.app.logger.info("[PRESTAGO] RFP plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoRFPPlugin;
