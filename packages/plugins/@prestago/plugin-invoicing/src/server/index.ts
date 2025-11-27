// =============================================================================
// PRESTAGO - Plugin Invoicing - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { InvoiceService } from './services/InvoiceService';

// Collections
import { invoicesCollection } from './collections/invoices';
import { invoiceLinesCollection } from './collections/invoice-lines';
import { paymentsCollection } from './collections/payments';
import { billingSettingsCollection } from './collections/billing-settings';

export class PluginInvoicingServer extends Plugin {
  invoiceService: InvoiceService;

  async afterAdd() {}

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(invoicesCollection);
    this.db.collection(invoiceLinesCollection);
    this.db.collection(paymentsCollection);
    this.db.collection(billingSettingsCollection);
  }

  async load() {
    // Initialiser le service
    this.invoiceService = new InvoiceService(this.db, this.app);

    // Enregistrer les routes API
    this.registerRoutes();

    // Programmer la vérification des factures en retard
    this.scheduleOverdueCheck();

    this.app.logger.info('Plugin Invoicing chargé avec succès');
  }

  async install() {
    // Synchroniser les collections avec la base de données
    await this.db.sync();
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}

  private registerRoutes() {
    // Générer une facture depuis un CRA
    this.app.resource({
      name: 'invoices',
      actions: {
        generateFromTimesheet: async (ctx, next) => {
          const { timesheetId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!timesheetId) {
            ctx.throw(400, 'ID du CRA requis');
          }

          try {
            const invoice = await this.invoiceService.generateFromTimesheet(timesheetId, userId);
            ctx.body = { success: true, data: invoice };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Valider une facture
        validate: async (ctx, next) => {
          const { filterByTk: invoiceId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const invoice = await this.invoiceService.validateInvoice(invoiceId, userId);
            ctx.body = { success: true, data: invoice };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Envoyer une facture
        send: async (ctx, next) => {
          const { filterByTk: invoiceId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const invoice = await this.invoiceService.sendInvoice(invoiceId, userId);
            ctx.body = { success: true, data: invoice };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Annuler une facture
        cancel: async (ctx, next) => {
          const { filterByTk: invoiceId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const invoice = await this.invoiceService.cancelInvoice(invoiceId, userId, reason);
            ctx.body = { success: true, data: invoice };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Créer un avoir
        createCreditNote: async (ctx, next) => {
          const { filterByTk: invoiceId, reason } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!reason) {
            ctx.throw(400, 'Motif de l\'avoir requis');
          }

          try {
            const creditNote = await this.invoiceService.createCreditNote(invoiceId, userId, reason);
            ctx.body = { success: true, data: creditNote };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Obtenir les factures en retard
        overdue: async (ctx, next) => {
          try {
            const invoices = await this.invoiceService.getOverdueInvoices();
            ctx.body = { success: true, data: invoices };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Obtenir les statistiques
        stats: async (ctx, next) => {
          const { organizationId, year } = ctx.action.params;

          try {
            const stats = await this.invoiceService.getBillingStats(
              organizationId,
              year ? parseInt(year) : undefined
            );
            ctx.body = { success: true, data: stats };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    // Enregistrer un paiement
    this.app.resource({
      name: 'payments',
      actions: {
        record: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          if (!values?.invoice_id || !values?.amount || !values?.method) {
            ctx.throw(400, 'Données de paiement incomplètes');
          }

          try {
            const payment = await this.invoiceService.recordPayment(values, userId);
            ctx.body = { success: true, data: payment };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // Configurer les ACL
    this.app.acl.allow('invoices', 'list', 'loggedIn');
    this.app.acl.allow('invoices', 'get', 'loggedIn');
    this.app.acl.allow('invoices', 'create', 'loggedIn');
    this.app.acl.allow('invoices', 'update', 'loggedIn');
    this.app.acl.allow('invoices', 'generateFromTimesheet', 'loggedIn');
    this.app.acl.allow('invoices', 'validate', 'loggedIn');
    this.app.acl.allow('invoices', 'send', 'loggedIn');
    this.app.acl.allow('invoices', 'cancel', 'loggedIn');
    this.app.acl.allow('invoices', 'createCreditNote', 'loggedIn');
    this.app.acl.allow('invoices', 'overdue', 'loggedIn');
    this.app.acl.allow('invoices', 'stats', 'loggedIn');

    this.app.acl.allow('payments', 'list', 'loggedIn');
    this.app.acl.allow('payments', 'get', 'loggedIn');
    this.app.acl.allow('payments', 'record', 'loggedIn');

    this.app.acl.allow('billing_settings', 'list', 'loggedIn');
    this.app.acl.allow('billing_settings', 'get', 'loggedIn');
    this.app.acl.allow('billing_settings', 'update', 'loggedIn');
  }

  private scheduleOverdueCheck() {
    // Vérifier les factures en retard toutes les heures
    const checkInterval = 60 * 60 * 1000; // 1 heure

    setInterval(async () => {
      try {
        const count = await this.invoiceService.markOverdueInvoices();
        if (count > 0) {
          this.app.logger.info(`${count} facture(s) marquée(s) comme en retard`);
        }
      } catch (error) {
        this.app.logger.error('Erreur lors de la vérification des factures en retard:', error);
      }
    }, checkInterval);

    // Exécuter une première vérification au démarrage
    setTimeout(async () => {
      try {
        await this.invoiceService.markOverdueInvoices();
      } catch (error) {
        this.app.logger.error('Erreur lors de la vérification initiale des factures en retard:', error);
      }
    }, 5000);
  }
}

export default PluginInvoicingServer;
