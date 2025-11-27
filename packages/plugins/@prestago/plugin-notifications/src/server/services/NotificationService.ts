// =============================================================================
// PRESTAGO - Plugin Notifications - Service: Gestion des Notifications
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  NOTIFICATION_DEFAULTS,
  DEFAULTS,
  isQuietHours
} from '../../shared/constants';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NOTIFICATION_EVENTS
} from '../../shared/types';

export class NotificationService {
  private db: Database;
  private eventEmitter: any;
  private emailService: any;

  constructor(db: Database, eventEmitter?: any, emailService?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
    this.emailService = emailService;
  }

  /**
   * Créer et envoyer une notification
   */
  async notify(data: {
    type: NotificationType;
    recipient_id: string;
    sender_id?: string;
    title: string;
    content: string;
    data?: Record<string, any>;
    action_url?: string;
    action_label?: string;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    scheduled_at?: Date;
  }): Promise<any[]> {
    const notifications: any[] = [];

    // Récupérer la configuration par défaut pour ce type
    const defaults = NOTIFICATION_DEFAULTS[data.type];
    const priority = data.priority || defaults.priority;
    const channels = data.channels || defaults.channels;

    // Récupérer les préférences utilisateur
    const preferences = await this.getUserPreferences(data.recipient_id, data.type);

    for (const channel of channels) {
      // Vérifier si le canal est activé pour l'utilisateur
      if (!this.isChannelEnabled(preferences, channel)) {
        continue;
      }

      // Vérifier les heures de silence (sauf pour les notifications urgentes)
      if (
        priority !== NotificationPriority.URGENT &&
        channel !== NotificationChannel.IN_APP &&
        preferences?.quiet_hours_enabled &&
        isQuietHours(preferences.quiet_hours_start, preferences.quiet_hours_end)
      ) {
        // Reporter la notification
        const scheduledAt = this.getNextActiveTime(preferences.quiet_hours_end);
        const notification = await this.createNotification({
          ...data,
          channel,
          priority,
          scheduled_at: scheduledAt
        });
        notifications.push(notification);
        continue;
      }

      // Créer et envoyer la notification
      const notification = await this.createNotification({
        ...data,
        channel,
        priority
      });

      // Envoyer selon le canal
      if (!data.scheduled_at) {
        await this.sendNotification(notification);
      }

      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Créer une notification
   */
  private async createNotification(data: {
    type: NotificationType;
    channel: NotificationChannel;
    priority: NotificationPriority;
    recipient_id: string;
    sender_id?: string;
    title: string;
    content: string;
    data?: Record<string, any>;
    action_url?: string;
    action_label?: string;
    scheduled_at?: Date;
  }): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    // Calculer la date d'expiration
    const defaults = NOTIFICATION_DEFAULTS[data.type];
    let expiresAt: Date | undefined;
    if (defaults.expiry_hours) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + defaults.expiry_hours);
    }

    const notification = await collection.repository.create({
      values: {
        type: data.type,
        channel: data.channel,
        priority: data.priority,
        status: data.scheduled_at ? NotificationStatus.PENDING : NotificationStatus.PENDING,
        recipient_id: data.recipient_id,
        sender_id: data.sender_id,
        title: data.title,
        content: data.content,
        data: data.data || {},
        action_url: data.action_url,
        action_label: data.action_label,
        scheduled_at: data.scheduled_at,
        expires_at: expiresAt
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_CREATED, { notification });
    }

    return notification;
  }

  /**
   * Envoyer une notification
   */
  private async sendNotification(notification: any): Promise<void> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    try {
      switch (notification.channel) {
        case NotificationChannel.IN_APP:
          // Les notifications in-app sont immédiatement disponibles
          await collection.repository.update({
            filter: { id: notification.id },
            values: {
              status: NotificationStatus.DELIVERED,
              sent_at: new Date(),
              delivered_at: new Date()
            }
          });
          break;

        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(notification);
          break;

        // SMS et Push à implémenter
        case NotificationChannel.SMS:
        case NotificationChannel.PUSH:
          // À implémenter
          break;
      }

      if (this.eventEmitter) {
        this.eventEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_SENT, { notification });
      }
    } catch (error) {
      await collection.repository.update({
        filter: { id: notification.id },
        values: {
          status: NotificationStatus.FAILED,
          error_message: error.message,
          retry_count: (notification.retry_count || 0) + 1
        }
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_FAILED, {
          notification,
          error
        });
      }
    }
  }

  /**
   * Envoyer une notification par email
   */
  private async sendEmailNotification(notification: any): Promise<void> {
    if (!this.emailService) {
      throw new Error('Service email non configuré');
    }

    // Récupérer l'utilisateur
    const user = await this.db.getCollection('users').repository.findOne({
      filter: { id: notification.recipient_id }
    });

    if (!user?.email) {
      throw new Error('Adresse email non trouvée');
    }

    await this.emailService.send({
      to: user.email,
      subject: notification.title,
      html: notification.content,
      text: notification.content.replace(/<[^>]*>/g, '')
    });

    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);
    await collection.repository.update({
      filter: { id: notification.id },
      values: {
        status: NotificationStatus.SENT,
        sent_at: new Date()
      }
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    const notification = await collection.repository.findOne({
      filter: { id: notificationId, recipient_id: userId }
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    const updated = await collection.repository.update({
      filter: { id: notificationId },
      values: {
        status: NotificationStatus.READ,
        read_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_READ, {
        notification: updated[0],
        userId
      });
    }

    return updated[0];
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    const result = await collection.repository.update({
      filter: {
        recipient_id: userId,
        status: { $ne: NotificationStatus.READ },
        channel: NotificationChannel.IN_APP
      },
      values: {
        status: NotificationStatus.READ,
        read_at: new Date()
      }
    });

    return result.length;
  }

  /**
   * Archiver une notification
   */
  async archive(notificationId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    const updated = await collection.repository.update({
      filter: { id: notificationId, recipient_id: userId },
      values: { status: NotificationStatus.ARCHIVED }
    });

    return updated[0];
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(
    userId: string,
    options: {
      status?: NotificationStatus;
      type?: NotificationType;
      channel?: NotificationChannel;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ notifications: any[]; total: number; unread: number }> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    const filter: any = {
      recipient_id: userId,
      channel: NotificationChannel.IN_APP,
      status: { $ne: NotificationStatus.ARCHIVED }
    };

    if (options.status) {
      filter.status = options.status;
    }
    if (options.type) {
      filter.type = options.type;
    }

    const [notifications, total, unread] = await Promise.all([
      collection.repository.find({
        filter,
        sort: ['-created_at'],
        limit: options.limit || DEFAULTS.MAX_NOTIFICATIONS_PER_PAGE,
        offset: options.offset || 0,
        appends: ['sender']
      }),
      collection.repository.count({ filter }),
      collection.repository.count({
        filter: {
          ...filter,
          status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.DELIVERED] }
        }
      })
    ]);

    return { notifications, total, unread };
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);

    return collection.repository.count({
      filter: {
        recipient_id: userId,
        channel: NotificationChannel.IN_APP,
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.DELIVERED] }
      }
    });
  }

  /**
   * Traiter les notifications programmées
   */
  async processScheduledNotifications(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);
    const now = new Date();

    const scheduledNotifications = await collection.repository.find({
      filter: {
        status: NotificationStatus.PENDING,
        scheduled_at: { $lte: now }
      }
    });

    let processed = 0;
    for (const notification of scheduledNotifications) {
      try {
        await this.sendNotification(notification);
        processed++;
      } catch (error) {
        console.error(`Erreur envoi notification ${notification.id}:`, error);
      }
    }

    return processed;
  }

  /**
   * Nettoyer les anciennes notifications
   */
  async cleanupOldNotifications(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATIONS);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DEFAULTS.NOTIFICATION_RETENTION_DAYS);

    const result = await collection.repository.destroy({
      filter: {
        created_at: { $lt: cutoffDate },
        status: { $in: [NotificationStatus.READ, NotificationStatus.ARCHIVED] }
      }
    });

    return result;
  }

  /**
   * Obtenir les préférences de notification d'un utilisateur
   */
  private async getUserPreferences(
    userId: string,
    notificationType: NotificationType
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.NOTIFICATION_PREFERENCES);

    return collection.repository.findOne({
      filter: {
        user_id: userId,
        notification_type: notificationType
      }
    });
  }

  /**
   * Vérifier si un canal est activé
   */
  private isChannelEnabled(preferences: any, channel: NotificationChannel): boolean {
    if (!preferences) return true; // Par défaut, tout est activé

    switch (channel) {
      case NotificationChannel.IN_APP:
        return preferences.in_app_enabled !== false;
      case NotificationChannel.EMAIL:
        return preferences.email_enabled !== false;
      case NotificationChannel.SMS:
        return preferences.sms_enabled === true;
      case NotificationChannel.PUSH:
        return preferences.push_enabled === true;
      default:
        return true;
    }
  }

  /**
   * Calculer la prochaine heure active après les heures de silence
   */
  private getNextActiveTime(quietEnd: string): Date {
    const [hours, minutes] = quietEnd.split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);

    if (next <= new Date()) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}
