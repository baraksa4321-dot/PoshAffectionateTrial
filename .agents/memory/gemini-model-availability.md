---
name: Gemini model availability
description: Current Google API model names may change or be retired while the API key remains valid.
---

Use the model name returned by the live Google API error or current model catalog rather than assuming an older Gemini model remains available.

**Why:** A valid Gemini key returned a clear 404 because the previously selected model had been removed; the API identified the current replacement.

**How to apply:** When Gemini returns 404 NOT_FOUND for a model, inspect the response body and update the model before changing credentials or request formatting.