// =============================================================================
// PRESTAGO - Plugin RFP - Service: RFP Invitations
// =============================================================================

import { Database } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';
import { RFP_EVENTS } from '../../shared/types';

export class RFPInvitationService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Send invitation to a profile or organization
   */
  async sendInvitation(
    rfpId: string,
    data: {
      invited_organization_id?: string;
      invited_profile_id?: string;
      message?: string;
      expires_at?: Date;
    },
    invitedByUserId: string
  ): Promise<any> {
    // Validate that either org or profile is provided
    if (!data.invited_organization_id && !data.invited_profile_id) {
      throw new Error('Must specify either an organization or a profile to invite');
    }

    // Check RFP exists
    const rfpCollection = this.db.getCollection(COLLECTIONS.RFPS);
    const rfp = await rfpCollection.repository.findOne({
      filter: { id: rfpId },
    });

    if (!rfp) {
      throw new Error('RFP not found');
    }

    // Check if invitation already exists
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);
    const existing = await collection.repository.findOne({
      filter: {
        rfp_id: rfpId,
        $or: [
          { invited_organization_id: data.invited_organization_id },
          { invited_profile_id: data.invited_profile_id },
        ].filter(Boolean),
        status: { $in: ['pending', 'accepted'] },
      },
    });

    if (existing) {
      throw new Error('An invitation already exists for this recipient');
    }

    // Default expiration: 30 days from now
    const expiresAt = data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invitation = await collection.repository.create({
      values: {
        rfp_id: rfpId,
        invited_organization_id: data.invited_organization_id,
        invited_profile_id: data.invited_profile_id,
        invited_by_user_id: invitedByUserId,
        message: data.message,
        status: 'pending',
        expires_at: expiresAt,
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_INVITATION_SENT, {
        rfpId,
        invitationId: invitation.id,
        invitedOrganizationId: data.invited_organization_id,
        invitedProfileId: data.invited_profile_id,
        invitedBy: invitedByUserId,
      });
    }

    return invitation;
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const invitation = await collection.repository.findOne({
      filter: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot accept invitation with status '${invitation.status}'`);
    }

    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await collection.repository.update({
        filter: { id: invitationId },
        values: { status: 'expired' },
      });
      throw new Error('Invitation has expired');
    }

    const updated = await collection.repository.update({
      filter: { id: invitationId },
      values: {
        status: 'accepted',
        responded_at: new Date(),
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_INVITATION_ACCEPTED, {
        rfpId: invitation.rfp_id,
        invitationId,
        invitedOrganizationId: invitation.invited_organization_id,
        invitedProfileId: invitation.invited_profile_id,
      });
    }

    return updated[0];
  }

  /**
   * Decline an invitation
   */
  async declineInvitation(invitationId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const invitation = await collection.repository.findOne({
      filter: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot decline invitation with status '${invitation.status}'`);
    }

    const updated = await collection.repository.update({
      filter: { id: invitationId },
      values: {
        status: 'declined',
        responded_at: new Date(),
      },
    });

    // Emit event
    if (this.eventEmitter) {
      this.eventEmitter.emit(RFP_EVENTS.RFP_INVITATION_DECLINED, {
        rfpId: invitation.rfp_id,
        invitationId,
      });
    }

    return updated[0];
  }

  /**
   * Get invitations for an RFP
   */
  async getInvitationsByRFP(
    rfpId: string,
    options: { status?: string } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const filter: any = { rfp_id: rfpId };
    if (options.status) {
      filter.status = options.status;
    }

    return collection.repository.find({
      filter,
      sort: ['-created_at'],
      appends: ['invited_organization', 'invited_profile', 'invited_by_user'],
    });
  }

  /**
   * Get invitations for a profile
   */
  async getInvitationsForProfile(
    profileId: string,
    options: { status?: string; includeExpired?: boolean } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const filter: any = { invited_profile_id: profileId };

    if (options.status) {
      filter.status = options.status;
    } else if (!options.includeExpired) {
      filter.status = { $ne: 'expired' };
    }

    return collection.repository.find({
      filter,
      sort: ['-created_at'],
      appends: ['rfp', 'invited_by_user'],
    });
  }

  /**
   * Get invitations for an organization
   */
  async getInvitationsForOrganization(
    organizationId: string,
    options: { status?: string; includeExpired?: boolean } = {}
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const filter: any = { invited_organization_id: organizationId };

    if (options.status) {
      filter.status = options.status;
    } else if (!options.includeExpired) {
      filter.status = { $ne: 'expired' };
    }

    return collection.repository.find({
      filter,
      sort: ['-created_at'],
      appends: ['rfp', 'invited_by_user'],
    });
  }

  /**
   * Check if user has access to RFP via invitation
   */
  async hasInvitationAccess(
    rfpId: string,
    userId: string,
    organizationId?: string,
    profileId?: string
  ): Promise<boolean> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const conditions: any[] = [];

    if (organizationId) {
      conditions.push({ invited_organization_id: organizationId });
    }
    if (profileId) {
      conditions.push({ invited_profile_id: profileId });
    }

    if (conditions.length === 0) {
      return false;
    }

    const invitation = await collection.repository.findOne({
      filter: {
        rfp_id: rfpId,
        status: 'accepted',
        $or: conditions,
      },
    });

    return !!invitation;
  }

  /**
   * Expire old invitations
   */
  async expireOldInvitations(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const result = await collection.repository.update({
      filter: {
        status: 'pending',
        expires_at: { $lt: new Date() },
      },
      values: { status: 'expired' },
    });

    return result.length;
  }

  /**
   * Bulk invite profiles
   */
  async bulkInviteProfiles(
    rfpId: string,
    profileIds: string[],
    message: string | undefined,
    invitedByUserId: string
  ): Promise<any[]> {
    const results: any[] = [];

    for (const profileId of profileIds) {
      try {
        const invitation = await this.sendInvitation(
          rfpId,
          { invited_profile_id: profileId, message },
          invitedByUserId
        );
        results.push({ profileId, success: true, invitation });
      } catch (error: any) {
        results.push({ profileId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get invitation statistics for an RFP
   */
  async getInvitationStats(rfpId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.RFP_INVITATIONS);

    const all = await collection.repository.find({
      filter: { rfp_id: rfpId },
    });

    return {
      total: all.length,
      pending: all.filter((i: any) => i.status === 'pending').length,
      accepted: all.filter((i: any) => i.status === 'accepted').length,
      declined: all.filter((i: any) => i.status === 'declined').length,
      expired: all.filter((i: any) => i.status === 'expired').length,
      response_rate: all.length > 0
        ? ((all.filter((i: any) => ['accepted', 'declined'].includes(i.status)).length / all.length) * 100).toFixed(1)
        : 0,
      acceptance_rate: all.filter((i: any) => ['accepted', 'declined'].includes(i.status)).length > 0
        ? ((all.filter((i: any) => i.status === 'accepted').length /
            all.filter((i: any) => ['accepted', 'declined'].includes(i.status)).length) * 100).toFixed(1)
        : 0,
    };
  }
}
