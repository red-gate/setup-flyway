/** Action input - version spec */
export const INPUT_PRODUCT_VERSION = 'version';
/** Action input - architecture */
export const INPUT_PRODUCT_ARCH = 'architecture';
/** Action input - platform */
export const INPUT_PRODUCT_PLATFORM = 'platform';
/** Action input - email for auth */
export const INPUT_EMAIL = 'email';
/** Action input - token for auth */
export const INPUT_TOKEN = 'token';
/** Action input - EULA agreement for auth */
export const INPUT_EULA = 'i-agree-to-the-eula';

/** Action output - resolved version */
export const OUTPUT_VERSION = 'version';
/** Action output - path containing the executable */
export const OUTPUT_PATH = 'path';

/** The tool name */
export const TOOLNAME = 'flyway';
/** User agent to use for the HTTP downloads */
export const USER_AGENT = 'setup-flyway-action';

/** Base URL for downloading Flyway */
export const BASE_URL =
  'https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline';
/** URL for the metadata file containing the available versions */
export const METADATA_URL = `${BASE_URL}/maven-metadata.xml`;
