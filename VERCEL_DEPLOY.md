# Vercel Deployment

## Prerequisites

- Node.js 24.x (see `package.json` and `.nvmrc`)
- A Vercel account

## Deploy with Vercel CLI (no git required)

1. Install Vercel CLI:

```
npm i -g vercel
```

2. Login:

```
vercel login
```

3. Deploy (preview):

```
vercel
```

4. Deploy to production:

```
vercel --prod
```

During the first deploy, choose:

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `.`

## Deploy via Git (auto deploy)

1. Push your changes to GitHub/GitLab.
2. Import the repository on Vercel.
3. Vercel will detect the Vite config automatically.
4. Every push to the connected branch triggers a deploy.

## CSP Verification

After deploy, verify CSP is active:

1. Open the site in your browser.
2. DevTools -> Network -> select the HTML document.
3. Check Response Headers for `Content-Security-Policy` and `nonce-...`.
4. View page source and confirm `nonce="..."` is present on scripts.

## Notes

- Preview deployments may inject `vercel.live` scripts. Disable the Vercel Toolbar in Project Settings if needed.
- This project routes HTML through `/api/index` to inject a per-request nonce.
- Static assets are served directly from `dist/` by Vercel's filesystem handler.
