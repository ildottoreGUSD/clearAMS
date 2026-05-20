# Dev Log

## 2026-05-20
- Migrated from Railway (outage on deploy day) to Fly.io. Created Dockerfile (multi-stage: Node 20 builds Remotion player via `npm run build:player`, Python 3.12-slim runs Flask/gunicorn), fly.toml (lax region, shared-cpu-1x 256MB, always-on `auto_stop=off min_machines=1`), .dockerignore, docker-entrypoint.sh.
- Added 1 GB encrypted Fly.io volume (`clearams_data`) mounted at `/data`; `users.json` is seeded there on first boot from the bundled copy. Added `DATA_DIR` env var to server.py so path is configurable (defaults to app dir in local dev, `/data` on Fly).
- Set `ADMIN_KEY` as a Fly.io secret; `APP_URL` set in fly.toml env.
- Added custom domain `clearams.gusddev.app` to Fly.io (`fly certs add`); updated Cloudflare DNS from old tunnel CNAME to A/AAAA records (DNS-only, grey cloud) pointing to Fly.io IPs. Let's Encrypt cert issued and verified. `clearams.fly.dev` is blocked by GUSD network filter; `clearams.gusddev.app` is not.
- Added welcome email feature: server.py reads `SMTP_HOST/PORT/USER/PASS/FROM` env vars; `send_welcome_email()` uses stdlib smtplib (no new deps). `/admin/api/user` and `/admin/api/reset` accept `sendEmail` flag and return `emailSent`/`emailError`. Added `/admin/api/email-config` endpoint. Admin panel shows "Send welcome email" checkbox on both Add User and Reset Password forms — visible only when email is configured on the server.

## 2026-05-19 (continued 10)
- Added Railway deployment config: requirements.txt (flask, bcrypt, gunicorn), Procfile (gunicorn --workers 1), PORT env var in server.py, removed dead Remotion player routes from server.py, added __pycache__ to .gitignore.
- Removed Claude co-authorship from all 46 commits (git filter-repo + force push).
- Railway had a major outage on deploy day. Switching to Fly.io — setup deferred to next session.

## 2026-05-19 (continued 9)
- Added spending pace indicator to FY 2025–26 column: compares % utilized against the fraction of the fiscal year elapsed (July–June window) and shows "On track," "Ahead of pace," or "Behind pace" pill below the usage bar.
- Added year-over-year allocation delta (▲/▼ vs prior year) beneath the Starting Allocation number on each year column.
- Added FY 2026–27 Planning Dates panel below the year columns: draft recommended before June 2026 (with template link), hard deadline September 15, 2026, and a warning that no expenditures will be approved without an approved compliant plan on record.

## 2026-05-19 (continued 8)
- Removed Animated Budget Overview section (BudgetSVGChart, CHART_YEARS, BudgetBar, dead accent constants) — year columns already tell the full story.
- Added FY 2026–27 as a greyed-out upcoming column (leftmost). Shows a dashed-border "Allocations Expected July 2026" banner and a link to the district's 26-27 Site Expenditure Plan template (Google Docs /copy link).
- Dropped "Official" from the footer disclaimer line.

## 2026-05-19 (continued 7)
- Removed "After A/V projects" caption from the FY 2024–25 Remaining cell.

## 2026-05-19 (continued 6)
- Added Site Expenditure Plan links to each year column header. Extracted 30 plan files (.docx/.pdf) from zip into plans/. SITE_PLANS lookup maps school ID + fiscal year to filename; link renders as "📄 Site Expenditure Plan" beneath the FY label and opens in a new tab. 27 of 33 schools have a 25-26 plan; Clark, Marshall, Mountain Ave, Cloud, and Jewel City have no file yet. Fixed a variable ordering bug (key was undefined when planFile was computed) that prevented all links from rendering.
- Removed FY 2023-24 year column and bar from the budget overview chart. All fy2324 data remains in the SCHOOLS object for future calculations.

## 2026-05-19 (continued 5)
- Clarified column U logic: FY2425_AVAILABLE_BALANCE replaces the displayed Remaining figure for FY 2024–25 only — it is not added to the allocation. Allocation totals and bar charts are unaffected.
- Added prior-year overage warning to the FY 2025–26 Remaining cell: when a school's FY 2024–25 column U balance is negative, a yellow "⚠ Prior Year Overage" badge appears. Clicking it opens a modal showing the overage amount and a disclaimer that no debit has been applied to the displayed figures. Currently triggers for Columbus (−$39,290.28); logic is data-driven and will apply automatically to any future negative column U values.

## 2026-05-19 (continued 4)
- Added "Waiver Granted ↗" link to the Remaining field in the FY 2024–25 and FY 2025–26 year columns. Clicking opens a modal (WaiverModal component) showing both CDE waiver allowances: 2024–25 permits non-certified staffing support (community arts orgs, professional residencies, specialized instruction, masterclasses); 2025–26 permits materials and equipment spending (external partnerships, stage infrastructure, audio tech, digital media). Modal closes on overlay click or ×.

## 2026-05-19 (continued 3)
- Login screen: replaced "Sign in to ClearAMS" heading with the GUSD VAPA Logo.png (120px circular badge, centered). "ClearAMS" now appears beneath it in large serif letters (38px). Description text and sign-in form unchanged.

## 2026-05-19 (continued 2)
- Removed Gemini sparkle watermark from Gemini_Generated_Image_wkpbolwkpbolwkpb.png by cloning the clean dark background from below the sparkle region (x=1315-1407, y=665-735). Promoted this image to vapa-icon-clean.png (replaces the previous sketch-style artwork).
- Budget overview chart: reversed CHART_YEARS order so FY 2025–26 (Live · Current) renders leftmost and animates first; FY 2023–24 (Launch Year) is now rightmost.

## 2026-05-19 (continued)
- Reworked VAPA hero image layout: login page now shows the full image (no cropping) centered at 400px width, just wider than the 360px sign-in form. Dashboard hero strip removed entirely (was full-width 110px background-cover — too large and cropped).
- Fixed Pillow watermark-removal patch on vapa-icon-clean.png: repainted grey (185,189,192) rectangle at bottom-right corner with white to match the illustration's paper background.
- App icon: replaced paintbrush with a painter's palette (kidney-shaped gold body, thumb hole, red/blue/green paint dabs) in both favicon.svg and the ClearAMSLogo component. Regenerated icon-512.png.

## 2026-05-19
- Redesigned app icon: replaced original flower-petal PNG with a California sunset / performing arts theme (drama masks, California poppies, beamed music notes, paint brush, starfield). Source preserved as `favicon.svg`.
- Iterated on icon: switched to user-supplied Gemini-generated VAPA artwork (ballet shoes, drama masks, rainbow music wave, film camera). Removed Gemini watermark by sampling and painting over the bottom-right corner with Pillow. Letterboxed 1408×768 source into 512×512 `icon-512.png` on a matching background.
- Added full-width VAPA hero image banner to both the login screen (below top bar, above sign-in form) and the main dashboard (below header, above school title). Image renders at full natural width/height — no cropping.
- Replaced `ClearAMSLogo` component with an inline SVG laptop icon: silver chassis, dark screen with five music staff lines and gold beamed eighth-notes. Used as the small header logo on all screens and as `favicon.svg` / `icon-512.png` for browser tab and home screen.
- Wired `<link rel="icon" type="image/svg+xml">` and `<link rel="apple-touch-icon">` in the HTML `<head>`.
- Added Railway deployment notes: `users.json` committed to repo (persists through redeploys); Excel file updated by committing new version and pushing.

## 2026-05-16
- FY 2024–25 "Remaining" figure now reflects column U from the allocation spreadsheet ("Available Balance After A/V Projects" — Total Balance minus Studio Spectrum quote), instead of the naive `allocation − expenditure` of that single fiscal year. Driven by a new `FY2425_AVAILABLE_BALANCE` lookup keyed by school ID (33 entries). Ring/usage bar/% utilized still track actual 24–25 spend; only the right-hand "Remaining" number switches over. Negative U (e.g. Columbus: −$39,290) renders red as "Over". Added a small "After A/V projects" caption beneath the figure so users don't read it as a single-year balance.

## 2026-05-15
- Replaced the iframe-embedded Remotion video player on the dashboard ("Animated Budget Overview" section) with an inline animated SVG (`BudgetSVGChart` component). GSAP animates the SVG `<rect>` `y`/`height` attributes once on mount (staggered per year, `expo.out` easing); dollar labels and callout cards fade in afterwards. Plays through once and freezes on the final frame — no video controls, no loop. School switches re-trigger the animation via `key={school.id}`.
- Also dropped `loop` and `controls` props from the standalone `/player` Remotion route in `player-main.jsx` so direct visits to that URL also play once and stop. Rebuilt `remotion-viz/dist/`.
- Removed the now-redundant "Full screen" external link from the dashboard overview header (SVG is full-quality inline).
- Added `.devcontainer/devcontainer.json` so Flask + Cloudflare tunnel auto-start on every Codespace boot. `postStartCommand` runs `start_server.sh` in the background via `nohup ... &` (returns immediately so container startup isn't blocked); logs land in `/tmp/clearams.log`. Forwards port 8080 with a labeled entry in the VS Code Ports panel.

## 2026-05-14 (continued 6)
- Rebuilt Remotion composition: replaced looping year-card animation with a comparative grouped bar chart (Allocation vs. Expended for all three fiscal years). Bars animate in with spring physics staggered by year group. Four horizontal grid lines with Y-axis dollar labels give scale context.
- Added three explanatory callout cards below the chart — one per year — that pop in after their bars animate. Cards are data-driven: auto-detect zero-spending launch years, over-budget conditions, and current-year utilization status with contextual language.
- Extended composition duration from 90 → 180 frames (6 seconds at 30fps); added `acknowledgeRemotionLicense` prop to suppress console warning.
- Increased nav bar icon from 24px → 32px after user feedback that 24px was too small.

## 2026-05-14 (continued 5)
- Fixed GSAP CDN block: removed SRI `integrity` attribute from the GSAP script tag (cloudflare CDN had updated the file, causing hash mismatch and browser block). Dashboard ring/bar animations now load correctly.
- Fixed Remotion player crash (`TypeError: e is not a function`): `Easing.expo` is undefined in Remotion 4.0.461; replaced with `Easing.cubic` in CountUp component's interpolate call. Rebuilt player dist.

## 2026-05-14 (continued 4)
- Fixed icon-512.png rendering at natural size (~512px) in nav bar: Tailwind CDN preflight sets `img { height: auto }` which overrides the HTML `height` attribute. Moved height to inline `style` prop (which takes CSS precedence). Nav bars now correctly display icon at 24px.

## 2026-05-14 (continued 3)
- Replaced SVG logo with icon-512.png served as a static file; sized to 32px in nav bars, 56px in login card center.
- Removed massive base64-embedded PNG from dashboard HTML — file size dropped from ~530KB to ~50KB.
- Fixed critical "no data" bug: AllocationRing, BudgetBar, and YearColumn were hardcoded to their pre-animation (invisible) state; now fall back to fully visible values when GSAP is unavailable (CDN block or SRI mismatch).
- Fixed Lucide I component: now forwards `style` prop and handles both lucide.icons[name] and lucide[name] API shapes.
- Updated disclaimer to "Figures accurate as of May 1, 2026"; introduced DATA_DATE constant — single place to update on each import cycle.
- Redesigned YearColumn: removed staffing/supplies bar breakdown (27 numbers → 12); bigger ring (96→120px); cleaner expended/remaining card with single usage bar.
- Added cinematic school-switch GSAP transition (fade + y-slide on entire content body when school changes).
- Remotion animation panel enlarged (420→520px) and promoted with subtitle.
- Added Remotion @remotion/player web app (remotion-viz/player.html + src/player-main.jsx); built to remotion-viz/dist/ and served by Flask at /player?school=<id>.
- Expanded remotion-viz/src/data.js from 8 schools to all 33 schools.
- Updated start_server.sh to auto-build Remotion player dist if missing.

## 2026-05-14 (continued 2)
- Set up permanent Cloudflare named tunnel (ID: a3d62123-bdae-42bc-94f8-f759e5f04d44) routing clearams.gusddev.app → localhost:8080 via gusddev.app Cloudflare zone.
- Updated start_server.sh to auto-download cloudflared to /tmp if missing (survives Codespace restarts), start the tunnel in the background, then launch Flask — single command brings up both server and public URL.

## 2026-05-14 (continued)
- Removed all budget modeling/drag-to-adjust UI from the dashboard (Bucket component, adjustments state, Revert buttons, "drag to model" copy).
- Replaced with GSAP-animated AllocationRing (SVG arc) and BudgetBar (horizontal progress bar) components — staggered entry on school switch.
- Created remotion-viz/ subfolder: full Remotion 4 project with BudgetComposition, one 1280×720 composition per school, featuring spring-physics bars, animated SVG arcs, count-up numbers, and staggered card entries. Run `npm start` in remotion-viz/ to launch Remotion Studio; `npm run render` to export MP4.

## 2026-05-14
- Migrated auth from hardcoded USERS dict to Flask backend (server.py) with bcrypt password hashing and session tokens.
- Added admin panel (admin.html) with key-gated access for managing user accounts.
- Corrected all 33 school names and IDs in admin dropdown (fixed Clark/Daily HS labels, Monte Vista/Mountain Ave IDs, removed phantom schools, added all missing sites).
- Renamed "Bus. Services-Pacific Ave/Edison" to "Pacific Avenue Education Center" throughout.
- Multi-school support: users can now be assigned multiple or all schools; dashboard shows a school picker in the header when multiple schools are assigned.
- Dashboard background changed to pure white; border color updated to a more distinct blue-gray (#B8C8DC).
- Login page center logo enlarged (height 52 → 120); nav bar logos enlarged across all screens.
- Updated all nav bar subtitles to "Arts & Music in Schools (Prop 28) Budget Visualizer · Glendale Unified School District".
- Replaced generic login credentials hint with GUSD VAPA-specific language.
- Footer contact linked to Dr. Emil Ahangarzadeh (mailto); footer URL updated to www.gusd.net/arts.
- Added start_server.sh (Linux/Codespace) and start_server.cmd (Windows) launcher scripts with fixed ADMIN_KEY support.

## 2026-05-13
- Embedded GUSD VAPA Logo as base64 data URI in ClearAMS Dashboard.html.
- Replaced all four navy placeholder boxes (login screen header, login screen center, demo login header, dashboard header) with the actual logo image.

## 2026-05-11
- Initial devlog created.
