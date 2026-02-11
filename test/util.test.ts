import nock from "nock";
import { BASE_URL } from "../src/constants";

const downloadTool = vi.fn();
const extractTar = vi.fn();
const extractZip = vi.fn();
const extract7z = vi.fn();

vi.doMock("@actions/tool-cache", () => ({
  downloadTool,
  extractTar,
  extractZip,
  extract7z,
}));

const util = await import("../src/util");

describe("util", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("can get download URL for linux", async () => {
    const target = util.getDownloadUrl("10.11.0", "linux", "arm64");
    expect(target).toBe(`${BASE_URL}/10.11.0/flyway-commandline-10.11.0-linux-arm64.tar.gz`);
  });

  it("can get download URL for windows with zip extension", () => {
    const target = util.getDownloadUrl("10.11.0", "windows", "x64");
    expect(target).toBe(`${BASE_URL}/10.11.0/flyway-commandline-10.11.0-windows-x64.zip`);
  });

  it("can get download URL for java architecture without platform suffix", () => {
    const target = util.getDownloadUrl("10.11.0", "linux", "java");
    expect(target).toBe(`${BASE_URL}/10.11.0/flyway-commandline-10.11.0.tar.gz`);
  });

  it("can get download URL for java on windows with zip extension", () => {
    const target = util.getDownloadUrl("10.11.0", "windows", "java");
    expect(target).toBe(`${BASE_URL}/10.11.0/flyway-commandline-10.11.0.zip`);
  });

  test.each([
    ["latest", "10.11.0"],
    ["10.x", "10.11.0"],
    ["10.5", "10.5.1"],
    ["<10.5", "10.4.1"],
    ["10.5.*", "10.5.1"],
    ["10.9.0", "10.9.0"],
    ["~10.6.1", "10.6.3"],
    ["^10.6.1", "10.11.0"],
  ])("resolves version %p to %p", async (requested, expected) => {
    const versions = [
      "10.3.0",
      "10.4.0",
      "10.4.1",
      "10.5.0",
      "10.5.1",
      "10.6.0",
      "10.6.1",
      "10.6.2",
      "10.6.3",
      "10.9.0",
      "10.9.1",
      "10.11.0",
    ];
    const result = util.getSemanticVersion(requested, versions, "10.11.0");
    expect(result).toBe(expected);
  });
});

describe("downloadTool", () => {
  it("downloads the tool and returns the URL and path", async () => {
    downloadTool.mockResolvedValue("/tmp/flyway-archive");

    const result = await util.downloadTool("10.11.0", "linux", "x64");
    expect(result.downloadUrl).toBe(`${BASE_URL}/10.11.0/flyway-commandline-10.11.0-linux-x64.tar.gz`);
    expect(result.pathToArchive).toBe("/tmp/flyway-archive");
    expect(downloadTool).toHaveBeenCalledWith(result.downloadUrl);
  });
});

describe("extractTool", () => {
  it("extracts tar.gz when extension is provided", async () => {
    extractTar.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.tar.gz", "tar.gz");
    expect(result).toBe("/extracted/path");
    expect(extractTar).toHaveBeenCalledWith("/tmp/archive.tar.gz");
  });

  it("extracts tar when extension is tar", async () => {
    extractTar.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.tar", "tar");
    expect(result).toBe("/extracted/path");
    expect(extractTar).toHaveBeenCalledWith("/tmp/archive.tar");
  });

  it("extracts zip when extension is provided", async () => {
    extractZip.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.zip", "zip");
    expect(result).toBe("/extracted/path");
    expect(extractZip).toHaveBeenCalledWith("/tmp/archive.zip");
  });

  it("falls back to 7z for unknown extension", async () => {
    extract7z.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.rar", "rar");
    expect(result).toBe("/extracted/path");
    expect(extract7z).toHaveBeenCalledWith("/tmp/archive.rar");
  });

  it("auto-detects tar.gz from archive path", async () => {
    extractTar.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.tar.gz");
    expect(result).toBe("/extracted/path");
    expect(extractTar).toHaveBeenCalledWith("/tmp/archive.tar.gz");
  });

  it("auto-detects zip from archive path", async () => {
    extractZip.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.zip");
    expect(result).toBe("/extracted/path");
    expect(extractZip).toHaveBeenCalledWith("/tmp/archive.zip");
  });

  it("falls back to 7z when auto-detecting unknown extension", async () => {
    extract7z.mockResolvedValue("/extracted/path");

    const result = await util.extractTool("/tmp/archive.exe");
    expect(result).toBe("/extracted/path");
    expect(extract7z).toHaveBeenCalledWith("/tmp/archive.exe");
  });
});
