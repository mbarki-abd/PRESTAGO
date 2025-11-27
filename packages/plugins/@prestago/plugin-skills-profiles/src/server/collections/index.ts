// =============================================================================
// PRESTAGO - Plugin Skills & Profiles - Collections Index
// =============================================================================

import { skillsCollection } from './skills';
import { consultantProfilesCollection } from './consultant-profiles';
import { profileSkillsCollection } from './profile-skills';
import { experiencesCollection } from './experiences';
import { educationsCollection } from './educations';
import { certificationsCollection } from './certifications';
import { languagesCollection } from './languages';
import { profileDocumentsCollection } from './profile-documents';

/**
 * All collections for the Skills & Profiles plugin
 */
export const collections = [
  skillsCollection,
  consultantProfilesCollection,
  profileSkillsCollection,
  experiencesCollection,
  educationsCollection,
  certificationsCollection,
  languagesCollection,
  profileDocumentsCollection,
];

export {
  skillsCollection,
  consultantProfilesCollection,
  profileSkillsCollection,
  experiencesCollection,
  educationsCollection,
  certificationsCollection,
  languagesCollection,
  profileDocumentsCollection,
};

export default collections;
