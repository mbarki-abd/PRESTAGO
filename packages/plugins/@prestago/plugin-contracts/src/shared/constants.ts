// =============================================================================
// PRESTAGO - Plugin Contracts - Constantes
// =============================================================================

import {
  ContractType,
  ContractStatus,
  SignatureStatus,
  ComplianceDocType,
  ComplianceDocStatus,
  ClauseType,
  RiskLevel
} from './types';

/**
 * Noms des collections
 */
export const COLLECTIONS = {
  CONTRACTS: 'prestago_contracts',
  SIGNATURES: 'prestago_contract_signatures',
  COMPLIANCE_DOCUMENTS: 'prestago_compliance_documents',
  CONTRACT_TEMPLATES: 'prestago_contract_templates',
  CLAUSES: 'prestago_contract_clauses',
  CONTRACT_HISTORY: 'prestago_contract_history'
};

/**
 * Transitions de statut autorisées pour les contrats
 */
export const CONTRACT_STATUS_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.DRAFT]: [
    ContractStatus.PENDING_REVIEW,
    ContractStatus.CANCELLED
  ],
  [ContractStatus.PENDING_REVIEW]: [
    ContractStatus.PENDING_APPROVAL,
    ContractStatus.DRAFT,
    ContractStatus.CANCELLED
  ],
  [ContractStatus.PENDING_APPROVAL]: [
    ContractStatus.PENDING_SIGNATURE,
    ContractStatus.PENDING_REVIEW,
    ContractStatus.CANCELLED
  ],
  [ContractStatus.PENDING_SIGNATURE]: [
    ContractStatus.ACTIVE,
    ContractStatus.PENDING_APPROVAL,
    ContractStatus.CANCELLED
  ],
  [ContractStatus.ACTIVE]: [
    ContractStatus.SUSPENDED,
    ContractStatus.EXPIRED,
    ContractStatus.TERMINATED
  ],
  [ContractStatus.SUSPENDED]: [
    ContractStatus.ACTIVE,
    ContractStatus.TERMINATED
  ],
  [ContractStatus.EXPIRED]: [], // État final
  [ContractStatus.TERMINATED]: [], // État final
  [ContractStatus.CANCELLED]: [] // État final
};

/**
 * Transitions de statut pour les signatures
 */
export const SIGNATURE_STATUS_TRANSITIONS: Record<SignatureStatus, SignatureStatus[]> = {
  [SignatureStatus.PENDING]: [SignatureStatus.SENT],
  [SignatureStatus.SENT]: [SignatureStatus.VIEWED, SignatureStatus.EXPIRED],
  [SignatureStatus.VIEWED]: [SignatureStatus.SIGNED, SignatureStatus.DECLINED, SignatureStatus.EXPIRED],
  [SignatureStatus.SIGNED]: [],
  [SignatureStatus.DECLINED]: [],
  [SignatureStatus.EXPIRED]: [SignatureStatus.PENDING] // Peut être renvoyé
};

/**
 * Documents requis par type d'entité
 */
export const REQUIRED_COMPLIANCE_DOCS = {
  organization: {
    [ContractType.SERVICE_AGREEMENT]: [
      ComplianceDocType.KBIS,
      ComplianceDocType.URSSAF,
      ComplianceDocType.INSURANCE_RC
    ],
    [ContractType.FRAMEWORK_AGREEMENT]: [
      ComplianceDocType.KBIS,
      ComplianceDocType.URSSAF,
      ComplianceDocType.FISCAL,
      ComplianceDocType.INSURANCE_RC
    ],
    [ContractType.FREELANCE]: [
      ComplianceDocType.INSEE,
      ComplianceDocType.URSSAF,
      ComplianceDocType.INSURANCE_RC
    ]
  },
  consultant: {
    base: [
      ComplianceDocType.ID_CARD,
      ComplianceDocType.CV
    ],
    mission: [
      ComplianceDocType.DIPLOMA,
      ComplianceDocType.CERTIFICATION
    ]
  }
};

/**
 * Délais d'alerte pour les documents (en jours)
 */
export const COMPLIANCE_ALERT_DAYS = {
  EXPIRING_SOON: 30,       // Alerte 30 jours avant expiration
  CRITICAL: 7,              // Alerte critique 7 jours avant
  URGENT: 3                 // Alerte urgente 3 jours avant
};

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  CURRENCY: 'EUR',
  SIGNATURE_EXPIRY_DAYS: 30,
  CONTRACT_VERSION: 1
};

/**
 * Durées de validité par défaut des documents (en mois)
 */
export const DOC_VALIDITY_MONTHS: Record<ComplianceDocType, number | null> = {
  [ComplianceDocType.KBIS]: 3,
  [ComplianceDocType.INSEE]: null,           // Pas d'expiration
  [ComplianceDocType.URSSAF]: 6,
  [ComplianceDocType.FISCAL]: 12,
  [ComplianceDocType.INSURANCE_RC]: 12,
  [ComplianceDocType.INSURANCE_DECENNALE]: 12,
  [ComplianceDocType.ID_CARD]: 120,          // 10 ans
  [ComplianceDocType.PASSPORT]: 120,         // 10 ans
  [ComplianceDocType.WORK_PERMIT]: null,     // Variable
  [ComplianceDocType.DIPLOMA]: null,         // Pas d'expiration
  [ComplianceDocType.CERTIFICATION]: 36,     // 3 ans (variable selon certif)
  [ComplianceDocType.CV]: null,              // Pas d'expiration
  [ComplianceDocType.BANK_DETAILS]: null,    // Pas d'expiration
  [ComplianceDocType.PROOF_OF_ADDRESS]: 3,
  [ComplianceDocType.OTHER]: null
};

/**
 * Couleurs de statut pour l'UI
 */
export const STATUS_COLORS = {
  contract: {
    [ContractStatus.DRAFT]: 'default',
    [ContractStatus.PENDING_REVIEW]: 'processing',
    [ContractStatus.PENDING_APPROVAL]: 'warning',
    [ContractStatus.PENDING_SIGNATURE]: 'warning',
    [ContractStatus.ACTIVE]: 'success',
    [ContractStatus.SUSPENDED]: 'error',
    [ContractStatus.EXPIRED]: 'default',
    [ContractStatus.TERMINATED]: 'error',
    [ContractStatus.CANCELLED]: 'default'
  },
  signature: {
    [SignatureStatus.PENDING]: 'default',
    [SignatureStatus.SENT]: 'processing',
    [SignatureStatus.VIEWED]: 'warning',
    [SignatureStatus.SIGNED]: 'success',
    [SignatureStatus.DECLINED]: 'error',
    [SignatureStatus.EXPIRED]: 'default'
  },
  compliance: {
    [ComplianceDocStatus.PENDING]: 'warning',
    [ComplianceDocStatus.VALID]: 'success',
    [ComplianceDocStatus.EXPIRED]: 'error',
    [ComplianceDocStatus.REJECTED]: 'error',
    [ComplianceDocStatus.EXPIRING_SOON]: 'warning'
  },
  risk: {
    [RiskLevel.LOW]: 'success',
    [RiskLevel.MEDIUM]: 'warning',
    [RiskLevel.HIGH]: 'error',
    [RiskLevel.CRITICAL]: 'error'
  }
};

/**
 * Génération de référence de contrat
 */
export function generateContractReference(
  type: ContractType,
  year: number,
  sequence: number,
  isAmendment: boolean = false
): string {
  const typeCode = getContractTypeCode(type);
  const seq = sequence.toString().padStart(4, '0');

  if (isAmendment) {
    return `${typeCode}-${year}-${seq}-AV`;
  }

  return `${typeCode}-${year}-${seq}`;
}

/**
 * Code court pour chaque type de contrat
 */
function getContractTypeCode(type: ContractType): string {
  const codes: Record<ContractType, string> = {
    [ContractType.SERVICE_AGREEMENT]: 'PST',
    [ContractType.FRAMEWORK_AGREEMENT]: 'CCF',
    [ContractType.AMENDMENT]: 'AVN',
    [ContractType.CDI]: 'CDI',
    [ContractType.CDD]: 'CDD',
    [ContractType.FREELANCE]: 'FRL',
    [ContractType.PORTAGE]: 'PTG',
    [ContractType.NDA]: 'NDA',
    [ContractType.PARTNERSHIP]: 'PAR',
    [ContractType.SUBCONTRACTING]: 'SST'
  };
  return codes[type] || 'CTR';
}

/**
 * Vérifier si un document est bientôt expiré
 */
export function isDocumentExpiringSoon(
  expiryDate: Date | null | undefined,
  alertDays: number = COMPLIANCE_ALERT_DAYS.EXPIRING_SOON
): boolean {
  if (!expiryDate) return false;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= alertDays;
}

/**
 * Vérifier si un document est expiré
 */
export function isDocumentExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return false;

  const now = new Date();
  const expiry = new Date(expiryDate);
  return now > expiry;
}

/**
 * Calculer la date d'expiration suggérée pour un type de document
 */
export function calculateSuggestedExpiryDate(
  docType: ComplianceDocType,
  issueDate?: Date
): Date | null {
  const validityMonths = DOC_VALIDITY_MONTHS[docType];
  if (validityMonths === null) return null;

  const start = issueDate ? new Date(issueDate) : new Date();
  start.setMonth(start.getMonth() + validityMonths);
  return start;
}

/**
 * Vérifier si toutes les signatures sont complètes
 */
export function areAllSignaturesComplete(signatures: Array<{ status: SignatureStatus }>): boolean {
  return signatures.length > 0 && signatures.every(s => s.status === SignatureStatus.SIGNED);
}

/**
 * Vérifier la conformité d'une organisation
 */
export function checkOrganizationCompliance(
  documents: Array<{ type: ComplianceDocType; status: ComplianceDocStatus }>,
  requiredTypes: ComplianceDocType[]
): {
  isCompliant: boolean;
  missingDocs: ComplianceDocType[];
  expiredDocs: ComplianceDocType[];
} {
  const validDocs = documents
    .filter(d => d.status === ComplianceDocStatus.VALID)
    .map(d => d.type);

  const missingDocs = requiredTypes.filter(type => !validDocs.includes(type));
  const expiredDocs = documents
    .filter(d => d.status === ComplianceDocStatus.EXPIRED)
    .map(d => d.type);

  return {
    isCompliant: missingDocs.length === 0 && expiredDocs.length === 0,
    missingDocs,
    expiredDocs
  };
}

/**
 * Variables de template standards
 */
export const TEMPLATE_VARIABLES = {
  // Parties
  PARTY_A_NAME: '{{party_a_name}}',
  PARTY_A_ADDRESS: '{{party_a_address}}',
  PARTY_A_SIRET: '{{party_a_siret}}',
  PARTY_A_SIGNATORY: '{{party_a_signatory}}',
  PARTY_B_NAME: '{{party_b_name}}',
  PARTY_B_ADDRESS: '{{party_b_address}}',
  PARTY_B_SIRET: '{{party_b_siret}}',
  PARTY_B_SIGNATORY: '{{party_b_signatory}}',

  // Mission
  MISSION_TITLE: '{{mission_title}}',
  MISSION_DESCRIPTION: '{{mission_description}}',
  MISSION_START_DATE: '{{mission_start_date}}',
  MISSION_END_DATE: '{{mission_end_date}}',
  MISSION_LOCATION: '{{mission_location}}',

  // Consultant
  CONSULTANT_NAME: '{{consultant_name}}',
  CONSULTANT_TITLE: '{{consultant_title}}',

  // Financier
  DAILY_RATE: '{{daily_rate}}',
  TOTAL_VALUE: '{{total_value}}',
  CURRENCY: '{{currency}}',
  PAYMENT_TERMS: '{{payment_terms}}',

  // Dates
  EFFECTIVE_DATE: '{{effective_date}}',
  EXPIRY_DATE: '{{expiry_date}}',
  SIGNATURE_DATE: '{{signature_date}}',
  CURRENT_DATE: '{{current_date}}'
};
