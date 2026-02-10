# Setup Flyway

[![Basic validation](../..//actions/workflows/basic-validation.yml/badge.svg)](../..//actions/workflows/basic-validation.yml)
[![E2E Validation](../..//actions/workflows/e2e-validation.yml/badge.svg)](../..//actions/workflows/e2e-validation.yml)
[![License checks](../..//actions/workflows/license-checks.yml/badge.svg)](../..//actions/workflows/license-checks.yml)
[![CodeQL Analysis](../..//actions/workflows/codeql-analysis.yml/badge.svg)](../..//actions/workflows/codeql-analysis.yml)

The `setup-flyway` action will download and set up a requested version of the Flyway CLI.

## Usage

- `version` - The version of Flyway CLI to set up. Can specify `latest`, an exact version, or a [semver](#supported-version-syntax) version. **Default:** `latest`.
- `architecture` - The hardware architecture version of the Flyway CLI. Can specify `x64`, `arm64`, or `java`. The Java version will require Java 17 or higher to be installed, preferably using [`actions/setup-java`](https://github.com/actions/setup-java). **Default:** the architecture of the runner.
- `platform` - The operating system version of the Flyway CLI. Can specify `linux`, `linux-alpine`, `macos`, or `windows`. This setting is ignored when `java` is selected for the architecture. **Default:** the platform of the runner.
- `email` - A Redgate email to be used in conjunction with the `token` parameter to configure a personal access token (PAT). Used to authenticate Flyway to use either Teams or Enterprise.
- `token` - A personal access token (PAT) to be used in conjunction with the `email` parameter. This is used to license Flyway to access Teams or Enterprise features.
- `i-agree-to-the-eula` - Set to `true` to confirm you consent to the [Redgate EULA](https://www.red-gate.com/eula).

> [!NOTE]
> The Flyway CLI supports `windows-x64`, `linux-x64`, `macosx-arm64`, `macosx-x64`, and `linux-alpine-x64` platforms. 
> For all other platforms, the Java version of the Flyway CLI should be used.

### Basic Configuration

#### Typical setup

```yaml
- uses: red-gate/setup-flyway@v2
```

#### Java version

```yaml
- uses: actions/setup-java@v4
  with:
    distribution: 'zulu' # See 'Supported distributions' for available options
    java-version: '21'
- uses: red-gate/setup-flyway@v2
  with:
    architecture: 'java'
```

#### Authentication

```yaml
- uses: red-gate/setup-flyway@v2
  with:
    email: ${{ secrets.FLYWAY_EMAIL }}
    token: ${{ secrets.FLYWAY_TOKEN }}
    i-agree-to-the-eula: true
```

#### Supported version syntax

The `version` input supports an exact version or a version range using [SemVer](https://semver.org/) notation:
- major versions: `9`, `10`
- more specific versions:  `10.11`, `10.12.0`, `10.13.x`
- the current version: `latest`

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Contributions

Contributions are welcome! See [Contributor's Guide](CONTRIBUTORS.md)

## Security Policy

Find a security issue? Please review our [Security Policy](.github/SECURITY.md).

## Support

For support, please see the [Support Policy](.github/SUPPORT.md).
