# Spirluma

A responsive Astro landing page for the Spirluma LED filament necklace. The site is statically generated and the contact form is delivered through Formspree.

## Local preview

Install dependencies, then start Astro in background mode:

```sh
npm install
npm run astro -- dev --background
```

Open `http://localhost:4321`. Manage the background server with:

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## Contact form

The contact form submits to the Formspree form `xjygzvag` using a small amount of vanilla JavaScript. Visitors remain on the Spirluma page and receive inline loading, success, and error feedback.

Submissions include the visitor's first name, email address, selected interest, and optional custom message. Formspree's `_gotcha` honeypot field provides basic spam filtering.

To change the receiving address or inspect submissions, open the **Contact** form inside the **Spirluma** project in the Formspree dashboard. The endpoint is public by design; no Formspree password or API key is stored in this repository.

## Cloudflare Pages

Connect the GitHub repository to a Pages project with:

- Framework preset: `Astro`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (unless this project lives in a monorepo subdirectory)

No Cloudflare Function or runtime environment variables are required. Pushes to `main` trigger production deployments; pull requests receive preview deployments.
