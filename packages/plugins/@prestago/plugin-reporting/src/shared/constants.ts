// =============================================================================
// PRESTAGO - Plugin Reporting - Constantes
// =============================================================================

import {
  DashboardType,
  WidgetType,
  KPICategory,
  ReportPeriod,
  ComparisonType
} from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  DASHBOARDS: 'prestago_dashboards',
  WIDGETS: 'prestago_dashboard_widgets',
  SCHEDULED_REPORTS: 'prestago_scheduled_reports',
  REPORT_HISTORY: 'prestago_report_history',
  KPI_CACHE: 'prestago_kpi_cache'
};

/**
 * Configuration des KPIs disponibles
 */
export const KPI_DEFINITIONS: Record<KPICategory, {
  name: string;
  description: string;
  unit: 'number' | 'currency' | 'percent' | 'days';
  data_sources: string[];
  default_period: ReportPeriod;
}> = {
  // Business
  [KPICategory.REVENUE]: {
    name: 'Chiffre d\'affaires',
    description: 'Total des factures émises',
    unit: 'currency',
    data_sources: ['prestago_invoices'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.MARGIN]: {
    name: 'Marge',
    description: 'Marge brute sur les missions',
    unit: 'percent',
    data_sources: ['prestago_invoices', 'prestago_missions'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.GROWTH]: {
    name: 'Croissance',
    description: 'Taux de croissance du CA',
    unit: 'percent',
    data_sources: ['prestago_invoices'],
    default_period: ReportPeriod.THIS_YEAR
  },

  // Missions
  [KPICategory.MISSIONS_COUNT]: {
    name: 'Nombre de missions',
    description: 'Nombre total de missions',
    unit: 'number',
    data_sources: ['prestago_missions'],
    default_period: ReportPeriod.THIS_YEAR
  },
  [KPICategory.MISSIONS_VALUE]: {
    name: 'Valeur des missions',
    description: 'Valeur totale des missions actives',
    unit: 'currency',
    data_sources: ['prestago_missions'],
    default_period: ReportPeriod.THIS_YEAR
  },
  [KPICategory.FILL_RATE]: {
    name: 'Taux de remplissage',
    description: 'Ratio RFP répondus / total RFP',
    unit: 'percent',
    data_sources: ['prestago_rfps', 'prestago_applications'],
    default_period: ReportPeriod.THIS_QUARTER
  },
  [KPICategory.UTILIZATION]: {
    name: 'Taux d\'utilisation',
    description: 'Jours travaillés / jours disponibles',
    unit: 'percent',
    data_sources: ['prestago_timesheets'],
    default_period: ReportPeriod.THIS_MONTH
  },

  // RFP et Applications
  [KPICategory.RFP_COUNT]: {
    name: 'Nombre de RFP',
    description: 'Nombre d\'appels d\'offres',
    unit: 'number',
    data_sources: ['prestago_rfps'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.APPLICATIONS_COUNT]: {
    name: 'Nombre de candidatures',
    description: 'Nombre de candidatures reçues',
    unit: 'number',
    data_sources: ['prestago_applications'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.CONVERSION_RATE]: {
    name: 'Taux de conversion',
    description: 'Candidatures acceptées / total',
    unit: 'percent',
    data_sources: ['prestago_applications'],
    default_period: ReportPeriod.THIS_QUARTER
  },
  [KPICategory.MATCHING_SCORE]: {
    name: 'Score de matching moyen',
    description: 'Score moyen des correspondances',
    unit: 'percent',
    data_sources: ['prestago_applications'],
    default_period: ReportPeriod.THIS_MONTH
  },

  // CRA et Facturation
  [KPICategory.BILLABLE_DAYS]: {
    name: 'Jours facturables',
    description: 'Total des jours facturables',
    unit: 'number',
    data_sources: ['prestago_timesheets'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.BILLING_RATE]: {
    name: 'Taux de facturation',
    description: 'Jours facturés / jours travaillés',
    unit: 'percent',
    data_sources: ['prestago_timesheets', 'prestago_invoices'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.INVOICE_AMOUNT]: {
    name: 'Montant facturé',
    description: 'Total des factures',
    unit: 'currency',
    data_sources: ['prestago_invoices'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.PAYMENT_RATE]: {
    name: 'Taux de recouvrement',
    description: 'Montant encaissé / montant facturé',
    unit: 'percent',
    data_sources: ['prestago_invoices', 'prestago_payments'],
    default_period: ReportPeriod.THIS_QUARTER
  },
  [KPICategory.DSO]: {
    name: 'Délai de paiement (DSO)',
    description: 'Délai moyen de paiement en jours',
    unit: 'days',
    data_sources: ['prestago_invoices', 'prestago_payments'],
    default_period: ReportPeriod.THIS_QUARTER
  },

  // Ressources
  [KPICategory.CONSULTANT_COUNT]: {
    name: 'Nombre de consultants',
    description: 'Consultants actifs',
    unit: 'number',
    data_sources: ['users', 'prestago_consultant_profiles'],
    default_period: ReportPeriod.THIS_MONTH
  },
  [KPICategory.CLIENT_COUNT]: {
    name: 'Nombre de clients',
    description: 'Clients actifs',
    unit: 'number',
    data_sources: ['prestago_organizations'],
    default_period: ReportPeriod.THIS_YEAR
  },
  [KPICategory.ACTIVE_MISSIONS]: {
    name: 'Missions actives',
    description: 'Nombre de missions en cours',
    unit: 'number',
    data_sources: ['prestago_missions'],
    default_period: ReportPeriod.TODAY
  },

  // Performance
  [KPICategory.NPS]: {
    name: 'NPS',
    description: 'Net Promoter Score',
    unit: 'number',
    data_sources: ['prestago_mission_evaluations'],
    default_period: ReportPeriod.THIS_YEAR
  },
  [KPICategory.SATISFACTION]: {
    name: 'Satisfaction client',
    description: 'Score de satisfaction moyen',
    unit: 'percent',
    data_sources: ['prestago_mission_evaluations'],
    default_period: ReportPeriod.THIS_YEAR
  },
  [KPICategory.QUALITY_SCORE]: {
    name: 'Score qualité',
    description: 'Score qualité moyen des consultants',
    unit: 'percent',
    data_sources: ['prestago_mission_evaluations'],
    default_period: ReportPeriod.THIS_YEAR
  }
};

/**
 * Widgets par défaut pour chaque type de dashboard
 */
export const DEFAULT_WIDGETS: Record<DashboardType, Array<{
  type: WidgetType;
  kpi?: KPICategory;
  name: string;
}>> = {
  [DashboardType.ADMIN]: [
    { type: WidgetType.KPI, kpi: KPICategory.REVENUE, name: 'Chiffre d\'affaires' },
    { type: WidgetType.KPI, kpi: KPICategory.ACTIVE_MISSIONS, name: 'Missions actives' },
    { type: WidgetType.KPI, kpi: KPICategory.CONSULTANT_COUNT, name: 'Consultants' },
    { type: WidgetType.KPI, kpi: KPICategory.DSO, name: 'DSO' },
    { type: WidgetType.LINE_CHART, name: 'Évolution CA' },
    { type: WidgetType.PIE_CHART, name: 'Répartition par client' },
    { type: WidgetType.BAR_CHART, name: 'Top consultants' },
    { type: WidgetType.TABLE, name: 'Factures en retard' }
  ],
  [DashboardType.CLIENT]: [
    { type: WidgetType.KPI, kpi: KPICategory.ACTIVE_MISSIONS, name: 'Missions en cours' },
    { type: WidgetType.KPI, kpi: KPICategory.INVOICE_AMOUNT, name: 'Factures du mois' },
    { type: WidgetType.TABLE, name: 'Mes consultants' },
    { type: WidgetType.CALENDAR, name: 'Planning' }
  ],
  [DashboardType.CONSULTANT]: [
    { type: WidgetType.KPI, kpi: KPICategory.BILLABLE_DAYS, name: 'Jours travaillés' },
    { type: WidgetType.PROGRESS, name: 'CRA du mois' },
    { type: WidgetType.TABLE, name: 'Mes missions' },
    { type: WidgetType.CALENDAR, name: 'Mon planning' }
  ],
  [DashboardType.MANAGER]: [
    { type: WidgetType.KPI, kpi: KPICategory.UTILIZATION, name: 'Taux d\'utilisation' },
    { type: WidgetType.KPI, kpi: KPICategory.FILL_RATE, name: 'Taux de staffing' },
    { type: WidgetType.TABLE, name: 'CRA à valider' },
    { type: WidgetType.TABLE, name: 'Fins de mission' }
  ],
  [DashboardType.COMMERCIAL]: [
    { type: WidgetType.KPI, kpi: KPICategory.RFP_COUNT, name: 'RFP en cours' },
    { type: WidgetType.KPI, kpi: KPICategory.CONVERSION_RATE, name: 'Taux de conversion' },
    { type: WidgetType.RANKING, name: 'Top opportunités' },
    { type: WidgetType.TIMELINE, name: 'Pipeline commercial' }
  ],
  [DashboardType.CUSTOM]: []
};

/**
 * Couleurs par défaut
 */
export const DEFAULT_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  chart: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
};

/**
 * Configuration du cache
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,     // 5 minutes
  SHORT_TTL: 60 * 1000,           // 1 minute
  LONG_TTL: 30 * 60 * 1000        // 30 minutes
};

/**
 * Calculer les dates pour une période
 */
export function getPeriodDates(period: ReportPeriod, customStart?: Date, customEnd?: Date): {
  start: Date;
  end: Date;
  previousStart?: Date;
  previousEnd?: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date;
  let end: Date;
  let previousStart: Date | undefined;
  let previousEnd: Date | undefined;

  switch (period) {
    case ReportPeriod.TODAY:
      start = today;
      end = now;
      previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(today);
      break;

    case ReportPeriod.YESTERDAY:
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      end = new Date(today);
      break;

    case ReportPeriod.THIS_WEEK:
      start = new Date(today);
      start.setDate(start.getDate() - start.getDay() + 1); // Lundi
      end = now;
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(start);
      break;

    case ReportPeriod.LAST_WEEK:
      end = new Date(today);
      end.setDate(end.getDate() - end.getDay()); // Dimanche dernier
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      break;

    case ReportPeriod.THIS_MONTH:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    case ReportPeriod.LAST_MONTH:
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    case ReportPeriod.THIS_QUARTER:
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      end = now;
      previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
      previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
      break;

    case ReportPeriod.LAST_QUARTER:
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const q = lastQuarter < 0 ? 3 : lastQuarter;
      start = new Date(year, q * 3, 1);
      end = new Date(year, (q + 1) * 3, 0);
      break;

    case ReportPeriod.THIS_YEAR:
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      break;

    case ReportPeriod.LAST_YEAR:
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;

    case ReportPeriod.CUSTOM:
      start = customStart || today;
      end = customEnd || now;
      break;

    default:
      start = today;
      end = now;
  }

  return { start, end, previousStart, previousEnd };
}

/**
 * Formater une valeur selon son unité
 */
export function formatValue(
  value: number,
  unit: 'number' | 'currency' | 'percent' | 'days',
  options: {
    currency?: string;
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const locale = options.locale || 'fr-FR';
  const decimals = options.decimals ?? 2;

  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: options.currency || 'EUR'
      }).format(value);

    case 'percent':
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);

    case 'days':
      return `${value.toFixed(decimals)} j`;

    default:
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
      }).format(value);
  }
}

/**
 * Calculer le pourcentage de changement
 */
export function calculateChange(current: number, previous: number): {
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (previous === 0) {
    return {
      change: current,
      changePercent: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'stable'
    };
  }

  const change = current - previous;
  const changePercent = (change / Math.abs(previous)) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 1) trend = 'up';
  else if (changePercent < -1) trend = 'down';

  return { change, changePercent, trend };
}
