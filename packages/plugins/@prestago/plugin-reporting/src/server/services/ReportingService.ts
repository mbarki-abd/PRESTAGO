// =============================================================================
// PRESTAGO - Plugin Reporting - Service: Reporting et KPIs
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  KPI_DEFINITIONS,
  getPeriodDates,
  calculateChange,
  formatValue,
  CACHE_CONFIG
} from '../../shared/constants';
import {
  KPICategory,
  ReportPeriod,
  ComparisonType,
  DashboardType,
  IKPIData
} from '../../shared/types';

export class ReportingService {
  private db: Database;
  private cache: Map<string, { data: any; expires: number }> = new Map();

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Calculer un KPI
   */
  async calculateKPI(
    category: KPICategory,
    options: {
      period?: ReportPeriod;
      start_date?: Date;
      end_date?: Date;
      organization_id?: string;
      comparison?: ComparisonType;
    } = {}
  ): Promise<IKPIData> {
    const period = options.period || KPI_DEFINITIONS[category].default_period;
    const dates = getPeriodDates(period, options.start_date, options.end_date);

    // Vérifier le cache
    const cacheKey = `kpi_${category}_${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let result: IKPIData;

    switch (category) {
      case KPICategory.REVENUE:
        result = await this.calculateRevenue(dates, options.organization_id);
        break;

      case KPICategory.ACTIVE_MISSIONS:
        result = await this.calculateActiveMissions(dates, options.organization_id);
        break;

      case KPICategory.BILLABLE_DAYS:
        result = await this.calculateBillableDays(dates, options.organization_id);
        break;

      case KPICategory.UTILIZATION:
        result = await this.calculateUtilization(dates, options.organization_id);
        break;

      case KPICategory.DSO:
        result = await this.calculateDSO(dates, options.organization_id);
        break;

      case KPICategory.CONVERSION_RATE:
        result = await this.calculateConversionRate(dates, options.organization_id);
        break;

      case KPICategory.CONSULTANT_COUNT:
        result = await this.calculateConsultantCount(dates, options.organization_id);
        break;

      case KPICategory.RFP_COUNT:
        result = await this.calculateRFPCount(dates, options.organization_id);
        break;

      case KPICategory.INVOICE_AMOUNT:
        result = await this.calculateInvoiceAmount(dates, options.organization_id);
        break;

      default:
        result = await this.calculateGenericKPI(category, dates, options.organization_id);
    }

    // Ajouter la comparaison si demandée
    if (options.comparison && dates.previousStart && dates.previousEnd) {
      const previousDates = {
        start: dates.previousStart,
        end: dates.previousEnd
      };
      const previousResult = await this.calculateKPIForPeriod(category, previousDates, options.organization_id);
      const change = calculateChange(result.value, previousResult.value);
      result.previous_value = previousResult.value;
      result.change = change.change;
      result.change_percent = change.changePercent;
      result.trend = change.trend;
    }

    this.setToCache(cacheKey, result);
    return result;
  }

  /**
   * Obtenir les données pour un graphique
   */
  async getChartData(
    category: KPICategory,
    options: {
      period?: ReportPeriod;
      start_date?: Date;
      end_date?: Date;
      organization_id?: string;
      group_by?: 'day' | 'week' | 'month' | 'quarter';
    } = {}
  ): Promise<Array<{ label: string; value: number }>> {
    const period = options.period || ReportPeriod.THIS_MONTH;
    const dates = getPeriodDates(period, options.start_date, options.end_date);
    const groupBy = options.group_by || this.getDefaultGrouping(period);

    const cacheKey = `chart_${category}_${groupBy}_${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let data: Array<{ label: string; value: number }>;

    switch (category) {
      case KPICategory.REVENUE:
        data = await this.getRevenueTimeSeries(dates, groupBy, options.organization_id);
        break;

      case KPICategory.BILLABLE_DAYS:
        data = await this.getBillableDaysTimeSeries(dates, groupBy, options.organization_id);
        break;

      default:
        data = [];
    }

    this.setToCache(cacheKey, data);
    return data;
  }

  /**
   * Obtenir les statistiques d'un dashboard
   */
  async getDashboardStats(
    dashboardType: DashboardType,
    options: {
      organization_id?: string;
      user_id?: string;
      period?: ReportPeriod;
    } = {}
  ): Promise<Record<string, any>> {
    const period = options.period || ReportPeriod.THIS_MONTH;
    const dates = getPeriodDates(period);

    const stats: Record<string, any> = {};

    switch (dashboardType) {
      case DashboardType.ADMIN:
        stats.revenue = await this.calculateKPI(KPICategory.REVENUE, { period, comparison: ComparisonType.PREVIOUS_PERIOD });
        stats.activeMissions = await this.calculateKPI(KPICategory.ACTIVE_MISSIONS, { period });
        stats.consultants = await this.calculateKPI(KPICategory.CONSULTANT_COUNT, { period });
        stats.dso = await this.calculateKPI(KPICategory.DSO, { period });
        stats.invoiceOverdue = await this.getOverdueInvoices(options.organization_id);
        stats.revenueChart = await this.getChartData(KPICategory.REVENUE, { period, group_by: 'month' });
        break;

      case DashboardType.CLIENT:
        stats.activeMissions = await this.calculateKPI(KPICategory.ACTIVE_MISSIONS, { period, organization_id: options.organization_id });
        stats.invoiceAmount = await this.calculateKPI(KPICategory.INVOICE_AMOUNT, { period, organization_id: options.organization_id });
        stats.consultants = await this.getOrganizationConsultants(options.organization_id);
        break;

      case DashboardType.CONSULTANT:
        stats.billableDays = await this.calculateKPI(KPICategory.BILLABLE_DAYS, { period });
        stats.missions = await this.getUserMissions(options.user_id);
        stats.pendingTimesheets = await this.getPendingTimesheets(options.user_id);
        break;

      case DashboardType.MANAGER:
        stats.utilization = await this.calculateKPI(KPICategory.UTILIZATION, { period });
        stats.pendingApprovals = await this.getPendingApprovals(options.user_id);
        stats.endingMissions = await this.getEndingMissions(options.organization_id);
        break;

      case DashboardType.COMMERCIAL:
        stats.rfpCount = await this.calculateKPI(KPICategory.RFP_COUNT, { period });
        stats.conversionRate = await this.calculateKPI(KPICategory.CONVERSION_RATE, { period, comparison: ComparisonType.PREVIOUS_PERIOD });
        stats.pipeline = await this.getCommercialPipeline(options.organization_id);
        break;
    }

    return stats;
  }

  // ===================== Méthodes de calcul spécifiques =====================

  private async calculateRevenue(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_invoices');

    const filter: any = {
      status: { $in: ['sent', 'paid', 'partially_paid'] },
      issue_date: { $gte: dates.start, $lte: dates.end }
    };

    if (organizationId) {
      filter.consultant_organization_id = organizationId;
    }

    const invoices = await collection.repository.find({ filter });
    const value = invoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

    return {
      value,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateActiveMissions(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_missions');

    const filter: any = {
      status: 'active'
    };

    if (organizationId) {
      filter.$or = [
        { client_organization_id: organizationId },
        { consultant_organization_id: organizationId }
      ];
    }

    const count = await collection.repository.count({ filter });

    return {
      value: count,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateBillableDays(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_timesheets');

    const filter: any = {
      status: 'approved',
      period_start: { $gte: dates.start },
      period_end: { $lte: dates.end }
    };

    const timesheets = await collection.repository.find({ filter });
    const value = timesheets.reduce((sum: number, ts: any) => sum + (ts.total_billable_days || 0), 0);

    return {
      value,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateUtilization(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    // Calculer le nombre de jours ouvrés dans la période
    const workDays = this.countWorkDays(dates.start, dates.end);

    // Obtenir les jours travaillés
    const billable = await this.calculateBillableDays(dates, organizationId);

    // Nombre de consultants actifs
    const consultantCount = await this.calculateConsultantCount(dates, organizationId);

    const totalAvailable = workDays * (consultantCount.value || 1);
    const value = totalAvailable > 0 ? (billable.value / totalAvailable) * 100 : 0;

    return {
      value: Math.round(value * 100) / 100,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateDSO(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const invoiceCollection = this.db.getCollection('prestago_invoices');
    const paymentCollection = this.db.getCollection('prestago_payments');

    const filter: any = {
      status: 'paid',
      paid_date: { $gte: dates.start, $lte: dates.end }
    };

    if (organizationId) {
      filter.consultant_organization_id = organizationId;
    }

    const invoices = await invoiceCollection.repository.find({ filter });

    let totalDays = 0;
    let count = 0;

    for (const invoice of invoices) {
      if (invoice.issue_date && invoice.paid_date) {
        const issuedDate = new Date(invoice.issue_date);
        const paidDate = new Date(invoice.paid_date);
        const days = Math.ceil((paidDate.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += days;
        count++;
      }
    }

    const value = count > 0 ? Math.round(totalDays / count) : 0;

    return {
      value,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateConversionRate(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_applications');

    const filter: any = {
      created_at: { $gte: dates.start, $lte: dates.end }
    };

    const [total, accepted] = await Promise.all([
      collection.repository.count({ filter }),
      collection.repository.count({ filter: { ...filter, status: 'accepted' } })
    ]);

    const value = total > 0 ? (accepted / total) * 100 : 0;

    return {
      value: Math.round(value * 100) / 100,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateConsultantCount(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_consultant_profiles');

    const filter: any = {
      is_available: true
    };

    if (organizationId) {
      filter.organization_id = organizationId;
    }

    const count = await collection.repository.count({ filter });

    return {
      value: count,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateRFPCount(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    const collection = this.db.getCollection('prestago_rfps');

    const filter: any = {
      created_at: { $gte: dates.start, $lte: dates.end }
    };

    if (organizationId) {
      filter.organization_id = organizationId;
    }

    const count = await collection.repository.count({ filter });

    return {
      value: count,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateInvoiceAmount(dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    return this.calculateRevenue(dates, organizationId);
  }

  private async calculateGenericKPI(category: KPICategory, dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    return {
      value: 0,
      period_start: dates.start,
      period_end: dates.end
    };
  }

  private async calculateKPIForPeriod(category: KPICategory, dates: { start: Date; end: Date }, organizationId?: string): Promise<IKPIData> {
    switch (category) {
      case KPICategory.REVENUE:
        return this.calculateRevenue(dates, organizationId);
      case KPICategory.ACTIVE_MISSIONS:
        return this.calculateActiveMissions(dates, organizationId);
      default:
        return { value: 0, period_start: dates.start, period_end: dates.end };
    }
  }

  // ===================== Données pour graphiques =====================

  private async getRevenueTimeSeries(dates: { start: Date; end: Date }, groupBy: string, organizationId?: string): Promise<Array<{ label: string; value: number }>> {
    const collection = this.db.getCollection('prestago_invoices');

    const filter: any = {
      status: { $in: ['sent', 'paid', 'partially_paid'] },
      issue_date: { $gte: dates.start, $lte: dates.end }
    };

    if (organizationId) {
      filter.consultant_organization_id = organizationId;
    }

    const invoices = await collection.repository.find({ filter });

    // Grouper par période
    const grouped = new Map<string, number>();
    for (const invoice of invoices) {
      const date = new Date(invoice.issue_date);
      const key = this.getGroupKey(date, groupBy);
      grouped.set(key, (grouped.get(key) || 0) + (invoice.total_amount || 0));
    }

    return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }));
  }

  private async getBillableDaysTimeSeries(dates: { start: Date; end: Date }, groupBy: string, organizationId?: string): Promise<Array<{ label: string; value: number }>> {
    // Similar implementation
    return [];
  }

  // ===================== Données auxiliaires =====================

  private async getOverdueInvoices(organizationId?: string): Promise<any[]> {
    const collection = this.db.getCollection('prestago_invoices');

    const filter: any = {
      status: 'overdue'
    };

    if (organizationId) {
      filter.consultant_organization_id = organizationId;
    }

    return collection.repository.find({
      filter,
      limit: 10,
      sort: ['due_date']
    });
  }

  private async getOrganizationConsultants(organizationId?: string): Promise<any[]> {
    if (!organizationId) return [];

    const collection = this.db.getCollection('prestago_missions');

    return collection.repository.find({
      filter: {
        client_organization_id: organizationId,
        status: 'active'
      },
      appends: ['consultant']
    });
  }

  private async getUserMissions(userId?: string): Promise<any[]> {
    if (!userId) return [];

    const collection = this.db.getCollection('prestago_missions');

    return collection.repository.find({
      filter: { consultant_id: userId },
      sort: ['-start_date']
    });
  }

  private async getPendingTimesheets(userId?: string): Promise<any[]> {
    const collection = this.db.getCollection('prestago_timesheets');

    const filter: any = { status: 'draft' };
    if (userId) {
      filter.consultant_id = userId;
    }

    return collection.repository.find({ filter });
  }

  private async getPendingApprovals(userId?: string): Promise<any[]> {
    const collection = this.db.getCollection('prestago_timesheets');

    return collection.repository.find({
      filter: {
        status: { $in: ['submitted', 'pending_level_1', 'pending_level_2'] }
      },
      limit: 20
    });
  }

  private async getEndingMissions(organizationId?: string): Promise<any[]> {
    const collection = this.db.getCollection('prestago_missions');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const filter: any = {
      status: 'active',
      end_date: { $lte: thirtyDaysFromNow }
    };

    if (organizationId) {
      filter.$or = [
        { client_organization_id: organizationId },
        { consultant_organization_id: organizationId }
      ];
    }

    return collection.repository.find({ filter, sort: ['end_date'] });
  }

  private async getCommercialPipeline(organizationId?: string): Promise<any[]> {
    const collection = this.db.getCollection('prestago_rfps');

    return collection.repository.find({
      filter: {
        status: { $in: ['draft', 'published', 'in_selection'] }
      },
      sort: ['-created_at'],
      limit: 20
    });
  }

  // ===================== Utilitaires =====================

  private countWorkDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private getDefaultGrouping(period: ReportPeriod): 'day' | 'week' | 'month' | 'quarter' {
    switch (period) {
      case ReportPeriod.TODAY:
      case ReportPeriod.YESTERDAY:
      case ReportPeriod.THIS_WEEK:
      case ReportPeriod.LAST_WEEK:
        return 'day';
      case ReportPeriod.THIS_MONTH:
      case ReportPeriod.LAST_MONTH:
        return 'week';
      case ReportPeriod.THIS_QUARTER:
      case ReportPeriod.LAST_QUARTER:
        return 'month';
      default:
        return 'month';
    }
  }

  private getGroupKey(date: Date, groupBy: string): string {
    const d = new Date(date);
    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const week = this.getWeekNumber(d);
        return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`;
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarter':
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `${d.getFullYear()}-Q${quarter}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // ===================== Cache =====================

  private getFromCache(key: string): any {
    const entry = this.cache.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setToCache(key: string, data: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}
