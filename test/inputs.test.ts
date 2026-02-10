import { getInputs, isAllowedPlatformAndArch, Platform, Architecture } from "../src/inputs";

describe("Inputs", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env = OLD_ENV;
  });

  it("returns current platform if not set", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    const inputs = getInputs();
    expect(inputs.platform).toBeTruthy();
  });

  it("returns current architecture if not set", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_PLATFORM = Platform.MACOSX;
    const inputs = getInputs();
    expect(inputs.architecture).toBeTruthy();
  });

  it("returns an error if the version is not specified", async () => {
    import("../src/inputs").catch((error) => {
      expect(error?.message).toBe("Input required and not supplied: version");
    });
  });

  it("returns undefined email, token and undefined IAgreeToTheEula when not provided", async () => {
    process.env.INPUT_VERSION = "1.2.3";
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    process.env.INPUT_PLATFORM = Platform.LINUX;
    const inputs = getInputs();
    expect(inputs.email).toBeUndefined();
    expect(inputs.token).toBeUndefined();
    expect(inputs.agreeToEula).toBeUndefined();
  });

  it("reads email, token, and IAgreeToTheEula when provided", async () => {
    process.env.INPUT_VERSION = "1.2.3";
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

  test.each([
    ["windows", "x64", true],
    ["windows", "arm64", false],
    ["macosx", "x64", true],
    ["macosx", "arm64", true],
    ["linux", "x64", true],
    ["linux", "arm64", false],
  ])("allows the platform %p-%p: %p", async (platform, arch, expected) => {
    const result = isAllowedPlatformAndArch(platform, arch);
    expect(result).toBe(expected);
  });
});
