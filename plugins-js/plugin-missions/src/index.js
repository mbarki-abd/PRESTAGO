const { Plugin } = require("@nocobase/server");

class PrestagoMissionsPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_missions",
      title: "Missions",
      fields: [
        {
          type: "string",
          name: "title",
          title: "Title",
          required: true
        },
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
          type: "belongsTo",
          name: "client",
          target: "users",
          foreignKey: "client_id"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "pending"
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
          name: "daily_rate",
          title: "Daily Rate"
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
    this.app.logger.info("[PRESTAGO] Missions plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoMissionsPlugin;
