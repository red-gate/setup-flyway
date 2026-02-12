/** Action input - version spec */
const INPUT_PRODUCT_VERSION = "version";
/** Action input - edition */
const INPUT_EDITION = "edition";
/** Action input - architecture */
const INPUT_PRODUCT_ARCH = "architecture";
/** Action input - platform */
const INPUT_PRODUCT_PLATFORM = "platform";
/** Action input - email for auth */
const INPUT_EMAIL = "email";
/** Action input - token for auth */
const INPUT_TOKEN = "token";
/** Action input - EULA agreement for auth */
const INPUT_EULA = "i-agree-to-the-eula";

/** Action output - resolved version */
const OUTPUT_VERSION = "version";
/** Action output - path containing the executable */
const OUTPUT_PATH = "path";

/** The tool name */
const TOOL_NAME = "flyway";
/** User agent to use for the HTTP downloads */
const USER_AGENT = "setup-flyway-action";

/** Base URL for downloading Flyway */
const BASE_URL = "https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline";
/** URL for the metadata file containing the available versions */
const METADATA_URL = `${BASE_URL}/maven-metadata.xml`;

export {
  INPUT_PRODUCT_VERSION,
  INPUT_EDITION,
  INPUT_PRODUCT_ARCH,
  INPUT_PRODUCT_PLATFORM,
  INPUT_EMAIL,
  INPUT_TOKEN,
  INPUT_EULA,
  OUTPUT_VERSION,
  OUTPUT_PATH,
  TOOL_NAME,
  USER_AGENT,
  BASE_URL,
  METADATA_URL,
};
