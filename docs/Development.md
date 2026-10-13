# Development and contribution

Use Python 3.12 and Node.js 22 or newer. Node is needed for development tests only;
the Cloudflare build and browser app do not require a JavaScript runtime package.

## Setup and checks

```sh
python -m venv .venv
# Activate .venv using the command for your shell.
python -m pip install -r requirements.txt
npm ci --ignore-scripts
npx playwright install chromium
python scripts/build_site.py
python -m unittest discover -s tests -p 'test_*.py'
python scripts/validate.py
npm run check:syntax
npm test
npm run test:browser
```

In PowerShell, use `npm.cmd` / `npx.cmd` if script execution policy blocks the
PowerShell launchers. Browser tests start their own local server on port 8794.
They use Playwright's pinned Chromium; `CHROME_PATH` can select an installed Chrome
binary for local diagnostics. Test results are ignored by Git.

For changed teaching content, run `python scripts/build.py` before packaging.
Review the generated HTML, guides, PDF and Anki changes alongside their sources.
The CI freshness check compares committed generated web files after rebuilding;
it deliberately ignores CRLF/LF differences across operating systems.

## Change workflow

1. Create a focused branch from `main` and describe the user-visible change.
2. Keep one source of truth. Preserve question IDs and local-storage keys unless
   an explicit migration is included. Update EN/RU together; keep code unchanged
   between translations.
3. Add regression tests for behavior or build boundaries, not copies of source
   implementation. Use primary SAP sources for technical content changes; browser
   examples do not establish SAP activation or runtime correctness.
4. Run the checks above. Inspect responsive layout, keyboard focus, both themes,
   both languages and reduced motion when changing presentation.
5. Submit a PR with the problem, resulting behavior and actual validation. Avoid
   unrelated formatting, generated-file churn and secrets or progress exports.

`Quality` runs on PRs and pushes to `main` with read-only repository permissions
and pinned action revisions. It validates content, publication, JavaScript,
payload budgets, browser flows and offline behavior. Python direct dependencies
are pinned; npm's complete dependency graph is in `package-lock.json`.

Cloudflare currently builds directly from `main`, independently of GitHub Actions.
Configure branch protection to require `Quality / validate` before merging if a
mandatory gate is desired. A workflow file alone does not enable branch protection
or stop Cloudflare from building a direct push. Repository settings are not changed
by the build scripts.

References: [GitHub's Python CI guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/python),
[GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use),
and [Playwright CI](https://playwright.dev/docs/ci-intro).
