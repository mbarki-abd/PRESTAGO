// =============================================================================
// PRESTAGO - Plugin Contracts - Service: Gestion des Contrats
// =============================================================================

import { Database } from '@nocobase/database';
import { randomUUID } from 'crypto';
import {
  COLLECTIONS,
  CONTRACT_STATUS_TRANSITIONS,
  DEFAULTS,
  generateContractReference,
  areAllSignaturesComplete
} from '../../shared/constants';
import {
  ContractType,
  ContractStatus,
  SignatureType,
  SignatureStatus,
  CONTRACT_EVENTS
} from '../../shared/types';

export class ContractService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Créer un nouveau contrat
   */
  async createContract(data: {
    type: ContractType;
    title: string;
    description?: string;
    party_a_organization_id: string;
    party_b_organization_id: string;
    party_a_signatory_id?: string;
    party_b_signatory_id?: string;
    mission_id?: string;
    template_id?: string;
    effective_date?: Date;
    expiry_date?: Date;
    total_value?: number;
    currency?: string;
    content?: string;
    notes?: string;
  }, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    // Générer la référence
    const year = new Date().getFullYear();
    const count = await collection.repository.count({
      filter: {
        created_at: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    });

    const reference = generateContractReference(data.type, year, count + 1);

    // Récupérer le contenu du template si spécifié
    let content = data.content;
    if (data.template_id && !content) {
      const template = await this.db.getCollection(COLLECTIONS.CONTRACT_TEMPLATES)
        .repository.findOne({ filter: { id: data.template_id } });
      if (template) {
        content = template.content;
      }
    }

    const contract = await collection.repository.create({
      values: {
        reference,
        type: data.type,
        status: ContractStatus.DRAFT,
        title: data.title,
        description: data.description,
        party_a_organization_id: data.party_a_organization_id,
        party_b_organization_id: data.party_b_organization_id,
        party_a_signatory_id: data.party_a_signatory_id,
        party_b_signatory_id: data.party_b_signatory_id,
        mission_id: data.mission_id,
        template_id: data.template_id,
        effective_date: data.effective_date,
        expiry_date: data.expiry_date,
        total_value: data.total_value,
        currency: data.currency || DEFAULTS.CURRENCY,
        content,
        notes: data.notes,
        version: DEFAULTS.CONTRACT_VERSION,
        created_by_id: userId
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_CREATED, { contract, userId });
    }

    return contract;
  }

  /**
   * Créer un avenant
   */
  async createAmendment(
    parentContractId: string,
    data: {
      title: string;
      description?: string;
      effective_date?: Date;
      expiry_date?: Date;
      total_value?: number;
      content?: string;
    },
    userId: string
  ): Promise<any> {
    const contractCollection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    // Récupérer le contrat parent
    const parentContract = await contractCollection.repository.findOne({
      filter: { id: parentContractId }
    });

    if (!parentContract) {
      throw new Error('Contrat parent non trouvé');
    }

    if (parentContract.status !== ContractStatus.ACTIVE) {
      throw new Error('Le contrat parent doit être actif pour créer un avenant');
    }

    // Compter les avenants existants
    const amendmentCount = await contractCollection.repository.count({
      filter: { parent_contract_id: parentContractId }
    });

    const year = new Date().getFullYear();
    const reference = `${parentContract.reference}-AV${(amendmentCount + 1).toString().padStart(2, '0')}`;

    const amendment = await contractCollection.repository.create({
      values: {
        reference,
        type: ContractType.AMENDMENT,
        status: ContractStatus.DRAFT,
        title: data.title,
        description: data.description,
        party_a_organization_id: parentContract.party_a_organization_id,
        party_b_organization_id: parentContract.party_b_organization_id,
        party_a_signatory_id: parentContract.party_a_signatory_id,
        party_b_signatory_id: parentContract.party_b_signatory_id,
        mission_id: parentContract.mission_id,
        parent_contract_id: parentContractId,
        effective_date: data.effective_date || new Date(),
        expiry_date: data.expiry_date || parentContract.expiry_date,
        total_value: data.total_value,
        currency: parentContract.currency,
        content: data.content,
        version: 1,
        created_by_id: userId
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.AMENDMENT_CREATED, {
        amendment,
        parentContract,
        userId
      });
    }

    return amendment;
  }

  /**
   * Soumettre un contrat pour révision
   */
  async submitForReview(contractId: string, userId: string): Promise<any> {
    return this.updateContractStatus(
      contractId,
      ContractStatus.PENDING_REVIEW,
      userId,
      CONTRACT_EVENTS.CONTRACT_SUBMITTED
    );
  }

  /**
   * Approuver un contrat
   */
  async approveContract(contractId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const contract = await collection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    this.validateStatusTransition(contract.status, ContractStatus.PENDING_SIGNATURE);

    const updated = await collection.repository.update({
      filter: { id: contractId },
      values: {
        status: ContractStatus.PENDING_SIGNATURE,
        approved_by_id: userId,
        approved_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_APPROVED, {
        contract: updated[0],
        userId
      });
    }

    return updated[0];
  }

  /**
   * Rejeter un contrat
   */
  async rejectContract(contractId: string, userId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const contract = await collection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    const updated = await collection.repository.update({
      filter: { id: contractId },
      values: {
        status: ContractStatus.DRAFT,
        internal_notes: `Rejeté: ${reason}\n${contract.internal_notes || ''}`
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_REJECTED, {
        contract: updated[0],
        reason,
        userId
      });
    }

    return updated[0];
  }

  /**
   * Envoyer pour signature
   */
  async sendForSignature(contractId: string, signatories: Array<{
    user_id: string;
    email: string;
    signer_type: 'party_a' | 'party_b';
    order?: number;
  }>, userId: string): Promise<any> {
    const contractCollection = this.db.getCollection(COLLECTIONS.CONTRACTS);
    const signatureCollection = this.db.getCollection(COLLECTIONS.SIGNATURES);

    const contract = await contractCollection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    if (contract.status !== ContractStatus.PENDING_SIGNATURE) {
      throw new Error('Le contrat doit être en attente de signature');
    }

    // Créer les demandes de signature
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULTS.SIGNATURE_EXPIRY_DAYS);

    for (const signatory of signatories) {
      const token = randomUUID();

      await signatureCollection.repository.create({
        values: {
          contract_id: contractId,
          signer_id: signatory.user_id,
          signer_type: signatory.signer_type,
          type: SignatureType.ELECTRONIC,
          status: SignatureStatus.SENT,
          email: signatory.email,
          order: signatory.order || 1,
          requested_at: new Date(),
          sent_at: new Date(),
          expires_at: expiresAt,
          token
        }
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(CONTRACT_EVENTS.SIGNATURE_REQUESTED, {
          contract,
          signatory,
          token
        });
      }
    }

    return contract;
  }

  /**
   * Enregistrer une signature
   */
  async recordSignature(
    token: string,
    signatureData: string,
    ipAddress: string,
    userAgent: string
  ): Promise<any> {
    const signatureCollection = this.db.getCollection(COLLECTIONS.SIGNATURES);
    const contractCollection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const signature = await signatureCollection.repository.findOne({
      filter: { token }
    });

    if (!signature) {
      throw new Error('Signature non trouvée');
    }

    if (signature.status === SignatureStatus.SIGNED) {
      throw new Error('Ce document a déjà été signé');
    }

    if (signature.status === SignatureStatus.EXPIRED) {
      throw new Error('La demande de signature a expiré');
    }

    // Enregistrer la signature
    await signatureCollection.repository.update({
      filter: { id: signature.id },
      values: {
        status: SignatureStatus.SIGNED,
        signed_at: new Date(),
        signature_data: signatureData,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });

    // Vérifier si toutes les signatures sont complètes
    const allSignatures = await signatureCollection.repository.find({
      filter: { contract_id: signature.contract_id }
    });

    if (areAllSignaturesComplete(allSignatures)) {
      // Activer le contrat
      await contractCollection.repository.update({
        filter: { id: signature.contract_id },
        values: {
          status: ContractStatus.ACTIVE,
          signed_date: new Date()
        }
      });

      const contract = await contractCollection.repository.findOne({
        filter: { id: signature.contract_id }
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_SIGNED, { contract });
        this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_ACTIVATED, { contract });
      }
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.SIGNATURE_COMPLETED, {
        signature,
        contractId: signature.contract_id
      });
    }

    return signature;
  }

  /**
   * Refuser de signer
   */
  async declineSignature(token: string, reason: string): Promise<any> {
    const signatureCollection = this.db.getCollection(COLLECTIONS.SIGNATURES);

    const signature = await signatureCollection.repository.findOne({
      filter: { token }
    });

    if (!signature) {
      throw new Error('Signature non trouvée');
    }

    await signatureCollection.repository.update({
      filter: { id: signature.id },
      values: {
        status: SignatureStatus.DECLINED,
        declined_at: new Date(),
        decline_reason: reason
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.SIGNATURE_DECLINED, {
        signature,
        reason
      });
    }

    return signature;
  }

  /**
   * Suspendre un contrat
   */
  async suspendContract(contractId: string, userId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const contract = await collection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    this.validateStatusTransition(contract.status, ContractStatus.SUSPENDED);

    const updated = await collection.repository.update({
      filter: { id: contractId },
      values: {
        status: ContractStatus.SUSPENDED,
        internal_notes: `Suspendu: ${reason}\n${contract.internal_notes || ''}`
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_SUSPENDED, {
        contract: updated[0],
        reason,
        userId
      });
    }

    return updated[0];
  }

  /**
   * Résilier un contrat
   */
  async terminateContract(contractId: string, userId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const contract = await collection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    this.validateStatusTransition(contract.status, ContractStatus.TERMINATED);

    const updated = await collection.repository.update({
      filter: { id: contractId },
      values: {
        status: ContractStatus.TERMINATED,
        termination_date: new Date(),
        internal_notes: `Résilié: ${reason}\n${contract.internal_notes || ''}`
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_TERMINATED, {
        contract: updated[0],
        reason,
        userId
      });
    }

    return updated[0];
  }

  /**
   * Marquer les contrats expirés
   */
  async markExpiredContracts(): Promise<number> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredContracts = await collection.repository.find({
      filter: {
        status: ContractStatus.ACTIVE,
        expiry_date: { $lt: today }
      }
    });

    let count = 0;
    for (const contract of expiredContracts) {
      await collection.repository.update({
        filter: { id: contract.id },
        values: { status: ContractStatus.EXPIRED }
      });

      if (this.eventEmitter) {
        this.eventEmitter.emit(CONTRACT_EVENTS.CONTRACT_EXPIRED, { contract });
      }

      count++;
    }

    return count;
  }

  /**
   * Générer le contenu à partir d'un template
   */
  async generateFromTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<string> {
    const template = await this.db.getCollection(COLLECTIONS.CONTRACT_TEMPLATES)
      .repository.findOne({ filter: { id: templateId } });

    if (!template) {
      throw new Error('Modèle non trouvé');
    }

    let content = template.content;

    // Remplacer les variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    return content;
  }

  /**
   * Obtenir les statistiques des contrats
   */
  async getContractStats(organizationId?: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const filter: any = {};
    if (organizationId) {
      filter.$or = [
        { party_a_organization_id: organizationId },
        { party_b_organization_id: organizationId }
      ];
    }

    const contracts = await collection.repository.find({ filter });

    const stats: any = {
      total: contracts.length,
      by_status: {},
      by_type: {},
      active: 0,
      pending_signature: 0,
      expiring_soon: 0,
      expired: 0,
      total_value: 0
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    for (const contract of contracts) {
      // Par statut
      stats.by_status[contract.status] = (stats.by_status[contract.status] || 0) + 1;

      // Par type
      stats.by_type[contract.type] = (stats.by_type[contract.type] || 0) + 1;

      // Compteurs spécifiques
      if (contract.status === ContractStatus.ACTIVE) {
        stats.active++;
        stats.total_value += contract.total_value || 0;

        // Vérifier si expire bientôt
        if (contract.expiry_date && new Date(contract.expiry_date) <= thirtyDaysFromNow) {
          stats.expiring_soon++;
        }
      } else if (contract.status === ContractStatus.PENDING_SIGNATURE) {
        stats.pending_signature++;
      } else if (contract.status === ContractStatus.EXPIRED) {
        stats.expired++;
      }
    }

    return stats;
  }

  /**
   * Mettre à jour le statut d'un contrat
   */
  private async updateContractStatus(
    contractId: string,
    newStatus: ContractStatus,
    userId: string,
    event?: string
  ): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.CONTRACTS);

    const contract = await collection.repository.findOne({
      filter: { id: contractId }
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    this.validateStatusTransition(contract.status, newStatus);

    const updated = await collection.repository.update({
      filter: { id: contractId },
      values: { status: newStatus }
    });

    if (this.eventEmitter && event) {
      this.eventEmitter.emit(event, { contract: updated[0], userId });
    }

    return updated[0];
  }

  /**
   * Valider une transition de statut
   */
  private validateStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): void {
    const allowedTransitions = CONTRACT_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`);
    }
  }
}
