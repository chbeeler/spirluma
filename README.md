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

## Necklace QR tracking

Cloudflare Pages Function routes such as `/n/001`, `/n/002`, and `/n/003` record a `QR visit` in D1 and then redirect the visitor to the homepage. Necklace IDs are stored as text so leading zeroes are preserved. Times are stored as UTC ISO timestamps and should be converted to the viewer's timezone when displayed.

The database schema lives in `migrations/0001_create_necklace_tracking.sql`. It creates a necklace registry, the event log, an index, and the convenient `necklace_visit_log` view. The initial registry contains `001`, `002`, and `003`.

To add another necklace:

```sql
INSERT OR IGNORE INTO necklaces (id) VALUES ('0042');
```

To inspect recent scans:

```sql
SELECT Necklace, Time, Event
FROM necklace_visit_log
LIMIT 100;
```

### Cloudflare setup

1. Log in to Wrangler with `npx wrangler login` or use the Cloudflare dashboard.
2. Create a D1 database named `spirluma-tracking`. For data residency in this project, the EU jurisdiction is recommended:

   ```sh
   npx wrangler d1 create spirluma-tracking --jurisdiction eu
   ```

3. Apply the schema:

   ```sh
   npx wrangler d1 execute spirluma-tracking --remote --file=./migrations/0001_create_necklace_tracking.sql
   ```

4. The `TRACKING_DB` binding is declared in `wrangler.toml` for both preview and production deployments. Redeploy the Pages project after changing its configuration.

Only `/n/*` invokes Pages Functions; `public/_routes.json` keeps all static assets and normal page visits on the static Pages path. A database failure never blocks the visitor from reaching the homepage.

Run the schema and route tests with:

```sh
npm run test:tracking
```

## Cloudflare Pages

Connect the GitHub repository to a Pages project with:

- Framework preset: `Astro`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (unless this project lives in a monorepo subdirectory)

The QR tracking Function requires the `TRACKING_DB` D1 binding described above. Pushes to `main` trigger production deployments; pull requests receive preview deployments.
