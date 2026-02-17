import { CACHE_KEY_PREFIX, TOOL_NAME } from "../src/constants";

class ReserveCacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReserveCacheError";
  }
}

const restoreCache = vi.fn();
const saveCache = vi.fn();
const debug = vi.fn();

vi.doMock("@actions/cache", () => ({
  restoreCache,
  saveCache,
  ReserveCacheError,
}));

vi.doMock("@actions/core", () => ({
  debug,
}));

const cacheModule = await import("../src/cache");

const version = "10.11.0";
const platform = "linux";
const architecture = "x64";

describe("getCacheKey", () => {
  it("generates a deterministic key from version, platform, and architecture", () => {
    const key = cacheModule.getCacheKey(version, platform, architecture);
    expect(key).toBe(`${CACHE_KEY_PREFIX}-${platform}-${architecture}-${version}`);
  });

  it("produces different keys for different inputs", () => {
    const a = cacheModule.getCacheKey("10.11.0", "linux", "x64");
    const b = cacheModule.getCacheKey("10.11.0", "windows", "x64");
    const c = cacheModule.getCacheKey("10.10.0", "linux", "x64");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(b).not.toBe(c);
  });
});

describe("getToolCacheVersionPath", () => {
  const original = process.env.RUNNER_TOOL_CACHE;

  afterEach(() => {
    process.env.RUNNER_TOOL_CACHE = original;
  });

  it("builds path from RUNNER_TOOL_CACHE env var", () => {
    process.env.RUNNER_TOOL_CACHE = "/opt/hostedtoolcache";

    const result = cacheModule.getToolCacheVersionPath("10.11.0");
    expect(result).toContain(TOOL_NAME);
    expect(result).toContain("10.11.0");
    expect(result).toContain("hostedtoolcache");
  });
});

describe("tryRestoreCache", () => {
  it("returns true when cache is restored", async () => {
    restoreCache.mockResolvedValue("setup-flyway-linux-x64-10.11.0");

    const result = await cacheModule.tryRestoreCache(version, platform, architecture);

    expect(result).toBe(true);
    expect(restoreCache).toHaveBeenCalledWith(
      [expect.stringContaining(TOOL_NAME)],
      `${CACHE_KEY_PREFIX}-${platform}-${architecture}-${version}`,
    );
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("Restored"));
  });

  it("returns false on cache miss", async () => {
    restoreCache.mockResolvedValue(undefined);

    const result = await cacheModule.tryRestoreCache(version, platform, architecture);

    expect(result).toBe(false);
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("miss"));
  });

  it("returns false and warns on error", async () => {
    restoreCache.mockRejectedValue(new Error("Network timeout"));

    const result = await cacheModule.tryRestoreCache(version, platform, architecture);

    expect(result).toBe(false);
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("Network timeout"));
  });
});

describe("trySaveCache", () => {
  it("saves to cache successfully", async () => {
    saveCache.mockResolvedValue(42);

    await cacheModule.trySaveCache(version, platform, architecture);

    expect(saveCache).toHaveBeenCalledWith(
      [expect.stringContaining(TOOL_NAME)],
      `${CACHE_KEY_PREFIX}-${platform}-${architecture}-${version}`,
    );
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("Saved"));
  });

  it("handles ReserveCacheError gracefully", async () => {
    saveCache.mockRejectedValue(new ReserveCacheError("Cache already exists"));

    await cacheModule.trySaveCache(version, platform, architecture);

    expect(debug).toHaveBeenCalledWith(expect.stringContaining("already exists"));
  });

  it("warns on unexpected errors without throwing", async () => {
    saveCache.mockRejectedValue(new Error("Storage quota exceeded"));

    await cacheModule.trySaveCache(version, platform, architecture);

    expect(debug).toHaveBeenCalledWith(expect.stringContaining("Storage quota exceeded"));
  });
});
