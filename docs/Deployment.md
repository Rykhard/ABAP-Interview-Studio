# Cloudflare Pages deployment

Target source repository: https://github.com/Rykhard/ABAP-Interview-Studio

Requested production hostname: `abap-interview-studio.pages.dev`. Cloudflare determines whether the exact hostname is available when the Pages project is created; a repository name alone does not reserve it.

## Git integration

In Cloudflare, open Workers & Pages, create a Pages project, connect GitHub and select only this repository.

| Setting | Value |
| --- | --- |
| Project name | `abap-interview-studio` |
| Production branch | `main` |
| Framework preset | None |
| Build command | `python scripts/build_site.py` |
| Build output directory | `dist` |
| Root directory | Repository root |

The deployment build uses Python's standard library only. Generated PDF and Anki artifacts are committed in this repository; full content/export regeneration remains a separate maintenance step. Pushes to `main` publish updates after Git integration is connected.

## Local preview and upload alternative

Run `python scripts/build_site.py`, then `python -m http.server 8780 --bind 127.0.0.1 --directory dist`. Open `http://127.0.0.1:8780/`.

The build also produces `dist.zip` for dashboard upload. Choose Git integration for automatic repository deployments. A Direct Upload project cannot later switch to Git integration without creating another project.

## Publication boundary

Only the explicit static allowlist from `scripts/build_site.py` enters `dist`: the entry pages, visuals, PDFs, flashcards, study/topic guides, public review notes and deployment guide. The site does not publish original personal documents, previous private Git history, task records, credentials or local progress exports. `deployment-manifest.json` records the published paths and hashes.

This repository and a normal Pages deployment are public. Learner progress is stored in that browser on the site's origin, not sent to a server. To transfer progress from the local HTML version, export it there and import it on the hosted site. Different devices/browsers have separate progress until an account/synchronization feature is implemented.

## Verification after deployment

Open the production root and a question URL such as `/#q-CLOUD-01`. Test search, topic browsing, answer-display selection, both practice formats, diagram zoom and PDF/Anki downloads. Verify a nonexistent URL returns a real 404. Check the production deployment points to the intended Git commit and uses the requested hostname.

## Official guidance

- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
