const { Plugin } = require("@nocobase/server");

class PrestagoTimesheetsPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_timesheets",
      title: "Timesheets",
      fields: [
        {
          type: "belongsTo",
          name: "mission",
          target: "prestago_missions",
          foreignKey: "mission_id"
        },
        {
          type: "belongsTo",
          name: "consultant",
          target: "users",
          foreignKey: "consultant_id"
        },
        {
          type: "date",
          name: "period_start",
          title: "Period Start"
        },
        {
          type: "date",
          name: "period_end",
          title: "Period End"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "draft"
        },
        {
          type: "decimal",
          name: "total_days",
          title: "Total Days"
        },
        {
          type: "date",
          name: "submitted_at",
          title: "Submitted At"
        },
        {
          type: "date",
          name: "approved_at",
          title: "Approved At"
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

    // Timesheet entries (daily breakdown)
    this.db.collection({
      name: "prestago_timesheet_entries",
      title: "Timesheet Entries",
      fields: [
        {
          type: "belongsTo",
          name: "timesheet",
          target: "prestago_timesheets",
          foreignKey: "timesheet_id"
        },
        {
          type: "date",
          name: "date",
          title: "Date"
        },
        {
          type: "decimal",
          name: "hours",
          title: "Hours"
        },
        {
          type: "text",
          name: "description",
          title: "Description"
        }
      ]
    });
  }

  async load() {
    this.app.logger.info("[PRESTAGO] Timesheets plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoTimesheetsPlugin;
