// =============================================================================
// PRESTAGO - Plugin Notifications - Types et Interfaces
// =============================================================================

/**
 * Type de notification
 */
export enum NotificationType {
  // Système
  SYSTEM = 'system',
  ALERT = 'alert',
  REMINDER = 'reminder',

  // Missions et RFP
  RFP_PUBLISHED = 'rfp_published',
  RFP_MATCHED = 'rfp_matched',
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_STATUS = 'application_status',
  MISSION_STARTED = 'mission_started',
  MISSION_ENDING = 'mission_ending',
  MISSION_COMPLETED = 'mission_completed',

  // CRA et Facturation
  TIMESHEET_REMINDER = 'timesheet_reminder',
  TIMESHEET_SUBMITTED = 'timesheet_submitted',
  TIMESHEET_APPROVED = 'timesheet_approved',
  TIMESHEET_REJECTED = 'timesheet_rejected',
  INVOICE_CREATED = 'invoice_created',
  INVOICE_SENT = 'invoice_sent',
  INVOICE_OVERDUE = 'invoice_overdue',
  PAYMENT_RECEIVED = 'payment_received',

  // Contrats
  CONTRACT_PENDING_SIGNATURE = 'contract_pending_signature',
  CONTRACT_SIGNED = 'contract_signed',
  CONTRACT_EXPIRING = 'contract_expiring',

  // Conformité
  COMPLIANCE_DOC_EXPIRING = 'compliance_doc_expiring',
  COMPLIANCE_DOC_EXPIRED = 'compliance_doc_expired',
  COMPLIANCE_DOC_VALIDATED = 'compliance_doc_validated',
  COMPLIANCE_DOC_REJECTED = 'compliance_doc_rejected',

  // Messages
  NEW_MESSAGE = 'new_message',
  MESSAGE_REPLY = 'message_reply'
}

/**
 * Canal de notification
 */
export enum NotificationChannel {
  IN_APP = 'in_app',           // Notification dans l'application
  EMAIL = 'email',             // Email
  SMS = 'sms',                 // SMS (futur)
  PUSH = 'push'                // Push notification (futur)
}

/**
 * Priorité de notification
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Statut de notification
 */
export enum NotificationStatus {
  PENDING = 'pending',         // En attente d'envoi
  SENT = 'sent',              // Envoyée
  DELIVERED = 'delivered',     // Délivrée
  READ = 'read',              // Lue
  FAILED = 'failed',          // Échec
  ARCHIVED = 'archived'       // Archivée
}

/**
 * Statut d'un message
 */
export enum MessageStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  DELETED = 'deleted'
}

/**
 * Type de conversation
 */
export enum ConversationType {
  DIRECT = 'direct',           // Message direct (1 à 1)
  GROUP = 'group',            // Groupe
  MISSION = 'mission',        // Conversation liée à une mission
  RFP = 'rfp',                // Conversation liée à un RFP
  SUPPORT = 'support'         // Support technique
}

/**
 * Événements du système de notifications
 */
export const NOTIFICATION_EVENTS = {
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_FAILED: 'notification.failed',

  MESSAGE_SENT: 'message.sent',
  MESSAGE_DELIVERED: 'message.delivered',
  MESSAGE_READ: 'message.read',

  EMAIL_SENT: 'email.sent',
  EMAIL_FAILED: 'email.failed'
};

/**
 * Interface pour une notification
 */
export interface INotification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;

  recipient_id: string;
  sender_id?: string;

  title: string;
  content: string;
  data?: Record<string, any>;  // Données additionnelles (liens, IDs, etc.)

  scheduled_at?: Date;
  sent_at?: Date;
  read_at?: Date;

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour une conversation
 */
export interface IConversation {
  id: string;
  type: ConversationType;
  title?: string;

  // Lien avec entités
  mission_id?: string;
  rfp_id?: string;

  // Participants
  participants: string[];      // IDs des utilisateurs

  last_message_at?: Date;
  last_message_preview?: string;

  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour un message
 */
export interface IMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  status: MessageStatus;

  content: string;
  attachments?: string[];

  reply_to_id?: string;        // Pour les réponses

  sent_at?: Date;
  delivered_at?: Date;
  read_by?: Array<{ user_id: string; read_at: Date }>;

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour les préférences de notification
 */
export interface INotificationPreference {
  id: string;
  user_id: string;
  notification_type: NotificationType;

  in_app_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;

  // Horaires de silence
  quiet_hours_start?: string;   // Format HH:mm
  quiet_hours_end?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour un template d'email
 */
export interface IEmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  content_html: string;
  content_text?: string;
  variables: string[];
  language: string;
  is_active: boolean;

  created_at: Date;
  updated_at: Date;
}

/**
 * Configuration email par défaut
 */
export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}
