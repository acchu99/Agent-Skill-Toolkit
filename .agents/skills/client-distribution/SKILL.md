---
name: client-distribution
description: Workflow for packaging and releasing a reusable client library.
---

# Client Distribution Workflow

This skill outlines the mandatory steps for releasing a new version of a reusable client package.

## 1. Version Management
The version is usually controlled in `setup.py`, `pyproject.toml`, `package.json`, or the equivalent package manifest.
1. Increment the `version` string (e.g., `0.1.13` → `0.1.14`).
2. Follow semantic versioning (Major.Minor.Patch).

## 2. Build Process
Prefer the repository's automated build/release script when one exists.

### Manual Build Steps
If the script fails, perform a clean manual build:
```bash
cd path/to/client-package
rm -rf dist build *.egg-info
python -m build
```

## 3. Upload & Deployment
Publish the package to the repository's configured package registry or artifact bucket.

### Artifact Upload
Verify the upload via the package registry CLI or object-store CLI:
```bash
aws s3 cp dist/*.whl s3://example-artifacts/client/ --region us-east-1
```

## 4. Downstream Impact
Updating the client requires updating dependent images:
- **Container images:** Ensure any `Dockerfile` or build context pulls the latest artifact.
- **Local testing:** Install the new package locally and run a minimal smoke test against the public client API.

> [!WARNING]
> Always verify the installed package version after a fresh installation to ensure the cache is not serving an old artifact.
