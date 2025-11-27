// =============================================================================
// PRESTAGO - Plugin Contracts - Service: Gestion de la Conformité
// =============================================================================

import { Database } from '@nocobase/database';
import {
  COLLECTIONS,
  COMPLIANCE_ALERT_DAYS,
  DOC_VALIDITY_MONTHS,
  REQUIRED_COMPLIANCE_DOCS,
  isDocumentExpired,
  isDocumentExpiringSoon,
  calculateSuggestedExpiryDate,
  checkOrganizationCompliance
} from '../../shared/constants';
import {
  ComplianceDocType,
  ComplianceDocStatus,
  ContractType,
  CONTRACT_EVENTS
} from '../../shared/types';

export class ComplianceService {
  private db: Database;
  private eventEmitter: any;

  constructor(db: Database, eventEmitter?: any) {
    this.db = db;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Télécharger un document de conformité
   */
  async uploadDocument(data: {
    type: ComplianceDocType;
    name: string;
    description?: string;
    organization_id?: string;
    user_id?: string;
    document_url: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    issue_date?: Date;
    expiry_date?: Date;
    reference_number?: string;
    issuing_authority?: string;
  }, uploadedByUserId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    // Calculer la date d'expiration suggérée si non fournie
    let expiryDate = data.expiry_date;
    if (!expiryDate && data.issue_date) {
      expiryDate = calculateSuggestedExpiryDate(data.type, data.issue_date);
    }

    const document = await collection.repository.create({
      values: {
        type: data.type,
        status: ComplianceDocStatus.PENDING,
        name: data.name,
        description: data.description,
        organization_id: data.organization_id,
        user_id: data.user_id,
        document_url: data.document_url,
        file_name: data.file_name,
        file_size: data.file_size,
        mime_type: data.mime_type,
        issue_date: data.issue_date,
        expiry_date: expiryDate,
        reference_number: data.reference_number,
        issuing_authority: data.issuing_authority,
        uploaded_by_id: uploadedByUserId
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.COMPLIANCE_DOC_UPLOADED, {
        document,
        userId: uploadedByUserId
      });
    }

    return document;
  }

  /**
   * Valider un document
   */
  async validateDocument(documentId: string, userId: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const document = await collection.repository.findOne({
      filter: { id: documentId }
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    // Vérifier si le document n'est pas expiré
    if (isDocumentExpired(document.expiry_date)) {
      throw new Error('Impossible de valider un document expiré');
    }

    const status = isDocumentExpiringSoon(document.expiry_date)
      ? ComplianceDocStatus.EXPIRING_SOON
      : ComplianceDocStatus.VALID;

    const updated = await collection.repository.update({
      filter: { id: documentId },
      values: {
        status,
        validated_by_id: userId,
        validated_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.COMPLIANCE_DOC_VALIDATED, {
        document: updated[0],
        userId
      });
    }

    return updated[0];
  }

  /**
   * Rejeter un document
   */
  async rejectDocument(documentId: string, userId: string, reason: string): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const document = await collection.repository.findOne({
      filter: { id: documentId }
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    const updated = await collection.repository.update({
      filter: { id: documentId },
      values: {
        status: ComplianceDocStatus.REJECTED,
        rejection_reason: reason,
        validated_by_id: userId,
        validated_at: new Date()
      }
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit(CONTRACT_EVENTS.COMPLIANCE_DOC_REJECTED, {
        document: updated[0],
        reason,
        userId
      });
    }

    return updated[0];
  }

  /**
   * Vérifier et mettre à jour les documents expirés ou bientôt expirés
   */
  async checkDocumentExpirations(): Promise<{
    expired: number;
    expiringSoon: number;
  }> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    // Récupérer tous les documents valides avec une date d'expiration
    const documents = await collection.repository.find({
      filter: {
        status: { $in: [ComplianceDocStatus.VALID, ComplianceDocStatus.EXPIRING_SOON] },
        expiry_date: { $ne: null }
      }
    });

    let expiredCount = 0;
    let expiringSoonCount = 0;

    for (const doc of documents) {
      if (isDocumentExpired(doc.expiry_date)) {
        // Marquer comme expiré
        await collection.repository.update({
          filter: { id: doc.id },
          values: { status: ComplianceDocStatus.EXPIRED }
        });

        if (this.eventEmitter) {
          this.eventEmitter.emit(CONTRACT_EVENTS.COMPLIANCE_DOC_EXPIRED, { document: doc });
        }

        expiredCount++;
      } else if (
        doc.status !== ComplianceDocStatus.EXPIRING_SOON &&
        isDocumentExpiringSoon(doc.expiry_date)
      ) {
        // Marquer comme expirant bientôt
        await collection.repository.update({
          filter: { id: doc.id },
          values: { status: ComplianceDocStatus.EXPIRING_SOON }
        });

        if (this.eventEmitter) {
          this.eventEmitter.emit(CONTRACT_EVENTS.COMPLIANCE_DOC_EXPIRING, { document: doc });
        }

        expiringSoonCount++;
      }
    }

    return { expired: expiredCount, expiringSoon: expiringSoonCount };
  }

  /**
   * Vérifier la conformité d'une organisation
   */
  async checkOrganizationCompliance(
    organizationId: string,
    contractType?: ContractType
  ): Promise<{
    isCompliant: boolean;
    score: number;
    missingDocs: ComplianceDocType[];
    expiredDocs: ComplianceDocType[];
    expiringSoonDocs: ComplianceDocType[];
    validDocs: ComplianceDocType[];
  }> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    // Récupérer tous les documents de l'organisation
    const documents = await collection.repository.find({
      filter: { organization_id: organizationId }
    });

    // Déterminer les documents requis
    let requiredTypes: ComplianceDocType[] = [];
    if (contractType && REQUIRED_COMPLIANCE_DOCS.organization[contractType]) {
      requiredTypes = REQUIRED_COMPLIANCE_DOCS.organization[contractType];
    } else {
      // Par défaut, utiliser les documents requis pour un contrat de prestation
      requiredTypes = REQUIRED_COMPLIANCE_DOCS.organization[ContractType.SERVICE_AGREEMENT] || [];
    }

    const validDocs: ComplianceDocType[] = [];
    const expiredDocs: ComplianceDocType[] = [];
    const expiringSoonDocs: ComplianceDocType[] = [];

    for (const doc of documents) {
      if (doc.status === ComplianceDocStatus.VALID) {
        validDocs.push(doc.type);
      } else if (doc.status === ComplianceDocStatus.EXPIRED) {
        expiredDocs.push(doc.type);
      } else if (doc.status === ComplianceDocStatus.EXPIRING_SOON) {
        expiringSoonDocs.push(doc.type);
        validDocs.push(doc.type); // Encore valide
      }
    }

    const missingDocs = requiredTypes.filter(type => !validDocs.includes(type));
    const isCompliant = missingDocs.length === 0 && expiredDocs.length === 0;

    // Calculer un score de conformité
    const totalRequired = requiredTypes.length;
    const validCount = requiredTypes.filter(type => validDocs.includes(type)).length;
    const score = totalRequired > 0 ? Math.round((validCount / totalRequired) * 100) : 100;

    return {
      isCompliant,
      score,
      missingDocs,
      expiredDocs,
      expiringSoonDocs,
      validDocs
    };
  }

  /**
   * Vérifier la conformité d'un consultant
   */
  async checkConsultantCompliance(
    userId: string,
    includeOptional: boolean = false
  ): Promise<{
    isCompliant: boolean;
    score: number;
    missingDocs: ComplianceDocType[];
    expiredDocs: ComplianceDocType[];
    validDocs: ComplianceDocType[];
  }> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const documents = await collection.repository.find({
      filter: { user_id: userId }
    });

    // Documents requis pour un consultant
    let requiredTypes = [...REQUIRED_COMPLIANCE_DOCS.consultant.base];
    if (includeOptional) {
      requiredTypes = [...requiredTypes, ...REQUIRED_COMPLIANCE_DOCS.consultant.mission];
    }

    const validDocs: ComplianceDocType[] = [];
    const expiredDocs: ComplianceDocType[] = [];

    for (const doc of documents) {
      if (doc.status === ComplianceDocStatus.VALID || doc.status === ComplianceDocStatus.EXPIRING_SOON) {
        validDocs.push(doc.type);
      } else if (doc.status === ComplianceDocStatus.EXPIRED) {
        expiredDocs.push(doc.type);
      }
    }

    const missingDocs = requiredTypes.filter(type => !validDocs.includes(type));
    const isCompliant = missingDocs.length === 0;

    const totalRequired = requiredTypes.length;
    const validCount = requiredTypes.filter(type => validDocs.includes(type)).length;
    const score = totalRequired > 0 ? Math.round((validCount / totalRequired) * 100) : 100;

    return {
      isCompliant,
      score,
      missingDocs,
      expiredDocs,
      validDocs
    };
  }

  /**
   * Obtenir les documents par entité
   */
  async getDocumentsByEntity(
    entityType: 'organization' | 'user',
    entityId: string
  ): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const filter: any = {};
    if (entityType === 'organization') {
      filter.organization_id = entityId;
    } else {
      filter.user_id = entityId;
    }

    return collection.repository.find({
      filter,
      sort: ['type', '-created_at']
    });
  }

  /**
   * Obtenir les documents qui expirent bientôt
   */
  async getExpiringDocuments(days: number = COMPLIANCE_ALERT_DAYS.EXPIRING_SOON): Promise<any[]> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return collection.repository.find({
      filter: {
        status: { $in: [ComplianceDocStatus.VALID, ComplianceDocStatus.EXPIRING_SOON] },
        expiry_date: {
          $gte: new Date(),
          $lte: futureDate
        }
      },
      appends: ['organization', 'user'],
      sort: ['expiry_date']
    });
  }

  /**
   * Obtenir les statistiques de conformité
   */
  async getComplianceStats(): Promise<any> {
    const collection = this.db.getCollection(COLLECTIONS.COMPLIANCE_DOCUMENTS);

    const documents = await collection.repository.find({});

    const stats: any = {
      total: documents.length,
      by_status: {},
      by_type: {},
      pending_validation: 0,
      expiring_soon: 0,
      expired: 0
    };

    for (const doc of documents) {
      // Par statut
      stats.by_status[doc.status] = (stats.by_status[doc.status] || 0) + 1;

      // Par type
      stats.by_type[doc.type] = (stats.by_type[doc.type] || 0) + 1;

      // Compteurs spécifiques
      if (doc.status === ComplianceDocStatus.PENDING) {
        stats.pending_validation++;
      } else if (doc.status === ComplianceDocStatus.EXPIRING_SOON) {
        stats.expiring_soon++;
      } else if (doc.status === ComplianceDocStatus.EXPIRED) {
        stats.expired++;
      }
    }

    return stats;
  }
}
