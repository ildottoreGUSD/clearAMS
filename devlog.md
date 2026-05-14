# Dev Log

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
