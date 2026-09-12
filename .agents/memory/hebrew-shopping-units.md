---
name: Hebrew shopping-unit parsing
description: Regular-expression rules for numeric Hebrew food quantities in shopping-list calculations.
---

Numeric patterns for Hebrew units such as גרם should use explicit whitespace/end lookaheads rather than `\b`; JavaScript word boundaries are ASCII-oriented and can fail after Hebrew letters.

**Why:** A valid serving such as “100 גרם למנה” can otherwise fall through to a quantity of one, producing severely understated shopping totals.

**How to apply:** When parsing Hebrew serving sizes, use boundaries like `(?=\s|$|[),.])` and add regression tests with the full Hebrew phrase.