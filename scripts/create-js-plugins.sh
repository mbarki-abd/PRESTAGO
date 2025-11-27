#!/bin/bash
# Create JavaScript versions of PRESTAGO plugins for NocoBase

PLUGINS_DIR="/app/nocobase/storage/plugins"

# Helper function to create a plugin
create_plugin() {
  local name=$1
  local display_name=$2
  local collections=$3

  mkdir -p "$PLUGINS_DIR/$name/src"

  cat > "$PLUGINS_DIR/$name/package.json" << EOF
{
  "name": "@prestago/$name",
  "version": "1.0.0",
  "description": "PRESTAGO - $display_name",
  "main": "src/index.js",
  "peerDependencies": {
    "@nocobase/server": "*"
  }
}
EOF

  cat > "$PLUGINS_DIR/$name/src/index.js" << JSEOF
const { Plugin } = require("@nocobase/server");

class Prestago${display_name//[- ]/}Plugin extends Plugin {
  async afterAdd() {
    this.app.logger.info("[PRESTAGO] $display_name plugin added");
  }

  async beforeLoad() {
$collections
    this.app.logger.info("[PRESTAGO] $display_name collections registered");
  }

  async load() {
    this.app.logger.info("[PRESTAGO] $display_name plugin loaded");
  }

  async install() {
    await this.db.sync();
    this.app.logger.info("[PRESTAGO] $display_name plugin installed");
  }
}

module.exports = Prestago${display_name//[- ]/}Plugin;
JSEOF

  echo "Created $name"
}

# Plugin: Users
create_plugin "plugin-users" "Users" '
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
        { name: "phone", type: "string" },
        { name: "avatar_url", type: "string" },
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
        { name: "address", type: "text" },
        { name: "status", type: "string", defaultValue: "active" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Skills & Profiles
create_plugin "plugin-skills-profiles" "SkillsProfiles" '
    this.db.collection({
      name: "prestago_skills",
      title: "Skills",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "name", type: "string" },
        { name: "category", type: "string" },
        { name: "level", type: "integer", defaultValue: 1 },
        { name: "is_validated", type: "boolean", defaultValue: false },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });
    this.db.collection({
      name: "prestago_consultant_profiles",
      title: "Consultant Profiles",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "user_id", type: "uuid" },
        { name: "title", type: "string" },
        { name: "summary", type: "text" },
        { name: "daily_rate", type: "decimal" },
        { name: "availability", type: "string" },
        { name: "years_experience", type: "integer" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: RFP
create_plugin "plugin-rfp" "RFP" '
    this.db.collection({
      name: "prestago_rfps",
      title: "RFPs",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "title", type: "string" },
        { name: "description", type: "text" },
        { name: "client_id", type: "uuid" },
        { name: "status", type: "string", defaultValue: "draft" },
        { name: "start_date", type: "date" },
        { name: "end_date", type: "date" },
        { name: "budget_min", type: "decimal" },
        { name: "budget_max", type: "decimal" },
        { name: "location", type: "string" },
        { name: "remote_policy", type: "string" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Applications
create_plugin "plugin-applications" "Applications" '
    this.db.collection({
      name: "prestago_applications",
      title: "Applications",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "rfp_id", type: "uuid" },
        { name: "consultant_id", type: "uuid" },
        { name: "status", type: "string", defaultValue: "pending" },
        { name: "cover_letter", type: "text" },
        { name: "proposed_rate", type: "decimal" },
        { name: "matching_score", type: "decimal" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Missions
create_plugin "plugin-missions" "Missions" '
    this.db.collection({
      name: "prestago_missions",
      title: "Missions",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "title", type: "string" },
        { name: "rfp_id", type: "uuid" },
        { name: "consultant_id", type: "uuid" },
        { name: "client_id", type: "uuid" },
        { name: "status", type: "string", defaultValue: "draft" },
        { name: "start_date", type: "date" },
        { name: "end_date", type: "date" },
        { name: "daily_rate", type: "decimal" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Timesheets
create_plugin "plugin-timesheets" "Timesheets" '
    this.db.collection({
      name: "prestago_timesheets",
      title: "Timesheets",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "mission_id", type: "uuid" },
        { name: "consultant_id", type: "uuid" },
        { name: "period_start", type: "date" },
        { name: "period_end", type: "date" },
        { name: "status", type: "string", defaultValue: "draft" },
        { name: "total_days", type: "decimal" },
        { name: "submitted_at", type: "date" },
        { name: "approved_at", type: "date" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Invoicing
create_plugin "plugin-invoicing" "Invoicing" '
    this.db.collection({
      name: "prestago_invoices",
      title: "Invoices",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "invoice_number", type: "string", unique: true },
        { name: "mission_id", type: "uuid" },
        { name: "timesheet_id", type: "uuid" },
        { name: "status", type: "string", defaultValue: "draft" },
        { name: "amount_ht", type: "decimal" },
        { name: "vat_rate", type: "decimal" },
        { name: "amount_ttc", type: "decimal" },
        { name: "due_date", type: "date" },
        { name: "paid_at", type: "date" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Contracts
create_plugin "plugin-contracts" "Contracts" '
    this.db.collection({
      name: "prestago_contracts",
      title: "Contracts",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "contract_number", type: "string", unique: true },
        { name: "mission_id", type: "uuid" },
        { name: "type", type: "string" },
        { name: "status", type: "string", defaultValue: "draft" },
        { name: "start_date", type: "date" },
        { name: "end_date", type: "date" },
        { name: "signed_at", type: "date" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Notifications
create_plugin "plugin-notifications" "Notifications" '
    this.db.collection({
      name: "prestago_notifications",
      title: "Notifications",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "user_id", type: "uuid" },
        { name: "type", type: "string" },
        { name: "title", type: "string" },
        { name: "content", type: "text" },
        { name: "status", type: "string", defaultValue: "pending" },
        { name: "read_at", type: "date" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

# Plugin: Reporting
create_plugin "plugin-reporting" "Reporting" '
    this.db.collection({
      name: "prestago_dashboards",
      title: "Dashboards",
      fields: [
        { name: "id", type: "uuid", primaryKey: true },
        { name: "name", type: "string" },
        { name: "type", type: "string" },
        { name: "owner_id", type: "uuid" },
        { name: "is_default", type: "boolean", defaultValue: false },
        { name: "layout", type: "json" },
        { name: "created_at", type: "date", interface: "createdAt" }
      ]
    });'

echo ""
echo "All plugins created successfully!"
echo ""
