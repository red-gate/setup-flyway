# Breaking Changes

## v3

### `edition` is now required

The `edition` input parameter is now required. You must specify one of `community`, `teams`, or `enterprise`.

### `i-agree-to-the-eula` is now required

You must explicitly agree to the [Redgate EULA](https://www.red-gate.com/eula) by setting `i-agree-to-the-eula: true`.

**Migration:** Add `edition` and `i-agree-to-the-eula` to your workflow files.

Before:

```yaml
- uses: red-gate/setup-flyway@v2
```

After:

```yaml
- uses: red-gate/setup-flyway@v3
  with:
    edition: community
    i-agree-to-the-eula: true
```

If you use Teams or Enterprise with a personal access token:

```yaml
- uses: red-gate/setup-flyway@v3
  with:
    edition: enterprise
    i-agree-to-the-eula: true
    email: ${{ secrets.REDGATE_EMAIL }}
    token: ${{ secrets.REDGATE_TOKEN }}
```

## v2

### Removed `edition` input

The `edition` input parameter has been removed. Previously, this parameter allowed users to choose between `community` and `enterprise` feeds of Flyway from the Redgate download site. The enterprise feed has not received updates since Flyway v11. All editions of Flyway are now available through a single feed.

**Migration:** Remove any `edition` references from your workflow files. No other changes are required.

Before:

```yaml
- uses: red-gate/setup-flyway@v1
  with:
    edition: enterprise
```

After:

```yaml
- uses: red-gate/setup-flyway@v2
```
