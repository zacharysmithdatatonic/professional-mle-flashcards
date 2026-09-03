import packageJson from '../../package.json';

/**
 * package.json is the single source of truth for the release number. The value
 * is inlined at build time, and CI publishes a GitHub release with the matching
 * `v` tag, so what the page shows always names a real release.
 */
export const APP_VERSION = packageJson.version;

export const RELEASE_TAG = `v${APP_VERSION}`;

export const RELEASE_URL = `https://github.com/zacharysmithdatatonic/google-cloud-certification-flashcards/releases/tag/${RELEASE_TAG}`;
