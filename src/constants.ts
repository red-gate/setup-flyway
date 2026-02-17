const INPUT_PRODUCT_VERSION = "version";
const INPUT_EDITION = "edition";
const INPUT_PRODUCT_ARCH = "architecture";
const INPUT_PRODUCT_PLATFORM = "platform";
const INPUT_EMAIL = "email";
const INPUT_TOKEN = "token";
const INPUT_EULA = "i-agree-to-the-eula";

const OUTPUT_VERSION = "version";
const OUTPUT_PATH = "path";

const TOOL_NAME = "flyway";
const USER_AGENT = "setup-flyway-action";
const CACHE_KEY_PREFIX = "setup-flyway";

const BASE_URL = "https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline";
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
  CACHE_KEY_PREFIX,
};
