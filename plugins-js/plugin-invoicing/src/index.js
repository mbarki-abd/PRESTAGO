const { Plugin } = require("@nocobase/server");

class PrestagoInvoicingPlugin extends Plugin {
  async beforeLoad() {
    this.db.collection({
      name: "prestago_invoices",
      title: "Invoices",
      fields: [
        {
          type: "string",
          name: "invoice_number",
          title: "Invoice Number",
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
          type: "belongsTo",
          name: "timesheet",
          target: "prestago_timesheets",
          foreignKey: "timesheet_id"
        },
        {
          type: "string",
          name: "status",
          title: "Status",
          defaultValue: "draft"
        },
        {
          type: "decimal",
          name: "amount_ht",
          title: "Amount (Excluding Tax)"
        },
        {
          type: "decimal",
          name: "vat_rate",
          title: "VAT Rate"
        },
        {
          type: "decimal",
          name: "amount_ttc",
          title: "Amount (Including Tax)"
        },
        {
          type: "date",
          name: "due_date",
          title: "Due Date"
        },
        {
          type: "date",
          name: "issued_at",
          title: "Issued At"
        },
        {
          type: "date",
          name: "paid_at",
          title: "Paid At"
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
    this.app.logger.info("[PRESTAGO] Invoicing plugin loaded");
  }

  async install() {
    await this.db.sync();
  }
}

module.exports = PrestagoInvoicingPlugin;
