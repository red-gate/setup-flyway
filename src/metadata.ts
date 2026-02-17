import * as httpm from "@actions/http-client";
import { XMLParser } from "fast-xml-parser";
import * as core from "@actions/core";

import * as constants from "./constants";

interface MavenMetadataFile {
  metadata: {
    versioning: {
      release: string;
      versions: { version: string[] };
    };
  };
}

type VersionMetadata = { latest: string; availableVersions: string[] };

const getAvailableVersions = async (): Promise<VersionMetadata> => {
  const content = await getToolVersionsFile();
  return parseMetadata(content);
};

const parseMetadata = async (content: string): Promise<VersionMetadata> => {
  const parser = new XMLParser();
  const xml = parser.parse(content) as MavenMetadataFile;
  const versioning = xml.metadata.versioning;
  const latest = versioning.release;
  const versions = versioning.versions.version;
  return { latest, availableVersions: versions };
};

const getToolVersionsFile = async () => {
  const metadataUrl = constants.METADATA_URL;
  core.debug(`Using metadata endpoint: ${metadataUrl}`);
  return await downloadToolMetadata(metadataUrl);
};

const downloadToolMetadata = async (metadataUrl: string) => {
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
};

const isAllowedContentType = (header: string | undefined) => {
  const contentType = header?.split(";")[0];
  return contentType === "application/xml" || contentType === "text/plain";
};

/** Exported values that are only available in a unit test environment */
const privateExports =
  import.meta.env.MODE !== "test"
    ? {}
    : {
        functions: {
          downloadToolMetadata,
          isAllowedContentType,
          parseAvailableVersions: parseMetadata,
        },
      };

export { type VersionMetadata, getAvailableVersions, privateExports };
