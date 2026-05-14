# Dev Log

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
