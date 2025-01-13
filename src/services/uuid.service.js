import { version as uuidVersion, validate as uuidValidate } from 'uuid';

/**
 * Validates if a given UUID is a valid version 4 UUID.
 * @param {string} uuid
 * @returns {boolean}
 */
export function uuidValidateV4(uuid) {
  if (!uuidValidate(uuid)) {
    return false;
  }

  return uuidVersion(uuid) === 4;
}
