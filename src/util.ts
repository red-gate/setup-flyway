import path from "path";
import * as semver from "semver";
import * as tc from "@actions/tool-cache";
import * as constants from "./constants";
import { Architecture } from "./inputs";

const downloadTool = async (version: string, platform: string, architecture: string) => {
  const downloadUrl = getDownloadUrl(version, platform, architecture);
  const pathToDownload = await tc.downloadTool(downloadUrl);
  return { downloadUrl, pathToArchive: pathToDownload };
};

const getDownloadArchiveExtension = (platform: string) => {
  return platform === "windows" ? "zip" : "tar.gz";
};

const getSemanticVersion = (spec: string, availableVersions: string[], latestVersion: string) => {
  return spec == "latest" ? latestVersion : semver.maxSatisfying(availableVersions, spec);
};

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

const getDownloadUrl = (version: string, platform: string, arch: string) => {
  const extension = getDownloadArchiveExtension(platform);
  const baseUrl = constants.BASE_URL;
  return arch == Architecture.JAVA
    ? `${baseUrl}/${version}/flyway-commandline-${version}.${extension}`
    : `${baseUrl}/${version}/flyway-commandline-${version}-${platform}-${arch}.${extension}`;
};

export { downloadTool, getSemanticVersion, extractTool, getDownloadUrl };
