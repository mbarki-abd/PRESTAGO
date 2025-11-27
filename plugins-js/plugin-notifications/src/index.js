const { Plugin } = require("@nocobase/server");

class PrestagoNotificationsPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_notifications",
      title: "Notifications",
      fields: [
        {
          type: "belongsTo",
          name: "user",
          target: "users",
          foreignKey: "user_id"
        },
        {
          type: "string",
          name: "type",
          title: "Type"
        },
        {
          type: "string",
          name: "title",
          title: "Title"
        },
        {
          type: "text",
          name: "content",
          title: "Content"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "unread"
        },
        {
          type: "date",
          name: "read_at",
          title: "Read At"
        },
        {
          type: "json",
          name: "metadata",
          title: "Metadata"
        },
        {
          type: "string",
          name: "action_url",
          title: "Action URL"
        },
        {
          type: "date",
          name: "created_at",
          title: "Created At"
        }
      ]
    });
  }

  async load() {
    this.app.logger.info("[PRESTAGO] Notifications plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoNotificationsPlugin;
