// =============================================================================
// PRESTAGO - Plugin Notifications - Point d'entrée serveur
// =============================================================================

import { Plugin } from '@nocobase/server';
import { NotificationService } from './services/NotificationService';
import { MessagingService } from './services/MessagingService';

// Collections
import { notificationsCollection } from './collections/notifications';
import { conversationsCollection, conversationParticipantsCollection } from './collections/conversations';
import { messagesCollection } from './collections/messages';
import { notificationPreferencesCollection, emailTemplatesCollection } from './collections/preferences';

export class PluginNotificationsServer extends Plugin {
  notificationService: NotificationService;
  messagingService: MessagingService;

  async afterAdd() {}

  async beforeLoad() {
    // Enregistrer les collections
    this.db.collection(notificationsCollection);
    this.db.collection(conversationsCollection);
    this.db.collection(conversationParticipantsCollection);
    this.db.collection(messagesCollection);
    this.db.collection(notificationPreferencesCollection);
    this.db.collection(emailTemplatesCollection);
  }

  async load() {
    // Initialiser les services
    this.notificationService = new NotificationService(this.db, this.app);
    this.messagingService = new MessagingService(this.db, this.app, this.notificationService);

    // Enregistrer les routes API
    this.registerNotificationRoutes();
    this.registerMessagingRoutes();
    this.registerPreferenceRoutes();

    // Programmer les tâches périodiques
    this.schedulePeriodicTasks();

    this.app.logger.info('Plugin Notifications chargé avec succès');
  }

  async install() {
    await this.db.sync();
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}

  private registerNotificationRoutes() {
    this.app.resource({
      name: 'notifications',
      actions: {
        // Liste des notifications
        list: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;
          const { status, type, page = 1, pageSize = 20 } = ctx.action.params;

          try {
            const result = await this.notificationService.getUserNotifications(userId, {
              status,
              type,
              limit: parseInt(pageSize),
              offset: (parseInt(page) - 1) * parseInt(pageSize)
            });
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Compteur de non-lus
        unreadCount: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;

          try {
            const count = await this.notificationService.getUnreadCount(userId);
            ctx.body = { success: true, data: { count } };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Marquer comme lue
        markAsRead: async (ctx, next) => {
          const { filterByTk: notificationId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const notification = await this.notificationService.markAsRead(notificationId, userId);
            ctx.body = { success: true, data: notification };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Marquer toutes comme lues
        markAllAsRead: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;

          try {
            const count = await this.notificationService.markAllAsRead(userId);
            ctx.body = { success: true, data: { count } };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Archiver
        archive: async (ctx, next) => {
          const { filterByTk: notificationId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const notification = await this.notificationService.archive(notificationId, userId);
            ctx.body = { success: true, data: notification };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('notifications', 'list', 'loggedIn');
    this.app.acl.allow('notifications', 'unreadCount', 'loggedIn');
    this.app.acl.allow('notifications', 'markAsRead', 'loggedIn');
    this.app.acl.allow('notifications', 'markAllAsRead', 'loggedIn');
    this.app.acl.allow('notifications', 'archive', 'loggedIn');
  }

  private registerMessagingRoutes() {
    this.app.resource({
      name: 'conversations',
      actions: {
        // Créer une conversation
        create: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const conversation = await this.messagingService.createConversation(values, userId);
            ctx.body = { success: true, data: conversation };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Liste des conversations
        list: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;
          const { type, includeArchived, page = 1, pageSize = 50 } = ctx.action.params;

          try {
            const result = await this.messagingService.getUserConversations(userId, {
              type,
              includeArchived: includeArchived === 'true',
              limit: parseInt(pageSize),
              offset: (parseInt(page) - 1) * parseInt(pageSize)
            });
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Messages d'une conversation
        messages: async (ctx, next) => {
          const { filterByTk: conversationId, before, limit } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const result = await this.messagingService.getConversationMessages(
              conversationId,
              userId,
              { before, limit: limit ? parseInt(limit) : undefined }
            );
            ctx.body = { success: true, data: result };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Ajouter un participant
        addParticipant: async (ctx, next) => {
          const { filterByTk: conversationId, participantId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const participant = await this.messagingService.addParticipant(
              conversationId,
              participantId,
              userId
            );
            ctx.body = { success: true, data: participant };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Retirer un participant
        removeParticipant: async (ctx, next) => {
          const { filterByTk: conversationId, participantId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            await this.messagingService.removeParticipant(conversationId, participantId, userId);
            ctx.body = { success: true };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Compteur total de non-lus
        unreadCount: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;

          try {
            const count = await this.messagingService.getTotalUnreadCount(userId);
            ctx.body = { success: true, data: { count } };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        }
      }
    });

    this.app.resource({
      name: 'messages',
      actions: {
        // Envoyer un message
        send: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const message = await this.messagingService.sendMessage(values, userId);
            ctx.body = { success: true, data: message };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        },

        // Supprimer un message
        delete: async (ctx, next) => {
          const { filterByTk: messageId } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;

          try {
            const message = await this.messagingService.deleteMessage(messageId, userId);
            ctx.body = { success: true, data: message };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('conversations', 'list', 'loggedIn');
    this.app.acl.allow('conversations', 'create', 'loggedIn');
    this.app.acl.allow('conversations', 'messages', 'loggedIn');
    this.app.acl.allow('conversations', 'addParticipant', 'loggedIn');
    this.app.acl.allow('conversations', 'removeParticipant', 'loggedIn');
    this.app.acl.allow('conversations', 'unreadCount', 'loggedIn');

    this.app.acl.allow('messages', 'send', 'loggedIn');
    this.app.acl.allow('messages', 'delete', 'loggedIn');
  }

  private registerPreferenceRoutes() {
    this.app.resource({
      name: 'notification_preferences',
      actions: {
        // Obtenir les préférences
        get: async (ctx, next) => {
          const userId = ctx.state.currentUser?.id;
          const collection = this.db.getCollection('prestago_notification_preferences');

          try {
            const preferences = await collection.repository.find({
              filter: { user_id: userId }
            });
            ctx.body = { success: true, data: preferences };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        // Mettre à jour les préférences
        update: async (ctx, next) => {
          const { values } = ctx.action.params;
          const userId = ctx.state.currentUser?.id;
          const collection = this.db.getCollection('prestago_notification_preferences');

          try {
            // Upsert pour chaque type de notification
            for (const pref of values) {
              const existing = await collection.repository.findOne({
                filter: {
                  user_id: userId,
                  notification_type: pref.notification_type
                }
              });

              if (existing) {
                await collection.repository.update({
                  filter: { id: existing.id },
                  values: pref
                });
              } else {
                await collection.repository.create({
                  values: { ...pref, user_id: userId }
                });
              }
            }

            const updated = await collection.repository.find({
              filter: { user_id: userId }
            });

            ctx.body = { success: true, data: updated };
          } catch (error) {
            ctx.throw(400, error.message);
          }

          await next();
        }
      }
    });

    // ACL
    this.app.acl.allow('notification_preferences', 'get', 'loggedIn');
    this.app.acl.allow('notification_preferences', 'update', 'loggedIn');

    this.app.acl.allow('email_templates', 'list', 'loggedIn');
    this.app.acl.allow('email_templates', 'get', 'loggedIn');
    this.app.acl.allow('email_templates', 'create', 'loggedIn');
    this.app.acl.allow('email_templates', 'update', 'loggedIn');
  }

  private schedulePeriodicTasks() {
    // Traiter les notifications programmées toutes les minutes
    setInterval(async () => {
      try {
        const processed = await this.notificationService.processScheduledNotifications();
        if (processed > 0) {
          this.app.logger.info(`${processed} notification(s) programmée(s) envoyée(s)`);
        }
      } catch (error) {
        this.app.logger.error('Erreur traitement notifications programmées:', error);
      }
    }, 60 * 1000);

    // Nettoyer les anciennes notifications une fois par jour
    setInterval(async () => {
      try {
        const deleted = await this.notificationService.cleanupOldNotifications();
        if (deleted > 0) {
          this.app.logger.info(`${deleted} ancienne(s) notification(s) supprimée(s)`);
        }
      } catch (error) {
        this.app.logger.error('Erreur nettoyage notifications:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }
}

export default PluginNotificationsServer;
