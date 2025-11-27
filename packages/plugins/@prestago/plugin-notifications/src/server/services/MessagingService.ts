// =============================================================================
// PRESTAGO - Plugin Notifications - Service: Messagerie
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  DEFAULTS,
  generateMessagePreview
} from '../../shared/constants';
import {
  ConversationType,
  MessageStatus,
  NotificationType,
  NOTIFICATION_EVENTS
} from '../../shared/types';

export class MessagingService {
  private db: Database;
  private eventEmitter: any;
  private notificationService: any;

  constructor(db: Database, eventEmitter?: any, notificationService?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
    this.notificationService = notificationService;
  }

  /**
   * Créer une conversation
   */
  async createConversation(data: {
    type: ConversationType;
    title?: string;
    participant_ids: string[];
    mission_id?: string;
    rfp_id?: string;
  }, userId: string): Promise<any> {
    const conversationCollection = this.db.getCollection(COLLECTIONS.CONVERSATIONS);
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    // Pour les conversations directes, vérifier si elle existe déjà
    if (data.type === ConversationType.DIRECT && data.participant_ids.length === 1) {
      const existingConversation = await this.findDirectConversation(
        userId,
        data.participant_ids[0]
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Créer la conversation
    const conversation = await conversationCollection.repository.create({
      values: {
        type: data.type,
        title: data.title,
        mission_id: data.mission_id,
        rfp_id: data.rfp_id,
        created_by_id: userId
      }
    });

    // Ajouter le créateur comme admin
    await participantCollection.repository.create({
      values: {
        conversation_id: conversation.id,
        user_id: userId,
        role: 'admin',
        joined_at: new Date()
      }
    });

    // Ajouter les autres participants
    for (const participantId of data.participant_ids) {
      if (participantId !== userId) {
        await participantCollection.repository.create({
          values: {
            conversation_id: conversation.id,
            user_id: participantId,
            role: 'member',
            joined_at: new Date()
          }
        });
      }
    }

    return conversation;
  }

  /**
   * Envoyer un message
   */
  async sendMessage(data: {
    conversation_id: string;
    content: string;
    attachments?: string[];
    reply_to_id?: string;
  }, userId: string): Promise<any> {
    const messageCollection = this.db.getCollection(COLLECTIONS.MESSAGES);
    const conversationCollection = this.db.getCollection(COLLECTIONS.CONVERSATIONS);
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    // Vérifier que l'utilisateur est participant
    const participant = await participantCollection.repository.findOne({
      filter: {
        conversation_id: data.conversation_id,
        user_id: userId
      }
    });

    if (!participant) {
      throw new Error('Vous n\'êtes pas membre de cette conversation');
    }

    const now = new Date();

    // Créer le message
    const message = await messageCollection.repository.create({
      values: {
        conversation_id: data.conversation_id,
        sender_id: userId,
        status: MessageStatus.SENT,
        content: data.content,
        attachments: data.attachments || [],
        reply_to_id: data.reply_to_id,
        sent_at: now,
        read_by: [{ user_id: userId, read_at: now }]
      }
    });

    // Mettre à jour la conversation
    await conversationCollection.repository.update({
      filter: { id: data.conversation_id },
      values: {
        last_message_at: now,
        last_message_preview: generateMessagePreview(data.content)
      }
    });

    // Incrémenter le compteur de non-lus pour les autres participants
    await participantCollection.repository.update({
      filter: {
        conversation_id: data.conversation_id,
        user_id: { $ne: userId }
      },
      values: {
        unread_count: this.db.sequelize.literal('unread_count + 1')
      }
    });

    // Notifier les autres participants
    if (this.notificationService) {
      const otherParticipants = await participantCollection.repository.find({
        filter: {
          conversation_id: data.conversation_id,
          user_id: { $ne: userId },
          is_muted: false
        }
      });

      const sender = await this.db.getCollection('users').repository.findOne({
        filter: { id: userId }
      });

      for (const p of otherParticipants) {
        await this.notificationService.notify({
          type: NotificationType.NEW_MESSAGE,
          recipient_id: p.user_id,
          sender_id: userId,
          title: `Nouveau message de ${sender?.nickname || 'Utilisateur'}`,
          content: generateMessagePreview(data.content, 50),
          data: {
            conversation_id: data.conversation_id,
            message_id: message.id
          },
          action_url: `/messages/${data.conversation_id}`
        });
      }
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.MESSAGE_SENT, {
        message,
        conversation_id: data.conversation_id,
        userId
      });
    }

    return message;
  }

  /**
   * Marquer les messages comme lus
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const messageCollection = this.db.getCollection(COLLECTIONS.MESSAGES);
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    const now = new Date();

    // Mettre à jour le participant
    await participantCollection.repository.update({
      filter: {
        conversation_id: conversationId,
        user_id: userId
      },
      values: {
        last_read_at: now,
        unread_count: 0
      }
    });

    // Mettre à jour les messages (ajouter l'utilisateur à read_by)
    const unreadMessages = await messageCollection.repository.find({
      filter: {
        conversation_id: conversationId,
        sender_id: { $ne: userId }
      }
    });

    for (const message of unreadMessages) {
      const readBy = message.read_by || [];
      if (!readBy.some((r: any) => r.user_id === userId)) {
        readBy.push({ user_id: userId, read_at: now });
        await messageCollection.repository.update({
          filter: { id: message.id },
          values: { read_by: readBy }
        });
      }
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.MESSAGE_READ, {
        conversationId,
        userId
      });
    }
  }

  /**
   * Obtenir les conversations d'un utilisateur
   */
  async getUserConversations(
    userId: string,
    options: {
      type?: ConversationType;
      includeArchived?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ conversations: any[]; total: number }> {
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);
    const conversationCollection = this.db.getCollection(COLLECTIONS.CONVERSATIONS);

    // Récupérer les IDs des conversations de l'utilisateur
    const participations = await participantCollection.repository.find({
      filter: { user_id: userId }
    });

    const conversationIds = participations.map((p: any) => p.conversation_id);

    if (conversationIds.length === 0) {
      return { conversations: [], total: 0 };
    }

    const filter: any = {
      id: { $in: conversationIds }
    };

    if (options.type) {
      filter.type = options.type;
    }

    if (!options.includeArchived) {
      filter.is_archived = false;
    }

    const [conversations, total] = await Promise.all([
      conversationCollection.repository.find({
        filter,
        sort: ['-last_message_at'],
        limit: options.limit || 50,
        offset: options.offset || 0,
        appends: ['participants.user']
      }),
      conversationCollection.repository.count({ filter })
    ]);

    // Ajouter le compteur de non-lus
    for (const conv of conversations) {
      const participation = participations.find(
        (p: any) => p.conversation_id === conv.id
      );
      conv.unread_count = participation?.unread_count || 0;
    }

    return { conversations, total };
  }

  /**
   * Obtenir les messages d'une conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    options: {
      limit?: number;
      before?: string; // ID du message avant lequel charger
    } = {}
  ): Promise<{ messages: any[]; hasMore: boolean }> {
    const messageCollection = this.db.getCollection(COLLECTIONS.MESSAGES);
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    // Vérifier l'accès
    const participant = await participantCollection.repository.findOne({
      filter: {
        conversation_id: conversationId,
        user_id: userId
      }
    });

    if (!participant) {
      throw new Error('Accès non autorisé à cette conversation');
    }

    const filter: any = {
      conversation_id: conversationId,
      status: { $ne: MessageStatus.DELETED }
    };

    if (options.before) {
      const beforeMessage = await messageCollection.repository.findOne({
        filter: { id: options.before }
      });
      if (beforeMessage) {
        filter.created_at = { $lt: beforeMessage.created_at };
      }
    }

    const limit = options.limit || DEFAULTS.MAX_MESSAGES_PER_PAGE;

    const messages = await messageCollection.repository.find({
      filter,
      sort: ['-created_at'],
      limit: limit + 1, // +1 pour savoir s'il y en a d'autres
      appends: ['sender', 'reply_to']
    });

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    // Inverser pour avoir l'ordre chronologique
    messages.reverse();

    // Marquer comme lus
    await this.markAsRead(conversationId, userId);

    return { messages, hasMore };
  }

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId: string, userId: string): Promise<any> {
    const messageCollection = this.db.getCollection(COLLECTIONS.MESSAGES);

    const message = await messageCollection.repository.findOne({
      filter: { id: messageId }
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (message.sender_id !== userId) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    const updated = await messageCollection.repository.update({
      filter: { id: messageId },
      values: { status: MessageStatus.DELETED }
    });

    return updated[0];
  }

  /**
   * Ajouter un participant à une conversation
   */
  async addParticipant(
    conversationId: string,
    participantId: string,
    userId: string
  ): Promise<any> {
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    // Vérifier que l'utilisateur est admin
    const adminParticipant = await participantCollection.repository.findOne({
      filter: {
        conversation_id: conversationId,
        user_id: userId,
        role: 'admin'
      }
    });

    if (!adminParticipant) {
      throw new Error('Vous devez être admin pour ajouter des participants');
    }

    // Vérifier que le participant n'est pas déjà membre
    const existing = await participantCollection.repository.findOne({
      filter: {
        conversation_id: conversationId,
        user_id: participantId
      }
    });

    if (existing) {
      throw new Error('Cet utilisateur est déjà membre de la conversation');
    }

    return participantCollection.repository.create({
      values: {
        conversation_id: conversationId,
        user_id: participantId,
        role: 'member',
        joined_at: new Date()
      }
    });
  }

  /**
   * Retirer un participant d'une conversation
   */
  async removeParticipant(
    conversationId: string,
    participantId: string,
    userId: string
  ): Promise<void> {
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    // Vérifier les droits (admin ou soi-même)
    if (participantId !== userId) {
      const adminParticipant = await participantCollection.repository.findOne({
        filter: {
          conversation_id: conversationId,
          user_id: userId,
          role: 'admin'
        }
      });

      if (!adminParticipant) {
        throw new Error('Vous devez être admin pour retirer des participants');
      }
    }

    await participantCollection.repository.destroy({
      filter: {
        conversation_id: conversationId,
        user_id: participantId
      }
    });
  }

  /**
   * Trouver une conversation directe entre deux utilisateurs
   */
  private async findDirectConversation(userId1: string, userId2: string): Promise<any> {
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);
    const conversationCollection = this.db.getCollection(COLLECTIONS.CONVERSATIONS);

    // Trouver les conversations directes de l'utilisateur 1
    const user1Participations = await participantCollection.repository.find({
      filter: { user_id: userId1 }
    });

    for (const p of user1Participations) {
      const conversation = await conversationCollection.repository.findOne({
        filter: { id: p.conversation_id, type: ConversationType.DIRECT }
      });

      if (conversation) {
        // Vérifier si l'utilisateur 2 est aussi participant
        const user2Participant = await participantCollection.repository.findOne({
          filter: {
            conversation_id: conversation.id,
            user_id: userId2
          }
        });

        if (user2Participant) {
          return conversation;
        }
      }
    }

    return null;
  }

  /**
   * Obtenir le nombre total de messages non lus
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const participantCollection = this.db.getCollection(COLLECTIONS.CONVERSATION_PARTICIPANTS);

    const participations = await participantCollection.repository.find({
      filter: { user_id: userId }
    });

    return participations.reduce((sum: number, p: any) => sum + (p.unread_count || 0), 0);
  }
}
