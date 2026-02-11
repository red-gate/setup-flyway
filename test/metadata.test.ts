import nock from "nock";
import { URL } from "url";
import { getAvailableVersions, privateExports } from "../src/metadata";
import { METADATA_URL } from "../src/constants";
import { loadFixture } from "./utils/fixtures";

describe("metadata", () => {
  const metadataContent = loadFixture("maven.xml");
  const metadata = privateExports.functions!;

  afterEach(() => {
    nock.cleanAll();
  });

  it("should load remote metadata", async () => {
    const url = new URL(METADATA_URL);
    const scope = nock(url.origin).get(url.pathname).reply(200, metadataContent, {
      "Content-Type": "text/plain",
    });

    const versions = await metadata.downloadToolMetadata(METADATA_URL);
    expect(versions).toBe(metadataContent);
    expect(scope.isDone()).toBe(true);
  });

  it("parses the versions", async () => {
    const meta = await metadata.parseAvailableVersions(metadataContent);
    expect(meta.latest).toBe("10.11.0");
    expect(meta.availableVersions).toHaveLength(18);
  });

  it("should get available versions end-to-end", async () => {
    const url = new URL(METADATA_URL);
    nock(url.origin).get(url.pathname).reply(200, metadataContent, {
      "Content-Type": "application/xml",
    });

    const result = await getAvailableVersions();
    expect(result.latest).toBe("10.11.0");
    expect(result.availableVersions).toHaveLength(18);
  });

  it("throws when server returns non-200 status", async () => {
    const url = new URL(METADATA_URL);
    nock(url.origin).get(url.pathname).reply(404);

    await expect(metadata.downloadToolMetadata(METADATA_URL)).rejects.toThrow(
      "Failed to fetch versions from URL. Status code: 404",
    );
  });

  it("throws when server returns unexpected content type", async () => {
    const url = new URL(METADATA_URL);
    nock(url.origin).get(url.pathname).reply(200, "<xml/>", {
      "Content-Type": "application/json",
    });

    await expect(metadata.downloadToolMetadata(METADATA_URL)).rejects.toThrow(
      "Unexpected content type: application/json",
    );
  });

  test.each([
    ["application/xml", true],
    ["application/xml;charset=UTF-8", true],
    ["text/plain", true],
    ["application/json", false],
    ["text/html", false],
    [undefined, false],
  ])("allows content type %p: %p", (contentType, result) => {
    expect(metadata.isAllowedContentType(contentType)).toBe(result);
  });
});
