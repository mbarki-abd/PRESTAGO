// =============================================================================
// PRESTAGO - Plugin Users - Collections Index
// =============================================================================

export { usersCollection } from './users';
export { organizationsCollection } from './organizations';
export { userOrganizationsCollection } from './user-organizations';

import { usersCollection } from './users';
import { organizationsCollection } from './organizations';
import { userOrganizationsCollection } from './user-organizations';

/**
 * All collections for the users plugin
 */
export const collections = [
  usersCollection,
  organizationsCollection,
  userOrganizationsCollection,
];

export default collections;
