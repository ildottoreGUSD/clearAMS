# Dev Log

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
