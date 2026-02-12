import * as core from "@actions/core";
import os from "os";
import * as constants from "./constants";

/**
 * The allowed platforms
 * */
enum Architecture {
  X64 = "x64",
  ARM64 = "arm64",
  JAVA = "java",
}

/**
 * The allowed editions
 * */
enum Edition {
  COMMUNITY = "community",
  TEAMS = "teams",
  ENTERPRISE = "enterprise",
}

/**
 * The allowed platforms
 * */
enum Platform {
  WINDOWS = "windows",
  MACOSX = "macosx",
  LINUX = "linux",
  LINUX_ALPINE = "linux-alpine",
}

/**
 * Represents the strongly-typed user-provided
 * inputs for the action.
 */
type Inputs = {
  versionSpec: string;
  edition: string;
  architecture: string;
  platform: string;
  email: string | undefined;
  token: string | undefined;
  agreeToEula: boolean;
};

/**
 * Get the user-provided inputs for the action.
 * @returns The user-provided inputs
 */
const getInputs = (): Inputs => {
  // Get the user-provided input containing the version specification
  const versionSpec = core.getInput(constants.INPUT_PRODUCT_VERSION, {
    required: true,
  });

  // Get the user-provided input containing the edition (community, teams, enterprise)
  const edition = getRequiredEnum(constants.INPUT_EDITION, Edition);

  // Get the user-provided input containing the architecture (arm64, x64, java)
  const architecture = getInputWithDefault(constants.INPUT_PRODUCT_ARCH, Architecture, getArch);

  // Get the user-provided input containing the platform (windows, macosx, linux)
  const platform = getInputWithDefault(constants.INPUT_PRODUCT_PLATFORM, Platform, getPlatform);

  // Don't output during tests
  if (import.meta.env.MODE !== "test") {
    core.debug(`Inputs: version: ${versionSpec}, architecture: ${architecture}, platform: ${platform}`);
  }

  const rawEmail = core.getInput(constants.INPUT_EMAIL);
  const email = rawEmail?.trim() ? rawEmail.trim() : undefined;

  const rawToken = core.getInput(constants.INPUT_TOKEN);
  const token = rawToken?.trim() ? rawToken.trim() : undefined;

  const rawEula = core.getInput(constants.INPUT_EULA, { required: true });
  const agreeToEula = rawEula.trim().toLowerCase() === "true";

  if (!isAllowedPlatformAndArch(platform, architecture)) {
    throw Error(`Unsupported platform: ${platform}-${architecture}`);
  }

  return {
    versionSpec,
    edition,
    architecture,
    platform,
    email,
    token,
    agreeToEula,
  };
};

/**
 * Reads the named required input and validates it against an enum.
 * @param input name of the input to read
 * @param type the enum type of the input
 * @returns the validated input value
 */
const getRequiredEnum = <TEnum>(input: string, type: TEnum): string => {
  const raw = core.getInput(input, { required: true });

  const value = type[raw.toUpperCase() as keyof typeof type];
  if (!value) {
    const allowed = Object.values(type as Record<string, string>).join(", ");
    throw Error(`Invalid value '${raw}' for input '${input}'. Allowed values: ${allowed}`);
  }

  return value as string;
};

/**
 * Reads the named input and returns its configured value,
 * using the provided resolver if the input is not set.
 * @param input name of the input to read
 * @param type the enum type of the input
 * @param resolve function that returns a string if the input is not set
 * @returns the resolved input value
 */
const getInputWithDefault = <TEnum>(input: string, type: TEnum, resolve: () => string): string => {
  const raw = core.getInput(input);
  if (raw == null || raw.trim().length === 0) {
    return resolve();
  }

  const value = type[raw.toUpperCase() as keyof typeof type];
  if (!value) {
    throw Error(`Unrecognized input value: ${raw}`);
  }

  return value as string;
};

/**
 * Gets the current OS platform (Windows, MacOS, Linux)
 * @returns the current OS platform
 */
const getPlatform = (): string => {
  const platform = process.platform;
  switch (platform) {
    case "darwin":
      return "macosx";
    case "win32":
      return "windows";
    case "linux":
      // TODO: Detect Alpine
      return "linux";
    default:
      throw Error(`Unsupported platform: ${platform}`);
  }
};

/**
 * Gets the current OS architecture
 * @returns the architecture
 */
const getArch = (): string => {
  const arch = os.arch();
  switch (arch) {
    case "x64":
      return "x64";
    case "ia32":
      return "x64";
    case "arm64":
      return "arm64";
    default:
      throw Error(`Unsupported architecture: ${arch}`);
  }
};

/**
 * Ensures the platform and architecture combination is supported
 * @param platform the OS platform name
 * @param arch the OS architecture name
 * @returns true if the platform and architecture are supported
 */
const isAllowedPlatformAndArch = (platform: string, arch: string): boolean => {
  const signature = `${platform}-${arch}`;
  return (
    arch == Architecture.JAVA ||
    ["windows-x64", "linux-x64", "macosx-arm64", "macosx-x64", "linux-alpine-x64"].includes(signature)
  );
};

export { Architecture, Edition, Platform, type Inputs, getInputs, getPlatform, getArch, isAllowedPlatformAndArch };
