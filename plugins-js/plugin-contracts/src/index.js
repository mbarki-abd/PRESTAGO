const { Plugin } = require("@nocobase/server");

class PrestagoContractsPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_contracts",
      title: "Contracts",
      fields: [
        {
          type: "string",
          name: "contract_number",
          title: "Contract Number",
          unique: true,
          required: true
        },
        {
          type: "belongsTo",
          name: "mission",
          target: "prestago_missions",
          foreignKey: "mission_id"
        },
        {
          type: "string",
          name: "type",
          title: "Contract Type"
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
          type: "date",
          name: "signed_at",
          title: "Signed At"
        },
        {
          type: "text",
          name: "terms",
          title: "Terms and Conditions"
        },
        {
          type: "string",
          name: "document_url",
          title: "Document URL"
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
    this.app.logger.info("[PRESTAGO] Contracts plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoContractsPlugin;
