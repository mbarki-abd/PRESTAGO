// =============================================================================
// PRESTAGO - Plugin Timesheets - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { EventEmitter } from 'events';

// Collections
import { timesheetsCollection } from './collections/timesheets';
import { timesheetEntriesCollection } from './collections/timesheet-entries';
import { timesheetApprovalsCollection } from './collections/timesheet-approvals';
import { absencesCollection } from './collections/absences';
import { holidaysCollection } from './collections/holidays';

// Services
import { TimesheetService } from './services/TimesheetService';
import { AbsenceService } from './services/AbsenceService';

export class PluginTimesheetsServer extends Plugin {
  private eventEmitter: EventEmitter;
  private timesheetService: TimesheetService;
  private absenceService: AbsenceService;

  async afterAdd() {
    this.eventEmitter = new EventEmitter();
  }

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(timesheetsCollection);
    this.db.collection(timesheetEntriesCollection);
    this.db.collection(timesheetApprovalsCollection);
    this.db.collection(absencesCollection);
    this.db.collection(holidaysCollection);
  }

  async load() {
    // Initialiser les services
    this.timesheetService = new TimesheetService(this.db, this.eventEmitter);
    this.absenceService = new AbsenceService(this.db, this.eventEmitter);

    // Exposer les services
    this.app.context.timesheetService = this.timesheetService;
    this.app.context.absenceService = this.absenceService;

    // Enregistrer les routes
    this.registerRoutes();
  }

  private registerRoutes() {
    const router = this.app.resourcer;

    // =====================================================
    // Routes CRA (Timesheets)
    // =====================================================

    // Créer un CRA
    router.registerAction('timesheets:create', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.createTimesheet(values, userId);
      await next();
    });

    // Mettre à jour une entrée
    router.registerAction('timesheetEntries:update', async (ctx, next) => {
      const { filterByTk, values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.updateEntry(filterByTk, values, userId);
      await next();
    });

    // Soumettre un CRA
    router.registerAction('timesheets:submit', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { comments } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.submitTimesheet(filterByTk, userId, comments);
      await next();
    });

    // Approuver un CRA
    router.registerAction('timesheets:approve', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { comments } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.approveTimesheet(filterByTk, userId, comments);
      await next();
    });

    // Rejeter un CRA
    router.registerAction('timesheets:reject', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.rejectTimesheet(filterByTk, userId, reason);
      await next();
    });

    // Demander une révision
    router.registerAction('timesheets:requestRevision', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { notes } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.requestRevision(filterByTk, userId, notes);
      await next();
    });

    // Remettre en brouillon
    router.registerAction('timesheets:resetToDraft', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.timesheetService.resetToDraft(filterByTk, userId);
      await next();
    });

    // CRA par consultant
    router.registerAction('timesheets:byConsultant', async (ctx, next) => {
      const { consultantId, year } = ctx.action.params;

      ctx.body = await this.timesheetService.getTimesheetsByConsultant(consultantId, year);
      await next();
    });

    // CRA en attente d'approbation
    router.registerAction('timesheets:pendingApprovals', async (ctx, next) => {
      const userId = ctx.state.currentUser?.id;
      const { level } = ctx.action.params;

      ctx.body = await this.timesheetService.getPendingApprovals(userId, level);
      await next();
    });

    // Recalculer les totaux
    router.registerAction('timesheets:recalculate', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;

      ctx.body = await this.timesheetService.recalculateTotals(filterByTk);
      await next();
    });

    // =====================================================
    // Routes Absences
    // =====================================================

    // Créer une demande d'absence
    router.registerAction('absences:create', async (ctx, next) => {
      const { values } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.createAbsenceRequest(values, userId);
      await next();
    });

    // Soumettre une demande
    router.registerAction('absences:submit', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.submitAbsenceRequest(filterByTk, userId);
      await next();
    });

    // Approuver une absence
    router.registerAction('absences:approve', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.approveAbsence(filterByTk, userId);
      await next();
    });

    // Rejeter une absence
    router.registerAction('absences:reject', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const { reason } = ctx.action.params.values || {};
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.rejectAbsence(filterByTk, userId, reason);
      await next();
    });

    // Annuler une absence
    router.registerAction('absences:cancel', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.cancelAbsence(filterByTk, userId);
      await next();
    });

    // Absences par consultant
    router.registerAction('absences:byConsultant', async (ctx, next) => {
      const { consultantId, year, status } = ctx.action.params;

      ctx.body = await this.absenceService.getAbsencesByConsultant(consultantId, year, status);
      await next();
    });

    // Absences en attente
    router.registerAction('absences:pending', async (ctx, next) => {
      const userId = ctx.state.currentUser?.id;

      ctx.body = await this.absenceService.getPendingAbsences(userId);
      await next();
    });

    // Solde de congés
    router.registerAction('absences:balance', async (ctx, next) => {
      const { consultantId, year } = ctx.action.params;

      ctx.body = await this.absenceService.getLeaveBalance(consultantId, year);
      await next();
    });

    // Synchroniser avec CRA
    router.registerAction('absences:syncWithTimesheet', async (ctx, next) => {
      const { filterByTk } = ctx.action.params;

      await this.absenceService.syncWithTimesheet(filterByTk);
      ctx.body = { success: true };
      await next();
    });
  }

  async install() {
    // Installer les jours fériés par défaut
    await this.installDefaultHolidays();
    this.log.info('Plugin Timesheets installed');
  }

  private async installDefaultHolidays() {
    const collection = this.db.getCollection('prestago_holidays');
    const currentYear = new Date().getFullYear();

    // Jours fériés français pour l'année en cours
    const holidays = [
      { name: 'Jour de l\'An', date: new Date(currentYear, 0, 1) },
      { name: 'Fête du Travail', date: new Date(currentYear, 4, 1) },
      { name: 'Victoire 1945', date: new Date(currentYear, 4, 8) },
      { name: 'Fête Nationale', date: new Date(currentYear, 6, 14) },
      { name: 'Assomption', date: new Date(currentYear, 7, 15) },
      { name: 'Toussaint', date: new Date(currentYear, 10, 1) },
      { name: 'Armistice', date: new Date(currentYear, 10, 11) },
      { name: 'Noël', date: new Date(currentYear, 11, 25) }
    ];

    for (const holiday of holidays) {
      const existing = await collection.repository.findOne({
        filter: { date: holiday.date, country: 'FR' }
      });

      if (!existing) {
        await collection.repository.create({
          values: {
            name: holiday.name,
            date: holiday.date,
            country: 'FR',
            year: currentYear,
            is_regional: false
          }
        });
      }
    }
  }

  async afterEnable() {
    // Configurer les tâches planifiées
    this.setupScheduledTasks();
  }

  private setupScheduledTasks() {
    // Rappel de soumission (fin de mois)
    this.app.on('timesheet:submissionReminder', async () => {
      // Logique de rappel
      this.log.info('Timesheet submission reminder sent');
    });

    // Rappel d'approbation
    this.app.on('timesheet:approvalReminder', async () => {
      // Logique de rappel
      this.log.info('Timesheet approval reminder sent');
    });
  }

  async afterDisable() {
    // Nettoyage
  }

  async remove() {
    // Suppression du plugin
  }
}

export default PluginTimesheetsServer;
