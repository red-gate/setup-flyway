import * as httpm from "@actions/http-client";
import { XMLParser } from "fast-xml-parser";
import * as core from "@actions/core";

import * as constants from "./constants";

/**
 * Interface for the parsed XML metadata file
 */
interface MavenMetadataFile {
  metadata: {
    versioning: {
      release: string;
      versions: {
        version: string[];
      };
    };
  };
}

/**
 * Extracted metadata record
 */
export type VersionMetadata = {
  latest: string;
  availableVersions: string[];
};

/**
 * Retrieves the available versions of the tool from the metadata file.
 * @returns the available and latest versions of the tool
 */
export async function getAvailableVersions(): Promise<VersionMetadata> {
  const content = await getToolVersionsFile();
  return parseMetadata(content);
}

/**
 * Parses the Maven metadata content to resolve the available versions.
 * @param content the content of the metadata file
 * @returns the version metadata
 */
async function parseMetadata(content: string): Promise<VersionMetadata> {
  const parser = new XMLParser();
  const xml = parser.parse(content) as MavenMetadataFile;
  const versioning = xml.metadata.versioning;
  const latest = versioning.release;
  const versions = versioning.versions.version;
  return { latest, availableVersions: versions };
}

/**
 * Retrieves the metadata contents from the remote server.
 * @returns the contents of the metadata file
 */
async function getToolVersionsFile() {
  const metadataUrl = constants.METADATA_URL;
  core.debug(`Using metadata endpoint: ${metadataUrl}`);
  return await downloadToolMetadata(metadataUrl);
}

/**
 * Downloads the metadata file from the remote server and returns the content.
 * @param metadataUrl the URL of the metadata file
 * @returns A promise that resolves to the content of the metadata file
 * @throws An error if a status of 200 is not returned or the content type is unexpected
 */
async function downloadToolMetadata(metadataUrl: string) {
  const client: httpm.HttpClient = new httpm.HttpClient(constants.USER_AGENT);
  const res: httpm.HttpClientResponse = await client.get(metadataUrl);

  if (res.message.statusCode !== 200) {
    throw new Error(`Failed to fetch versions from URL. Status code: ${res.message.statusCode}`);
  }

  const contentType = res.message.headers["content-type"];
  if (!isAllowedContentType(contentType)) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  return await res.readBody();
}

function isAllowedContentType(header: string | undefined) {
  const contentType = header?.split(";")[0];
  return contentType === "application/xml" || contentType === "text/plain";
}

/** Exported values that are only available in a unit test environment */
export const privateExports =
  import.meta.env.MODE !== "test"
    ? {}
    : {
        functions: {
          downloadToolMetadata,
          getAvailableVersions,
          isAllowedContentType,
          parseAvailableVersions: parseMetadata,
        },
      };
