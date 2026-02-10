# Breaking Changes

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
