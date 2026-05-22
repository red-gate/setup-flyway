import { METADATA_URL } from "../src/constants.js";
import { loadFixture } from "./utils/fixtures.js";

const mockGet = vi.fn();
vi.doMock("@actions/http-client", () => ({
  HttpClient: vi.fn(function () {
    return { get: mockGet };
  }),
}));

const { getAvailableVersions, privateExports } = await import("../src/metadata.js");

const reply = (statusCode: number, body: string, contentType?: string) => ({
  message: { statusCode, headers: contentType ? { "content-type": contentType } : {} },
  readBody: () => Promise.resolve(body),
});

describe("metadata", () => {
  const metadataContent = loadFixture("maven.xml");
  const metadata = privateExports.functions!;

  it("should load remote metadata", async () => {
    mockGet.mockResolvedValue(reply(200, metadataContent, "text/plain"));

    const versions = await metadata.downloadToolMetadata(METADATA_URL);

    expect(versions).toBe(metadataContent);
    expect(mockGet).toHaveBeenCalledWith(METADATA_URL);
  });

  it("parses the versions", async () => {
    const meta = await metadata.parseAvailableVersions(metadataContent);
    expect(meta.latest).toBe("10.11.0");
    expect(meta.availableVersions).toHaveLength(18);
  });

  it("should get available versions end-to-end", async () => {
    mockGet.mockResolvedValue(reply(200, metadataContent, "application/xml"));

    const result = await getAvailableVersions();

    expect(result.latest).toBe("10.11.0");
    expect(result.availableVersions).toHaveLength(18);
  });

  it("throws when server returns non-200 status", async () => {
    mockGet.mockResolvedValue(reply(404, ""));

    await expect(metadata.downloadToolMetadata(METADATA_URL)).rejects.toThrow(
      "Failed to fetch versions from URL. Status code: 404",
    );
  });

  it("throws when server returns unexpected content type", async () => {
    mockGet.mockResolvedValue(reply(200, "<xml/>", "application/json"));

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
