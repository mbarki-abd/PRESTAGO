// =============================================================================
// PRESTAGO - Plugin Notifications - Constantes
// =============================================================================

import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus
} from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  NOTIFICATIONS: 'prestago_notifications',
  CONVERSATIONS: 'prestago_conversations',
  MESSAGES: 'prestago_messages',
  CONVERSATION_PARTICIPANTS: 'prestago_conversation_participants',
  NOTIFICATION_PREFERENCES: 'prestago_notification_preferences',
  EMAIL_TEMPLATES: 'prestago_email_templates',
  EMAIL_LOG: 'prestago_email_log'
};

/**
 * Configuration des types de notification par défaut
 */
export const NOTIFICATION_DEFAULTS: Record<NotificationType, {
  priority: NotificationPriority;
  channels: NotificationChannel[];
  expiry_hours?: number;
}> = {
  // Système
  [NotificationType.SYSTEM]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP]
  },
  [NotificationType.ALERT]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.REMINDER]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },

  // Missions et RFP
  [NotificationType.RFP_PUBLISHED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.RFP_MATCHED]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.APPLICATION_RECEIVED]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.APPLICATION_STATUS]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.MISSION_STARTED]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.MISSION_ENDING]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    expiry_hours: 168 // 7 jours
  },
  [NotificationType.MISSION_COMPLETED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },

  // CRA et Facturation
  [NotificationType.TIMESHEET_REMINDER]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.TIMESHEET_SUBMITTED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.TIMESHEET_APPROVED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.TIMESHEET_REJECTED]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.INVOICE_CREATED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP]
  },
  [NotificationType.INVOICE_SENT]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.INVOICE_OVERDUE]: {
    priority: NotificationPriority.URGENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.PAYMENT_RECEIVED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },

  // Contrats
  [NotificationType.CONTRACT_PENDING_SIGNATURE]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.CONTRACT_SIGNED]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.CONTRACT_EXPIRING]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },

  // Conformité
  [NotificationType.COMPLIANCE_DOC_EXPIRING]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.COMPLIANCE_DOC_EXPIRED]: {
    priority: NotificationPriority.URGENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },
  [NotificationType.COMPLIANCE_DOC_VALIDATED]: {
    priority: NotificationPriority.LOW,
    channels: [NotificationChannel.IN_APP]
  },
  [NotificationType.COMPLIANCE_DOC_REJECTED]: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  },

  // Messages
  [NotificationType.NEW_MESSAGE]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    expiry_hours: 24
  },
  [NotificationType.MESSAGE_REPLY]: {
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP],
    expiry_hours: 24
  }
};

/**
 * Templates d'email par défaut
 */
export const DEFAULT_EMAIL_TEMPLATES = {
  // CRA
  TIMESHEET_REMINDER: {
    code: 'timesheet_reminder',
    subject: 'Rappel: CRA à soumettre',
    variables: ['consultant_name', 'period', 'deadline', 'link']
  },
  TIMESHEET_SUBMITTED: {
    code: 'timesheet_submitted',
    subject: 'CRA soumis pour validation',
    variables: ['consultant_name', 'period', 'approver_name', 'link']
  },
  TIMESHEET_APPROVED: {
    code: 'timesheet_approved',
    subject: 'Votre CRA a été approuvé',
    variables: ['period', 'approver_name']
  },
  TIMESHEET_REJECTED: {
    code: 'timesheet_rejected',
    subject: 'Votre CRA nécessite des modifications',
    variables: ['period', 'reason', 'link']
  },

  // Factures
  INVOICE_SENT: {
    code: 'invoice_sent',
    subject: 'Facture {{invoice_number}}',
    variables: ['invoice_number', 'amount', 'due_date', 'link']
  },
  INVOICE_OVERDUE: {
    code: 'invoice_overdue',
    subject: 'Rappel: Facture {{invoice_number}} en retard',
    variables: ['invoice_number', 'amount', 'days_overdue', 'link']
  },
  PAYMENT_RECEIVED: {
    code: 'payment_received',
    subject: 'Paiement reçu pour la facture {{invoice_number}}',
    variables: ['invoice_number', 'amount', 'payment_date']
  },

  // Contrats
  CONTRACT_PENDING_SIGNATURE: {
    code: 'contract_pending_signature',
    subject: 'Contrat en attente de signature',
    variables: ['contract_title', 'signer_name', 'link']
  },
  CONTRACT_SIGNED: {
    code: 'contract_signed',
    subject: 'Contrat signé: {{contract_title}}',
    variables: ['contract_title', 'signed_date']
  },

  // Conformité
  COMPLIANCE_DOC_EXPIRING: {
    code: 'compliance_doc_expiring',
    subject: 'Document de conformité expire bientôt',
    variables: ['document_type', 'expiry_date', 'days_remaining', 'link']
  },
  COMPLIANCE_DOC_EXPIRED: {
    code: 'compliance_doc_expired',
    subject: 'Document de conformité expiré',
    variables: ['document_type', 'expiry_date', 'link']
  },

  // RFP et Candidatures
  RFP_MATCHED: {
    code: 'rfp_matched',
    subject: 'Nouvelle opportunité correspondant à votre profil',
    variables: ['rfp_title', 'client_name', 'skills', 'link']
  },
  APPLICATION_RECEIVED: {
    code: 'application_received',
    subject: 'Nouvelle candidature reçue',
    variables: ['consultant_name', 'rfp_title', 'link']
  },
  APPLICATION_STATUS: {
    code: 'application_status',
    subject: 'Mise à jour de votre candidature',
    variables: ['rfp_title', 'status', 'message', 'link']
  }
};

/**
 * Configuration par défaut
 */
export const DEFAULTS = {
  MAX_NOTIFICATIONS_PER_PAGE: 50,
  MAX_MESSAGES_PER_PAGE: 100,
  NOTIFICATION_RETENTION_DAYS: 90,
  EMAIL_RETRY_ATTEMPTS: 3,
  EMAIL_RETRY_DELAY_MS: 5000,
  QUIET_HOURS_START: '22:00',
  QUIET_HOURS_END: '08:00'
};

/**
 * Couleurs de priorité pour l'UI
 */
export const PRIORITY_COLORS = {
  [NotificationPriority.LOW]: 'default',
  [NotificationPriority.NORMAL]: 'processing',
  [NotificationPriority.HIGH]: 'warning',
  [NotificationPriority.URGENT]: 'error'
};

/**
 * Icônes par type de notification
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  [NotificationType.SYSTEM]: 'info-circle',
  [NotificationType.ALERT]: 'exclamation-circle',
  [NotificationType.REMINDER]: 'clock-circle',
  [NotificationType.RFP_PUBLISHED]: 'file-search',
  [NotificationType.RFP_MATCHED]: 'star',
  [NotificationType.APPLICATION_RECEIVED]: 'user-add',
  [NotificationType.APPLICATION_STATUS]: 'solution',
  [NotificationType.MISSION_STARTED]: 'rocket',
  [NotificationType.MISSION_ENDING]: 'calendar',
  [NotificationType.MISSION_COMPLETED]: 'check-circle',
  [NotificationType.TIMESHEET_REMINDER]: 'schedule',
  [NotificationType.TIMESHEET_SUBMITTED]: 'file-done',
  [NotificationType.TIMESHEET_APPROVED]: 'check-circle',
  [NotificationType.TIMESHEET_REJECTED]: 'close-circle',
  [NotificationType.INVOICE_CREATED]: 'file-text',
  [NotificationType.INVOICE_SENT]: 'mail',
  [NotificationType.INVOICE_OVERDUE]: 'warning',
  [NotificationType.PAYMENT_RECEIVED]: 'dollar',
  [NotificationType.CONTRACT_PENDING_SIGNATURE]: 'edit',
  [NotificationType.CONTRACT_SIGNED]: 'file-protect',
  [NotificationType.CONTRACT_EXPIRING]: 'calendar',
  [NotificationType.COMPLIANCE_DOC_EXPIRING]: 'file-exclamation',
  [NotificationType.COMPLIANCE_DOC_EXPIRED]: 'file-exclamation',
  [NotificationType.COMPLIANCE_DOC_VALIDATED]: 'file-done',
  [NotificationType.COMPLIANCE_DOC_REJECTED]: 'file-exclamation',
  [NotificationType.NEW_MESSAGE]: 'message',
  [NotificationType.MESSAGE_REPLY]: 'message'
};

/**
 * Vérifier si une heure est dans les heures de silence
 */
export function isQuietHours(
  quietStart: string | null | undefined,
  quietEnd: string | null | undefined
): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Gérer le cas où la période traverse minuit
  if (startMinutes > endMinutes) {
    return currentTime >= startMinutes || currentTime < endMinutes;
  }

  return currentTime >= startMinutes && currentTime < endMinutes;
}

/**
 * Générer un aperçu de message
 */
export function generateMessagePreview(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
}

/**
 * Formater une date pour l'affichage
 */
export function formatNotificationDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;

  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined
  });
}
