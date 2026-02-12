import {
  getInputs,
  getPlatform,
  getArch,
  isAllowedPlatformAndArch,
  Platform,
  Architecture,
  Edition,
} from "../src/inputs";
import os from "os";

describe("inputs", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns current platform if not set", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    const inputs = getInputs();
    expect(inputs.platform).toBeTruthy();
  });

  it("returns current architecture if not set", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_PLATFORM = Platform.MACOSX;
    const inputs = getInputs();
    expect(inputs.architecture).toBeTruthy();
  });

  it("returns an error if the version is not specified", async () => {
    import("../src/inputs").catch((error) => {
      expect(error?.message).toBe("Input required and not supplied: version");
    });
  });

  it("returns an error if the edition is not specified", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    expect(() => getInputs()).toThrow("Input required and not supplied: edition");
  });

  it("returns the edition when provided", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = "enterprise";
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    const inputs = getInputs();
    expect(inputs.edition).toBe("enterprise");
  });

  it("throws for unrecognized edition input", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = "pro";
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    expect(() => getInputs()).toThrow(
      "Invalid value 'pro' for input 'edition'. Allowed values: community, teams, enterprise",
    );
  });

  it("returns an error if i-agree-to-the-eula is not specified", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    expect(() => getInputs()).toThrow("Input required and not supplied: i-agree-to-the-eula");
  });

  it("returns false for agreeToEula when not set to true", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "false";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    const inputs = getInputs();
    expect(inputs.email).toBeUndefined();
    expect(inputs.token).toBeUndefined();
    expect(inputs.agreeToEula).toBe(false);
  });

  it("reads email, token, and IAgreeToTheEula when provided", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.TEAMS;
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    process.env.INPUT_EMAIL = "user@example.com";
    process.env.INPUT_TOKEN = "my-secret-token";
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    const inputs = getInputs();
    expect(inputs.email).toBe("user@example.com");
    expect(inputs.token).toBe("my-secret-token");
    expect(inputs.agreeToEula).toBe(true);
  });

  it("throws for unrecognized architecture input", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = "mips";
    process.env.INPUT_PLATFORM = Platform.LINUX;
    expect(() => getInputs()).toThrow("Unrecognized input value: mips");
  });

  it("throws for unrecognized platform input", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = "solaris";
    expect(() => getInputs()).toThrow("Unrecognized input value: solaris");
  });

  it("throws for unsupported platform and architecture combination", () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_EDITION = Edition.COMMUNITY;
    process.env["INPUT_I-AGREE-TO-THE-EULA"] = "true";
    process.env.INPUT_ARCHITECTURE = "arm64";
    process.env.INPUT_PLATFORM = "linux";
    expect(() => getInputs()).toThrow("Unsupported platform: linux-arm64");
  });

  test.each([
    ["windows", "x64", true],
    ["windows", "arm64", false],
    ["macosx", "x64", true],
    ["macosx", "arm64", true],
    ["linux", "x64", true],
    ["linux", "arm64", false],
    ["linux-alpine", "x64", true],
    ["linux-alpine", "arm64", false],
    ["linux", "java", true],
    ["windows", "java", true],
  ])("allows the platform %p-%p: %p", async (platform, arch, expected) => {
    const result = isAllowedPlatformAndArch(platform, arch);
    expect(result).toBe(expected);
  });
});

describe("getPlatform", () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  afterEach(() => {
    if (originalPlatform) {
      Object.defineProperty(process, "platform", originalPlatform);
    }
  });

  it("returns macosx for darwin", () => {
    Object.defineProperty(process, "platform", { value: "darwin", configurable: true });
    expect(getPlatform()).toBe("macosx");
  });

  it("returns windows for win32", () => {
    Object.defineProperty(process, "platform", { value: "win32", configurable: true });
    expect(getPlatform()).toBe("windows");
  });

  it("returns linux for linux", () => {
    Object.defineProperty(process, "platform", { value: "linux", configurable: true });
    expect(getPlatform()).toBe("linux");
  });

  it("throws for unsupported platform", () => {
    Object.defineProperty(process, "platform", { value: "freebsd", configurable: true });
    expect(() => getPlatform()).toThrow("Unsupported platform: freebsd");
  });
});

describe("getArch", () => {
  it("returns x64 for x64", () => {
    vi.spyOn(os, "arch").mockReturnValue("x64");
    expect(getArch()).toBe("x64");
  });

  it("returns x64 for ia32", () => {
    vi.spyOn(os, "arch").mockReturnValue("ia32");
    expect(getArch()).toBe("x64");
  });

  it("returns arm64 for arm64", () => {
    vi.spyOn(os, "arch").mockReturnValue("arm64");
    expect(getArch()).toBe("arm64");
  });

  it("throws for unsupported architecture", () => {
    vi.spyOn(os, "arch").mockReturnValue("s390x");
    expect(() => getArch()).toThrow("Unsupported architecture: s390x");
  });
});
