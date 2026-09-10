---
name: Release preview project selection
description: The release preview wrapper must invoke Playwright directly when selecting a small browser-project subset.
---

The release preview smoke should call the Playwright runner directly with its config and explicit project filters, rather than relying on a package script with another argument separator.

**Why:** In this workspace, forwarding an extra `--` through the package script caused Playwright to ignore the intended project filters and run the full cross-browser suite, including runtimes unavailable in the release environment.

**How to apply:** When changing the release smoke command, verify the output reports only the intended WebKit projects before treating the release gate as valid.