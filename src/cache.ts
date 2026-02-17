import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as path from "path";
import * as constants from "./constants";

const getCacheKey = (version: string, platform: string, architecture: string): string => {
  return `${constants.CACHE_KEY_PREFIX}-${platform}-${architecture}-${version}`;
};

const getToolCacheVersionPath = (version: string): string => {
  const toolCacheRoot = process.env.RUNNER_TOOL_CACHE ?? "";
  return path.join(toolCacheRoot, constants.TOOL_NAME, version);
};

const tryRestoreCache = async (version: string, platform: string, architecture: string): Promise<boolean> => {
  const key = getCacheKey(version, platform, architecture);
  const cachePath = getToolCacheVersionPath(version);
  try {
    const restoredKey = await cache.restoreCache([cachePath], key);
    if (restoredKey) {
      core.debug(`Restored Flyway ${version} from GitHub Actions cache`);
      return true;
    }
    core.debug("GitHub Actions cache miss");
    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.debug(`Failed to restore from cache: ${message}`);
    return false;
  }
};

const trySaveCache = async (version: string, platform: string, architecture: string): Promise<void> => {
  const key = getCacheKey(version, platform, architecture);
  const cachePath = getToolCacheVersionPath(version);
  try {
    await cache.saveCache([cachePath], key);
    core.debug(`Saved Flyway ${version} to GitHub Actions cache`);
  } catch (error) {
    if (error instanceof cache.ReserveCacheError) {
      core.debug(`Cache entry already exists for key: ${key}`);
    } else {
      const message = error instanceof Error ? error.message : String(error);
      core.debug(`Failed to save to cache: ${message}`);
    }
  }
};

export { getCacheKey, getToolCacheVersionPath, tryRestoreCache, trySaveCache };
