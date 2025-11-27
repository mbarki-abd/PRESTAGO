// =============================================================================
// PRESTAGO - Plugin Reporting - Types et Interfaces
// =============================================================================

/**
 * Type de dashboard
 */
export enum DashboardType {
  ADMIN = 'admin',               // Dashboard administrateur
  CLIENT = 'client',             // Dashboard client
  CONSULTANT = 'consultant',     // Dashboard consultant
  MANAGER = 'manager',           // Dashboard manager/responsable
  COMMERCIAL = 'commercial',     // Dashboard commercial
  CUSTOM = 'custom'              // Dashboard personnalisé
}

/**
 * Type de widget
 */
export enum WidgetType {
  // Indicateurs
  KPI = 'kpi',                    // Indicateur clé (nombre, pourcentage)
  GAUGE = 'gauge',                // Jauge
  PROGRESS = 'progress',          // Barre de progression
  TREND = 'trend',                // Tendance (avec flèche)

  // Graphiques
  LINE_CHART = 'line_chart',      // Courbe
  BAR_CHART = 'bar_chart',        // Barres
  PIE_CHART = 'pie_chart',        // Camembert
  DONUT_CHART = 'donut_chart',    // Donut
  AREA_CHART = 'area_chart',      // Aire

  // Tableaux et listes
  TABLE = 'table',                // Tableau
  LIST = 'list',                  // Liste
  RANKING = 'ranking',            // Classement

  // Autres
  MAP = 'map',                    // Carte
  CALENDAR = 'calendar',          // Calendrier
  TIMELINE = 'timeline',          // Frise chronologique
  TEXT = 'text'                   // Texte/HTML
}

/**
 * Période de rapport
 */
export enum ReportPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

/**
 * Type de KPI
 */
export enum KPICategory {
  // Business
  REVENUE = 'revenue',              // Chiffre d'affaires
  MARGIN = 'margin',                // Marge
  GROWTH = 'growth',                // Croissance

  // Missions
  MISSIONS_COUNT = 'missions_count',   // Nombre de missions
  MISSIONS_VALUE = 'missions_value',   // Valeur des missions
  FILL_RATE = 'fill_rate',            // Taux de remplissage
  UTILIZATION = 'utilization',        // Taux d'utilisation

  // RFP et Applications
  RFP_COUNT = 'rfp_count',
  APPLICATIONS_COUNT = 'applications_count',
  CONVERSION_RATE = 'conversion_rate',
  MATCHING_SCORE = 'matching_score',

  // CRA et Facturation
  BILLABLE_DAYS = 'billable_days',
  BILLING_RATE = 'billing_rate',
  INVOICE_AMOUNT = 'invoice_amount',
  PAYMENT_RATE = 'payment_rate',
  DSO = 'dso',                       // Days Sales Outstanding

  // Ressources
  CONSULTANT_COUNT = 'consultant_count',
  CLIENT_COUNT = 'client_count',
  ACTIVE_MISSIONS = 'active_missions',

  // Performance
  NPS = 'nps',                       // Net Promoter Score
  SATISFACTION = 'satisfaction',
  QUALITY_SCORE = 'quality_score'
}

/**
 * Comparaison de période
 */
export enum ComparisonType {
  NONE = 'none',
  PREVIOUS_PERIOD = 'previous_period',
  SAME_PERIOD_LAST_YEAR = 'same_period_last_year',
  BUDGET = 'budget',
  TARGET = 'target'
}

/**
 * Format d'export
 */
export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  PNG = 'png'
}

/**
 * Interface pour un dashboard
 */
export interface IDashboard {
  id: string;
  name: string;
  description?: string;
  type: DashboardType;
  is_default: boolean;
  is_public: boolean;

  // Propriétaire
  owner_id?: string;
  organization_id?: string;

  // Layout
  layout: Array<{
    widget_id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;

  // Filtres globaux
  default_period?: ReportPeriod;
  filters?: Record<string, any>;

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour un widget
 */
export interface IWidget {
  id: string;
  dashboard_id: string;
  name: string;
  type: WidgetType;

  // Configuration
  config: {
    kpi_category?: KPICategory;
    data_source: string;
    query?: string;
    filters?: Record<string, any>;
    group_by?: string[];
    sort_by?: string;
    limit?: number;
    comparison?: ComparisonType;
  };

  // Affichage
  display: {
    title?: string;
    subtitle?: string;
    format?: string;        // number, currency, percent, date
    decimal_places?: number;
    prefix?: string;
    suffix?: string;
    color_scheme?: string;
    show_legend?: boolean;
    show_labels?: boolean;
  };

  // Seuils d'alerte
  thresholds?: Array<{
    value: number;
    color: string;
    label?: string;
  }>;

  refresh_interval?: number;  // En secondes

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour un rapport programmé
 */
export interface IScheduledReport {
  id: string;
  name: string;
  dashboard_id: string;

  // Planification
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day_of_week?: number;       // 0-6 pour weekly
  day_of_month?: number;      // 1-31 pour monthly
  time: string;               // HH:mm

  // Destinataires
  recipients: string[];       // IDs utilisateurs
  external_emails?: string[]; // Emails externes

  // Format
  format: ExportFormat;
  period: ReportPeriod;

  // État
  is_active: boolean;
  last_run_at?: Date;
  next_run_at?: Date;

  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour une donnée de KPI
 */
export interface IKPIData {
  value: number;
  previous_value?: number;
  change?: number;
  change_percent?: number;
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  target_percent?: number;
  period_start: Date;
  period_end: Date;
  breakdown?: Array<{
    label: string;
    value: number;
    percent?: number;
  }>;
}
