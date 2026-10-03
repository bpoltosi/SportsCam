# Public Web Deployment

The public SportsCam site lives in `apps/web` and is deployed by GitHub Actions.

## Pipeline

- `.github/workflows/web-validate.yml` validates required assets and JavaScript syntax.
- `.github/workflows/web-pages.yml` packages `apps/web` and deploys it with GitHub Pages.

## One-time GitHub configuration

In the repository settings, GitHub Pages must use **GitHub Actions** as the build/deployment source. No framework build is required: the workflow publishes `apps/web` directly.

If a custom domain is used, configure the domain in GitHub Pages and keep the canonical/OG URLs in the site aligned with that domain.

## Lead form

The browser supports a configurable JSON POST endpoint through:

```html
<html data-lead-endpoint="https://example.invalid/leads">
```

or the runtime global `window.SPORTSCAM_LEAD_ENDPOINT`.

When no endpoint is configured, the form falls back to the commercial `mailto:` flow. A real production endpoint should be configured before relying on online lead capture.

## Public pages

- `/` — commercial landing page
- `/contato.html` — dedicated project/contact page
- `/privacy.html` — privacy information
- `/404.html` — not-found page
