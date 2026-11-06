# Fan Guys Tools — Functional Audit, Revision 2

**Date:** November 6, 2026  
**Target:** One owner-operator, primarily iPhone Safari and the installed Home Screen app. Static HTML/JS on GitHub Pages, no build step or server.

## Release decision

This revision corrects additional operational defects that the first audit missed. It is supported by 47 passing source-engine tests, separate voltage/storage checks, and browser interaction evidence. It is **not a certification that every manufacturer's technical value or every iOS device behavior is correct**.

Use the patched package for review. Native iPhone/iPad Safari, Home Screen cold-open offline use, camera access, real-device sharing, and PDF download delivery remain acceptance gates. The cloud-browser PDF download event did not complete even though the application generated a PDF-ready link; that result is recorded as unresolved rather than passed.

## 1. Engineering audit

### Confirmed defects corrected

| Finding | Impact | Correction and evidence |
| --- | --- | --- |
| Three-phase voltage drop used twice the appropriate resistive factor | Approximately doubled the result under the one-way-length convention | Balanced three phase uses √3; single phase uses 2. Actual function checked at both 20°C and 75°C, including invalid inputs. |
| The AWG resistance table represented 20°C without an operating-temperature correction | Understated resistance when conductors are hotter | Explicit copper temperature selector and R(T) correction. Temperature is labeled as an assumption, not an ampacity approval. |
| Survey recommended a longer downtube in a blade-clearance warning | Suggested a change that further reduces floor clearance | Wording corrected. Test verifies the contradictory recommendation is absent. |
| Motor FLA alone produced a nominal breaker recommendation | Could be mistaken for an approved VFD supply/protection design | Output is now a reference load tally; protective-device selection remains unverified and can be recorded from an approved design/manual. |
| An assumed 20A circuit could silently change the selected power source | Altered entered survey scope without a deliberate decision | Removed automatic switching and the assumed-capacity lock. Test verifies the selected source remains unchanged. |
| Other-voltage input current was extrapolated from the 480V motor table, including single phase | Presented an unsupported input-current inference as a specification | Unverified supplies show no inferred input current. The inherited 480V motor table is explicitly a reference inventory. |
| Cable takeoff ignored routing detours and manual bends | Under-counted a drawn route | Sum actual route-segment lengths, then apply the separately labeled 15% allowance. A 200ft routed example returns 230ft including allowance. |

### Technical limits that remain explicit

The app does not approve a mounting structure, a sprinkler arrangement, a circuit protective device, or a VFD parameter set. Fan dimensions, drive model, firmware, nameplate data, and the matched installation manual must agree. The previous diameter-versus-blade-height heuristic is now labeled as planning guidance, not a universal code or manufacturer limit.

Manuals and field notes remain available. Their retention does not constitute independent validation of every numerical entry. Conflicting factory versus field values in the inherited data remain visible for review rather than being silently reconciled.

Primary documents reviewed support separating drive input protection from motor-reference data and treating HVLS sprinkler requirements as scoped, manufacturer-specific guidance. See the sources at the end of this report.

### Checked voltage-drop examples

10 AWG table resistance: 0.100 Ω/100ft at 20°C. One-way length: 100ft. Current: 10A. Resistive calculation only; reactance and power factor are excluded.

R(T) = R20 × [1 + 0.00393 × (T - 20)]. The 75°C multiplier is 1.21615.

| Supply | At 20°C | At 75°C |
| --- | --- | --- |
| 240V single phase | 2.000V / 0.833% | 2.432V / 1.013% |
| 480V balanced three phase | 1.732V / 0.361% | 2.106V / 0.439% |

## 2. Layout operation and design audit

### Browser reproduction and retest

1. Opened Layout and placed two fans using its actual Add → Fan control and canvas clicks.
2. Reloaded the page. Both fans disappeared in the previous build. This is a confirmed browser-reproduced data-loss defect.
3. Added reliable drawing-state saves and lifecycle flushing. Repeated the two-fan placement and immediate reload. Both fans remained.
4. Selected a fan, dragged it, and used Undo through the actual interface.
5. Drew and closed a four-wall outline. Exported the portable job file. Its saved payload contained two fans and four walls.
6. Turned the fan layer off through the Layers panel. The canvas hid the fans while retaining the underlying fan count. Reopening after reload retained the layer selection.
7. Reviewed Fit at 390 × 844 CSS pixels. The plan fits between the fixed header and lower drawing controls.

This is browser interaction evidence, not real iPhone hardware or multi-touch evidence. Pinch mathematics is covered separately by the source-engine suite.

### Additional Layout defects corrected

| Finding | Correction | Verification |
| --- | --- | --- |
| New drawings did not consistently trigger saving | Debounced persistence for rendered changes; pagehide and visibility flushing; visible save state | Placement/reload browser retest and engine test |
| Undo omitted junctions and column-grid metadata | Restore taps, grid metadata, numbering and wall-chain endpoints | Junction, grid, fan and wall-chain undo/redo tests |
| Touch cancellation or a second finger could discard a drag's undo checkpoint | Commit an active drag before pinch; handle cancellation and mouse release outside the canvas | Source inspection plus pinch/gesture engine checks; real iOS cancellation still pending |
| Taps could detach from their trunk and were omitted from rotation | Store trunk attachment/fraction; project tap drags to the trunk; rotate junctions | Endpoint movement, deletion and rotation tests |
| Deleting a trunk could leave dependent junctions/branches | Cascade dependent drawing connections, with Undo recovery | Delete/undo regression test |
| Deleted photo bytes made Undo unable to restore the image | Retain bytes when removing the reference, preserving undo and other plans | Source correction; browser camera/photo lifecycle still pending |
| Canvas image-export offsets were not scaled correctly | Correct world-to-screen translation at export scale | Projection regression check; browser canvas reviewed separately |
| Fit could use space covered by fixed controls | Fit within a reserved usable drawing region | Phone-sized bounds test and actual 390px browser review |
| Off-screen sheets remained in the accessibility tree | Inert hidden panels, named dialogs, close controls, accessible undo/redo/menu names | Browser tree confirms hidden sheets no longer expose all controls |

### Layers

Layers now include fans, walls, rooms, columns, racking/fills, panels/controllers, FA/comm wiring, and the background plan. Existing chain, dimension, grid and column-offset controls remain.

Visibility is saved per plan. Hidden objects are excluded from hit-testing and drawing exports. Layer visibility does not delete engineering data or remove routing obstacles from the underlying model. The PDF's full fan schedule intentionally includes all fan records and is labeled accordingly.

### Export status

Portable job export was downloaded and parsed: two fans, four walls, layer state, and the expected plan structure. The PNG/PDF geometry uses the corrected canvas translation. The PDF action generates a file and presents a visible download fallback when file sharing is unavailable. Browser download completion for the PDF remains unresolved in this cloud environment and is not counted as passed. The old print-only method is no longer the sole path for Layout, Survey or Materials PDF output.

## 3. Estimate, Survey, Materials and Tech Pro audit

### Estimate

Nine engine checks pass: complete cost basis; 30% margin/42.9% markup; a partially missing rate table; legacy versus reviewed zero rates; an explicit zero override; custom-fan missing/zero labor; mixed-scope counts and finite schedules; escaped names; and override restoration through the real save/restore closure.

Additional corrections: unrelated scope edits no longer clear every manual override; miscellaneous lines use stable IDs; custom-field edits invalidate the displayed result; and travel tiers are labeled as planning allowances rather than live hotel prices. Scope and fan inputs move ahead of travel inputs on the working screen. Existing workday heuristics remain estimating assumptions, not a validated productivity model.

### Survey

Eight engine checks pass: after-hours unknown/yes/no cycling; corrected downtube warning; missing-height behavior; no unsupported supply-current scaling; no FLA-only breaker approval; no assumed panel source; explicit reference-load grouping; and no automatic power-source changes.

Unknown answers stay unverified. The summary does not equate an absence of detected issues with an inspection pass. Survey PDF output now generates an actual document rather than depending solely on browser printing. Actual iOS file delivery remains pending.

### Materials

Seven engine checks pass: EMT sticks-to-footage conversion; by-foot units; companion nuts following box clips; retaining a manually selected nut quantity; excluding unselected items from exports; escaping HTML while retaining normal plain text; and generating a parseable PDF payload.

Copy/share failures now have a handled path. The export overlay sits above the application navigation. Print remains an optional browser action; Save/Share PDF has a separate file-generation path. Native Mail/Messages delivery has not been exercised and no messages were sent.

### Tech Pro

The voltage-drop function was checked independently of UI formatting. Ohm's Law now rejects non-finite values and division by zero. Saved technical customizations load again instead of always being replaced with defaults on restart.

The inherited Gemini 1.5 Flash endpoint is retired according to Google's documentation. The model is now configurable, with a current documented Flash default. A missing key opens setup instead of attempting an unauthenticated fallback. No paid AI request was made, so the live AI service path remains unverified. Restricted client-side keys remain supported as requested; no backend was added.

### Technical-link inventory

111 unique technical reference URLs were inventoried. Of these, 101 returned HTTP 200 to a HEAD request; two SkyBlade pages returned HTTP 403; eight YouTube links were recorded without content verification. HTTP 200 confirms reachability at check time, not that a document is the correct model, revision or language. The 403s are access failures, not proof of bot detection or permanent broken links.

## 4. Data, offline and architecture audit

The stack stays static HTML/JS. There is no build pipeline, database server, account system, team permission model or cloud sync.

Structured records are held in browser storage through job-scoped keys. Photos remain in IndexedDB. The conservative adapter avoids a destructive conversion of all old tool engines. Legacy tool records stay untouched until deliberately recovered into a selected project. Layout plans are alternatives inside that project, rather than a second project list.

Separate storage tests pass for project isolation, explicit legacy recovery, refusal to overwrite destination tool records, version guards, complete photo payload export/restore, missing-photo reporting, secret exclusion, and unchanged records following an invalid-version import.

All required local runtime dependencies, fonts and PDF code are included in the service-worker asset list. External manuals, maps, videos and AI remain network-dependent. Changing the GitHub Pages origin would not automatically transfer browser-held work.

**Offline acceptance remains open:** this preview is HTTP, so it cannot establish service-worker installation and cold-start behavior on the user's HTTPS iPhone Home Screen app. Native storage eviction, large photo collections, interrupted device restores, and simultaneous editing of the same tool in multiple tabs also need device-level testing. One active editing tab per tool is the supported review workflow for this revision.

## 5. Visual design, usability and marketing fit

The app is an owner-operator field workspace, not a customer portal or proposal funnel. No accounts, promotional interruptions or team dashboards were added.

The phone's active project and working tools now appear before the decorative hero when a project exists. Layout uses a full-screen drawing surface, a dedicated drawing dock, named layer controls, explicit save state, and a Fit operation that respects fixed toolbars. Daylight and dark modes remain available. Touch controls and photo actions have clearer names and larger targets.

The interface has been reviewed at desktop, 390px phone, and tablet widths. These are responsive browser reviews. They do not establish VoiceOver compliance, physical-finger accuracy, outdoor contrast, or iOS keyboard/camera behavior. Contrast measurements and a complete screen-reader certification were not performed.

Marketing work is intentionally limited to a consistent professional identity and readable job outputs. Supplier RFQs, lead capture, customer logins, estimate-versus-actual learning, and branded sales proposals remain outside the immediate scope.

## 6. Acceptance ledger and next gate

| Area | Evidence available | Status |
| --- | --- | --- |
| Layout source engine | 23 passing operational checks | Passed within source-test scope |
| Estimate source engine | 9 passing checks | Passed within source-test scope |
| Materials source engine | 7 passing checks, PDF payload generated | Passed within source-test scope |
| Survey source engine | 8 passing checks | Passed within source-test scope |
| Layout placement and reload | Actual browser reproduction before patch; successful retest afterward | Passed in Chromium preview |
| Drag/Undo and closed wall outline | Actual UI actions; parsed portable export | Passed in Chromium preview |
| Layer hide/reload and phone Fit | UI and source evidence | Passed within tested scope |
| Project/photo backup | Storage tests with IndexedDB test implementation | Passed within test scope |
| Technical links | 101 HTTP 200; 2 HTTP 403; 8 video URLs unverified | Reachability inventory completed |
| Manufacturer values/procedures | Source review and selected primary-document checks | Not individually certified |
| PDF download completion | PDF-ready link displayed; cloud download did not complete | Unresolved delivery gate |
| Real iOS Safari/Home Screen | No physical iOS runtime available in this environment | Not tested |
| Camera/native file sharing | Native device paths require actual iOS | Not tested |
| Airplane-mode cold opening | Requires HTTPS installation and actual device | Not tested |

### Required next acceptance run

On the hosted iPhone build: install the offline pack, cold-open in airplane mode, create a plan, place/edit/move objects, pinch/pan, toggle layers, undo/redo, attach a camera/library photo, export the three PDFs and a full backup, close/reopen, and restore that backup. Repeat the core drawing sequence in iPad portrait and landscape. These results must be recorded before calling the application field-ready.

The revised package includes source-engine tests and this ledger so another reviewer can distinguish implemented fixes from tested behavior and remaining device gates. Optional annual-maintenance fan records remain a later phase.

## Sources reviewed

- [ABB ACH580-01 hardware manual](https://library.e.abb.com/public/3a6cc07bb1cd4a80a2cc0a9e9e944a9a/EN_ACH580-01_HW_E_screen.pdf): drive/input-cable protection and input-current selection context.
- [Big Ass Fans design guide](https://learn.bigassfans.com/design-guide): scoped sprinkler coordination and model-specific clearance context.
- [Big Ass Fans E-series installation guide](https://bigassfans.com/docs/eseries/eseries-install-guide-en.pdf): structural approval and installation checklist context.
- [Invertek E3 documentation](https://www.invertekdrives.com/variable-frequency-drives/optidrive-e3/support-resources): model-specific primary manual access.
- [Google model lifecycle guidance](https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting): Gemini 1.5 Flash shutdown information.
- [Google Gemini migration reference](https://github.com/google-gemini/gemini-skills/blob/main/skills/gemini-api-dev/references/migration.md): current model migration context.

