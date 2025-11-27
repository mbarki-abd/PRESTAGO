// =============================================================================
// PRESTAGO - Plugin Contracts - Types et Interfaces
// =============================================================================

/**
 * Types de contrat
 */
export enum ContractType {
  // Contrats de mission
  SERVICE_AGREEMENT = 'service_agreement',      // Contrat de prestation
  FRAMEWORK_AGREEMENT = 'framework_agreement',  // Contrat cadre
  AMENDMENT = 'amendment',                       // Avenant

  // Contrats de travail
  CDI = 'cdi',                                   // CDI
  CDD = 'cdd',                                   // CDD
  FREELANCE = 'freelance',                       // Freelance / Auto-entrepreneur
  PORTAGE = 'portage',                           // Portage salarial

  // Autres
  NDA = 'nda',                                   // Accord de confidentialité
  PARTNERSHIP = 'partnership',                   // Partenariat
  SUBCONTRACTING = 'subcontracting'             // Sous-traitance
}

/**
 * Statut du contrat
 */
export enum ContractStatus {
  DRAFT = 'draft',                    // Brouillon
  PENDING_REVIEW = 'pending_review',  // En attente de révision
  PENDING_APPROVAL = 'pending_approval', // En attente d'approbation
  PENDING_SIGNATURE = 'pending_signature', // En attente de signature
  ACTIVE = 'active',                  // Actif
  SUSPENDED = 'suspended',            // Suspendu
  EXPIRED = 'expired',                // Expiré
  TERMINATED = 'terminated',          // Résilié
  CANCELLED = 'cancelled'             // Annulé
}

/**
 * Type de signature
 */
export enum SignatureType {
  ELECTRONIC = 'electronic',          // Signature électronique
  HANDWRITTEN = 'handwritten',        // Signature manuscrite
  DIGITAL_CERTIFICATE = 'digital_certificate' // Certificat numérique
}

/**
 * Statut de la signature
 */
export enum SignatureStatus {
  PENDING = 'pending',                // En attente
  SENT = 'sent',                      // Envoyé pour signature
  VIEWED = 'viewed',                  // Consulté
  SIGNED = 'signed',                  // Signé
  DECLINED = 'declined',              // Refusé
  EXPIRED = 'expired'                 // Expiré
}

/**
 * Type de document de conformité
 */
export enum ComplianceDocType {
  // Documents entreprise
  KBIS = 'kbis',                      // Extrait Kbis
  INSEE = 'insee',                    // Certificat INSEE
  URSSAF = 'urssaf',                  // Attestation URSSAF
  FISCAL = 'fiscal',                  // Attestation fiscale
  INSURANCE_RC = 'insurance_rc',      // Assurance RC Pro
  INSURANCE_DECENNALE = 'insurance_decennale', // Assurance décennale

  // Documents consultant
  ID_CARD = 'id_card',                // Carte d'identité
  PASSPORT = 'passport',              // Passeport
  WORK_PERMIT = 'work_permit',        // Permis de travail
  DIPLOMA = 'diploma',                // Diplôme
  CERTIFICATION = 'certification',    // Certification
  CV = 'cv',                          // CV

  // Autres
  BANK_DETAILS = 'bank_details',      // RIB
  PROOF_OF_ADDRESS = 'proof_of_address', // Justificatif de domicile
  OTHER = 'other'                     // Autre
}

/**
 * Statut du document de conformité
 */
export enum ComplianceDocStatus {
  PENDING = 'pending',                // En attente
  VALID = 'valid',                    // Valide
  EXPIRED = 'expired',                // Expiré
  REJECTED = 'rejected',              // Rejeté
  EXPIRING_SOON = 'expiring_soon'     // Bientôt expiré
}

/**
 * Type de clause
 */
export enum ClauseType {
  STANDARD = 'standard',              // Clause standard
  CONFIDENTIALITY = 'confidentiality', // Confidentialité
  NON_COMPETE = 'non_compete',        // Non-concurrence
  INTELLECTUAL_PROPERTY = 'intellectual_property', // Propriété intellectuelle
  LIABILITY = 'liability',            // Responsabilité
  TERMINATION = 'termination',        // Résiliation
  PAYMENT = 'payment',                // Paiement
  PENALTIES = 'penalties',            // Pénalités
  FORCE_MAJEURE = 'force_majeure',    // Force majeure
  DISPUTE = 'dispute',                // Règlement des litiges
  GDPR = 'gdpr',                      // RGPD
  CUSTOM = 'custom'                   // Personnalisée
}

/**
 * Niveau de risque
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Événements du système de contrats
 */
export const CONTRACT_EVENTS = {
  CONTRACT_CREATED: 'contract.created',
  CONTRACT_UPDATED: 'contract.updated',
  CONTRACT_SUBMITTED: 'contract.submitted',
  CONTRACT_APPROVED: 'contract.approved',
  CONTRACT_REJECTED: 'contract.rejected',
  CONTRACT_SENT_FOR_SIGNATURE: 'contract.sent_for_signature',
  CONTRACT_SIGNED: 'contract.signed',
  CONTRACT_ACTIVATED: 'contract.activated',
  CONTRACT_SUSPENDED: 'contract.suspended',
  CONTRACT_TERMINATED: 'contract.terminated',
  CONTRACT_EXPIRED: 'contract.expired',

  SIGNATURE_REQUESTED: 'signature.requested',
  SIGNATURE_COMPLETED: 'signature.completed',
  SIGNATURE_DECLINED: 'signature.declined',

  COMPLIANCE_DOC_UPLOADED: 'compliance.document.uploaded',
  COMPLIANCE_DOC_VALIDATED: 'compliance.document.validated',
  COMPLIANCE_DOC_REJECTED: 'compliance.document.rejected',
  COMPLIANCE_DOC_EXPIRING: 'compliance.document.expiring',
  COMPLIANCE_DOC_EXPIRED: 'compliance.document.expired',

  AMENDMENT_CREATED: 'amendment.created',
  AMENDMENT_ACTIVATED: 'amendment.activated'
};

/**
 * Interface pour un contrat
 */
export interface IContract {
  id: string;
  reference: string;
  type: ContractType;
  status: ContractStatus;
  title: string;
  description?: string;

  // Parties
  party_a_organization_id: string;  // Organisation A (généralement le client)
  party_b_organization_id: string;  // Organisation B (généralement le prestataire)
  party_a_signatory_id?: string;    // Signataire A
  party_b_signatory_id?: string;    // Signataire B

  // Lien avec mission
  mission_id?: string;
  parent_contract_id?: string;      // Pour les avenants

  // Dates
  effective_date?: Date;
  expiry_date?: Date;
  termination_date?: Date;
  signed_date?: Date;

  // Montants
  total_value?: number;
  currency: string;

  // Documents
  document_url?: string;
  signed_document_url?: string;

  // Métadonnées
  version: number;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour une signature
 */
export interface ISignature {
  id: string;
  contract_id: string;
  signer_id: string;
  signer_type: 'party_a' | 'party_b';
  type: SignatureType;
  status: SignatureStatus;

  email: string;
  requested_at: Date;
  viewed_at?: Date;
  signed_at?: Date;
  declined_at?: Date;
  decline_reason?: string;

  signature_url?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Interface pour un document de conformité
 */
export interface IComplianceDocument {
  id: string;
  organization_id?: string;
  user_id?: string;
  type: ComplianceDocType;
  status: ComplianceDocStatus;

  name: string;
  description?: string;
  document_url: string;

  issue_date?: Date;
  expiry_date?: Date;

  validated_by_id?: string;
  validated_at?: Date;
  rejection_reason?: string;

  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour un modèle de contrat
 */
export interface IContractTemplate {
  id: string;
  type: ContractType;
  name: string;
  description?: string;
  content: string;          // HTML ou Markdown
  variables: string[];      // Variables à remplacer {{variable}}
  clauses: string[];        // IDs des clauses incluses
  is_active: boolean;
  version: number;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface pour une clause
 */
export interface IClause {
  id: string;
  type: ClauseType;
  name: string;
  content: string;
  is_mandatory: boolean;
  risk_level: RiskLevel;
  applicable_contract_types: ContractType[];
  variables: string[];
  created_at: Date;
  updated_at: Date;
}
