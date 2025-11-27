const { Plugin } = require("@nocobase/server");

class PrestagoUsersPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_users",
      title: "Users",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "email", type: "string", unique: true },
        { name: "first_name", type: "string" },
        { name: "last_name", type: "string" },
        { name: "role", type: "string", defaultValue: "freelance" },
        { name: "status", type: "string", defaultValue: "pending" },
        { name: "organization_id", type: "uuid" },
        { name: "created_at", type: "date", interface: "createdAt" },
        { name: "updated_at", type: "date", interface: "updatedAt" }
      ]
    });
    this.db.collection({
      name: "prestago_organizations",
      title: "Organizations",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "name", type: "string" },
        { name: "type", type: "string" },
        { name: "siret", type: "string" },
        { name: "status", type: "string", defaultValue: "active" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });
  }

  async load() {
    this.app.logger.info("[PRESTAGO] Users plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoUsersPlugin;
