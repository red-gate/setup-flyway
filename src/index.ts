import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import * as path from "path";
import * as constants from "./constants";
import { getInputs } from "./inputs";
import * as metadata from "./metadata";
import { downloadTool, extractTool, getSemanticVersion } from "./util";

const verifyEdition = async (expectedEdition: string): Promise<void> => {
  let versionOutput = "";
  const exitCode = await exec.exec("flyway", ["--version"], {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        versionOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        versionOutput += data.toString();
      },
    },
  });

  const match = versionOutput.match(/Flyway\s+(Community|Teams|Enterprise)\s+Edition/);

  if (exitCode !== 0 && !match) {
    core.info(versionOutput);
    core.warning(
      `Could not verify Flyway edition (flyway --version exited with code ${exitCode}). Skipping edition check.`,
    );
    return;
  }

  const installedEdition = match ? match[1].toLowerCase() : "community";
  if (installedEdition !== expectedEdition) {
    throw new Error(`Edition mismatch: expected '${expectedEdition}' but Flyway reported '${installedEdition}'`);
  }
};

const authenticate = async (email: string, token: string, agreeToEula: boolean): Promise<void> => {
  core.setSecret(token);
  const args = ["auth", `-email=${email}`, `-token=${token}`];
  if (agreeToEula) {
    args.push("-IAgreeToTheEula");
  }
  await exec.exec("flyway", args);
};

const installOrGetCached = async (version: string, platform: string, architecture: string): Promise<string> => {
  let cachedPath = tc.find(constants.TOOL_NAME, version, architecture);
  if (!cachedPath) {
    const download = await downloadTool(version, platform, architecture);
    const extension = download.downloadUrl.endsWith(".zip") ? "zip" : "tar.gz";
    const newPath = await extractTool(download.pathToArchive, extension);

    // Can't use the provided path as-is because the Flyway archive contains
    // a single folder with the binaries rather than containing the binaries
    // in the root of the archive.
    const toolPath = path.join(newPath, `flyway-${version}`);
    cachedPath = await tc.cacheDir(toolPath, constants.TOOL_NAME, version, architecture);
  }
  return cachedPath;
};

const run = async () => {
  try {
    const inputs = getInputs();
    const { versionSpec, architecture, platform } = inputs;

    core.startGroup(`Installing ${constants.TOOL_NAME}`);

    const versionMetadata = await metadata.getAvailableVersions();
    core.info(`Latest version: ${versionMetadata.latest}`);
    core.debug(`Available versions: ${versionMetadata.availableVersions.join(", ")}`);

    const version = getSemanticVersion(versionSpec, versionMetadata.availableVersions, versionMetadata.latest);
    if (version == null) {
      core.setFailed(`Version specification ${versionSpec} is not available`);
      return;
    }

    core.debug(`Resolved ${versionSpec} to version: ${version}`);

    const cachedPath = await installOrGetCached(version, platform, architecture);

    core.setOutput(constants.OUTPUT_VERSION, version);
    core.setOutput(constants.OUTPUT_PATH, cachedPath);
    core.exportVariable(`FLYWAY_HOME_${version}`, cachedPath);
    core.addPath(cachedPath);

    core.endGroup();

    core.startGroup("Verifying Flyway edition");
    await verifyEdition(inputs.edition);
    core.endGroup();

    if (inputs.email && inputs.token) {
      core.startGroup("Authenticating Flyway");
      await authenticate(inputs.email, inputs.token, inputs.agreeToEula);
      core.endGroup();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
  }
};

if (process.argv[1].endsWith("index.js")) {
  await run();
}
