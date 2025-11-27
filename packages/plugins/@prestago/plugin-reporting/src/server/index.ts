// =============================================================================
// PRESTAGO - Plugin Reporting - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { ReportingService } from './services/ReportingService';

// Collections
import { dashboardsCollection } from './collections/dashboards';
import { widgetsCollection } from './collections/widgets';
import { scheduledReportsCollection } from './collections/scheduled-reports';

export class PluginReportingServer extends Plugin {
  reportingService: ReportingService;

  async afterAdd() {}

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(dashboardsCollection);
    this.db.collection(widgetsCollection);
    this.db.collection(scheduledReportsCollection);
  }

  async load() {
    // Initialiser le service
    this.reportingService = new ReportingService(this.db);

    // Enregistrer les routes API
    this.registerRoutes();

    this.app.logger.info('Plugin Reporting chargé avec succès');
  }

  async install() {
    await this.db.sync();
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}

  private registerRoutes() {
    // KPIs
    this.app.resource({
      name: 'kpis',
      actions: {
        // Calculer un KPI
        calculate: async (ctx, next) => {
          const { category, period, start_date, end_date, organization_id, comparison } = ctx.action.params;

          if (!category) {
            ctx.throw(400, 'Catégorie KPI requise');
          }

          try {
            const result = await this.reportingService.calculateKPI(category, {
              period,
              start_date: start_date ? new Date(start_date) : undefined,
              end_date: end_date ? new Date(end_date) : undefined,
              organization_id,
              comparison
            });
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Données pour graphique
        chartData: async (ctx, next) => {
          const { category, period, start_date, end_date, organization_id, group_by } = ctx.action.params;

          if (!category) {
            ctx.throw(400, 'Catégorie KPI requise');
          }

          try {
            const result = await this.reportingService.getChartData(category, {
              period,
              start_date: start_date ? new Date(start_date) : undefined,
              end_date: end_date ? new Date(end_date) : undefined,
              organization_id,
              group_by
            });
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // Dashboards
    this.app.resource({
      name: 'dashboards',
      actions: {
        // Obtenir les stats d'un dashboard
        stats: async (ctx, next) => {
          const { type, organization_id, period } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const stats = await this.reportingService.getDashboardStats(type, {
              organization_id,
              user_id: userId,
              period
            });
            ctx.body = { success: true, data: stats };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Dashboard par défaut pour un utilisateur
        default: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;
          const collection = this.db.getCollection('prestago_dashboards');

          try {
            let dashboard = await collection.repository.findOne({
              filter: {
                $or: [
                  { owner_id: userId, is_default: true },
                  { is_public: true, is_default: true }
                ]
              },
              appends: ['widgets']
            });

            if (!dashboard) {
              // Créer un dashboard par défaut
              dashboard = await collection.repository.create({
                values: {
                  name: 'Mon Dashboard',
                  type: 'custom',
                  owner_id: userId,
                  is_default: true,
                  layout: []
                }
              });
            }

            ctx.body = { success: true, data: dashboard };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Dupliquer un dashboard
        duplicate: async (ctx, next) => {
          const { filterByTk: dashboardId, name } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;
          const collection = this.db.getCollection('prestago_dashboards');
          const widgetCollection = this.db.getCollection('prestago_dashboard_widgets');

          try {
            const original = await collection.repository.findOne({
              filter: { id: dashboardId },
              appends: ['widgets']
            });

            if (!original) {
              ctx.throw(404, 'Dashboard non trouvé');
            }

            // Créer la copie
            const copy = await collection.repository.create({
              values: {
                name: name || `${original.name} (copie)`,
                description: original.description,
                type: 'custom',
                owner_id: userId,
                layout: original.layout,
                default_period: original.default_period,
                filters: original.filters,
                theme: original.theme
              }
            });

            // Copier les widgets
            if (original.widgets) {
              for (const widget of original.widgets) {
                await widgetCollection.repository.create({
                  values: {
                    dashboard_id: copy.id,
                    name: widget.name,
                    type: widget.type,
                    config: widget.config,
                    display: widget.display,
                    thresholds: widget.thresholds,
                    position_x: widget.position_x,
                    position_y: widget.position_y,
                    width: widget.width,
                    height: widget.height
                  }
                });
              }
            }

            ctx.body = { success: true, data: copy };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // Rapports programmés
    this.app.resource({
      name: 'scheduled_reports',
      actions: {
        // Exécuter manuellement
        run: async (ctx, next) => {
          const { filterByTk: reportId } = ctx.action.params;

          try {
            // À implémenter: génération et envoi du rapport
            ctx.body = { success: true, message: 'Rapport en cours de génération' };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('kpis', 'calculate', 'loggedIn');
    this.app.acl.allow('kpis', 'chartData', 'loggedIn');

    this.app.acl.allow('dashboards', 'list', 'loggedIn');
    this.app.acl.allow('dashboards', 'get', 'loggedIn');
    this.app.acl.allow('dashboards', 'create', 'loggedIn');
    this.app.acl.allow('dashboards', 'update', 'loggedIn');
    this.app.acl.allow('dashboards', 'destroy', 'loggedIn');
    this.app.acl.allow('dashboards', 'stats', 'loggedIn');
    this.app.acl.allow('dashboards', 'default', 'loggedIn');
    this.app.acl.allow('dashboards', 'duplicate', 'loggedIn');

    this.app.acl.allow('dashboard_widgets', 'list', 'loggedIn');
    this.app.acl.allow('dashboard_widgets', 'get', 'loggedIn');
    this.app.acl.allow('dashboard_widgets', 'create', 'loggedIn');
    this.app.acl.allow('dashboard_widgets', 'update', 'loggedIn');
    this.app.acl.allow('dashboard_widgets', 'destroy', 'loggedIn');

    this.app.acl.allow('scheduled_reports', 'list', 'loggedIn');
    this.app.acl.allow('scheduled_reports', 'get', 'loggedIn');
    this.app.acl.allow('scheduled_reports', 'create', 'loggedIn');
    this.app.acl.allow('scheduled_reports', 'update', 'loggedIn');
    this.app.acl.allow('scheduled_reports', 'destroy', 'loggedIn');
    this.app.acl.allow('scheduled_reports', 'run', 'loggedIn');
  }
}

export default PluginReportingServer;
