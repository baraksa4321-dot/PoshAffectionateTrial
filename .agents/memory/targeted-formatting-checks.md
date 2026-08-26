---
name: Targeted formatting checks
description: How to keep small changes from creating unrelated formatting churn in legacy UI files.
---

When a formatter reports issues in a large existing UI file, compare the baseline before changing formatting. Keep the change focused on the new or edited sections unless the task explicitly includes a whole-file formatting cleanup.

**Why:** Whole-file formatter rewrites can obscure the functional change, create large review diffs, and increase merge conflict risk even when the underlying feature is small.

**How to apply:** Check changed files and the corresponding baseline with the formatter, then format new standalone files and manually preserve the established style around targeted edits.