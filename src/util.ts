import path from "path";
import * as semver from "semver";
import * as tc from "@actions/tool-cache";
import * as constants from "./constants";
import { Architecture } from "./inputs";

/**
 * Download the tool and return the URL and download path.
 * @param version the CLI version
 * @param platform the CLI platform
 * @param architecture the CLI architecture
 * @returns the path and URL details
 */
const downloadTool = async (version: string, platform: string, architecture: string) => {
  const downloadUrl = getDownloadUrl(version, platform, architecture);
  const pathToDownload = await tc.downloadTool(downloadUrl);
  return {
    downloadUrl,
    pathToArchive: pathToDownload,
  };
};

/**
 * Gets the archive extension for downloads.
 * @param platform the platform
 * @returns the extension
 */
const getDownloadArchiveExtension = (platform: string) => {
  return platform === "windows" ? "zip" : "tar.gz";
};

/**
 * Resolves the best version from a specification and set of
 * available versions.
 * @param spec the version specification
 * @param availableVersions the available versions
 * @param latestVersion the latest version
 * @returns the best version
 */
const getSemanticVersion = (spec: string, availableVersions: string[], latestVersion: string) => {
  return spec == "latest" ? latestVersion : semver.maxSatisfying(availableVersions, spec);
};

/**
 * Extracts the downloaded tool archive
 * @param archivePath The path to the archive
 * @param extension the extension of the archive
 * @returns the destination path
 */
const extractTool = async (archivePath: string, extension?: string) => {
  if (!extension) {
    extension = archivePath.endsWith(".tar.gz") ? "tar.gz" : path.extname(archivePath);
    if (extension.startsWith(".")) {
      extension = extension.substring(1);
    }
  }

  switch (extension) {
    case "tar.gz":
    case "tar":
      return await tc.extractTar(archivePath);
    case "zip":
      return await tc.extractZip(archivePath);
    default:
      return await tc.extract7z(archivePath);
  }
};

/**
 * Gets the download URL for a specific version of the CLI
 * @param version the version
 * @param platform the OS platform
 * @param arch the architecture
 * @returns A URL for downloading the CLI
 */
const getDownloadUrl = (version: string, platform: string, arch: string) => {
  const extension = getDownloadArchiveExtension(platform);
  const baseUrl = constants.BASE_URL;
  return arch == Architecture.JAVA
    ? `${baseUrl}/${version}/flyway-commandline-${version}.${extension}`
    : `${baseUrl}/${version}/flyway-commandline-${version}-${platform}-${arch}.${extension}`;
};

export { downloadTool, getSemanticVersion, extractTool, getDownloadUrl };
