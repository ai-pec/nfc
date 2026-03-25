# AI portfolio generation guardrails

The AI generator now works against a constrained portfolio blueprint instead of free-form HTML.

These rules are enforced in code from `lib/portfolio-ai.ts`:

1. Every portfolio must be mobile-first and easy to scan quickly.
2. Every portfolio must preserve clear contact actions when the relevant data exists.
3. Every portfolio must keep a stable trust layer: hero, about, contact/social area, and footer identity.
4. The AI must not generate raw scripts, arbitrary HTML, or unsupported claims.
5. The design can vary, but the information hierarchy must remain polished and conversion-focused.

Suggested AI environment variables:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL=deepseek-chat`

Without an AI key, the site falls back to a deterministic template blueprint so the workflow still functions.
