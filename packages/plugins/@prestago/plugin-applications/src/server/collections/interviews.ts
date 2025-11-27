// =============================================================================
// PRESTAGO - Plugin Applications - Collection: Interviews
// =============================================================================

import { CollectionOptions } from '@nocobase/database';
import { COLLECTIONS } from '../../shared/constants';

export default {
  name: COLLECTIONS.INTERVIEWS,
  title: 'Entretiens',
  fields: [
    {
      name: 'application_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Candidature ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'application',
      type: 'belongsTo',
      target: COLLECTIONS.APPLICATIONS,
      foreignKey: 'application_id',
      targetKey: 'id',
    },
    {
      name: 'rfp_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'RFP ID',
        'x-component': 'Input',
        required: true,
      },
    },
    {
      name: 'rfp',
      type: 'belongsTo',
      target: 'prestago_rfps',
      foreignKey: 'rfp_id',
      targetKey: 'id',
    },
    {
      name: 'type',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Type d\'entretien',
        'x-component': 'Select',
        enum: [
          { value: 'phone', label: 'Téléphonique' },
          { value: 'video', label: 'Visioconférence' },
          { value: 'onsite', label: 'Sur site' },
          { value: 'technical', label: 'Test technique' },
          { value: 'hr', label: 'RH' },
          { value: 'final', label: 'Final' },
        ],
        required: true,
      },
    },
    {
      name: 'status',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Statut',
        'x-component': 'Select',
        enum: [
          { value: 'scheduled', label: 'Planifié' },
          { value: 'confirmed', label: 'Confirmé' },
          { value: 'completed', label: 'Terminé' },
          { value: 'cancelled', label: 'Annulé' },
          { value: 'no_show', label: 'Absent' },
          { value: 'rescheduled', label: 'Reporté' },
        ],
      },
      defaultValue: 'scheduled',
    },
    {
      name: 'round',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Tour / Round',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1 },
      },
      defaultValue: 1,
    },

    // Scheduling
    {
      name: 'scheduled_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Date et heure',
        'x-component': 'DatePicker',
        'x-component-props': { showTime: true },
        required: true,
      },
    },
    {
      name: 'duration_minutes',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Durée (minutes)',
        'x-component': 'InputNumber',
        'x-component-props': { min: 15 },
      },
      defaultValue: 60,
    },
    {
      name: 'timezone',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Fuseau horaire',
        'x-component': 'Input',
      },
      defaultValue: 'Europe/Paris',
    },

    // Location/Link
    {
      name: 'location',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Lieu',
        'x-component': 'Input',
      },
    },
    {
      name: 'meeting_link',
      type: 'string',
      interface: 'url',
      uiSchema: {
        title: 'Lien de réunion',
        'x-component': 'Input.URL',
      },
    },
    {
      name: 'phone_number',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Numéro de téléphone',
        'x-component': 'Input',
      },
    },
    {
      name: 'meeting_password',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'Mot de passe réunion',
        'x-component': 'Input',
      },
    },

    // Participants
    {
      name: 'interviewer_ids',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Interviewers',
        'x-component': 'Select',
        'x-component-props': { mode: 'multiple' },
      },
    },
    {
      name: 'interviewer_names',
      type: 'json',
      interface: 'select',
      uiSchema: {
        title: 'Noms des interviewers',
        'x-component': 'Select',
        'x-component-props': { mode: 'tags' },
      },
    },

    // Results
    {
      name: 'feedback',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Feedback',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'rating',
      type: 'integer',
      interface: 'inputNumber',
      uiSchema: {
        title: 'Note',
        'x-component': 'InputNumber',
        'x-component-props': { min: 1, max: 5 },
      },
    },
    {
      name: 'recommendation',
      type: 'string',
      interface: 'select',
      uiSchema: {
        title: 'Recommandation',
        'x-component': 'Select',
        enum: [
          { value: 'hire', label: 'Recruter' },
          { value: 'consider', label: 'À considérer' },
          { value: 'reject', label: 'Rejeter' },
          { value: 'undecided', label: 'Indécis' },
        ],
      },
    },

    // Notes
    {
      name: 'internal_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes internes',
        'x-component': 'Input.TextArea',
      },
    },
    {
      name: 'candidate_notes',
      type: 'text',
      interface: 'textarea',
      uiSchema: {
        title: 'Notes du candidat',
        'x-component': 'Input.TextArea',
      },
    },

    // Calendar
    {
      name: 'calendar_event_id',
      type: 'string',
      interface: 'input',
      uiSchema: {
        title: 'ID événement calendrier',
        'x-component': 'Input',
      },
    },
    {
      name: 'reminder_sent',
      type: 'boolean',
      interface: 'checkbox',
      uiSchema: {
        title: 'Rappel envoyé',
        'x-component': 'Checkbox',
      },
      defaultValue: false,
    },

    {
      name: 'completed_at',
      type: 'date',
      interface: 'datePicker',
      uiSchema: {
        title: 'Terminé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },

    // Timestamps
    {
      name: 'created_at',
      type: 'date',
      interface: 'createdAt',
      uiSchema: {
        title: 'Créé le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
    {
      name: 'updated_at',
      type: 'date',
      interface: 'updatedAt',
      uiSchema: {
        title: 'Modifié le',
        'x-component': 'DatePicker',
        'x-read-pretty': true,
      },
    },
  ],
  indexes: [
    { fields: ['application_id'] },
    { fields: ['rfp_id'] },
    { fields: ['status'] },
    { fields: ['scheduled_at'] },
    { fields: ['type'] },
  ],
} as CollectionOptions;
