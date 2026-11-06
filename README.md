# Fan Guys Tools V2 - isolated test package

**Do not upload the `live-home-backup-patch/` folder into the V2 site.** Upload only the app root files and directories to `/Fan-Guys-Tools-V2/`. The separate patch folder contains a proposed replacement for the current live Home `index.html`, based on the originally attached live source. Compare it with the actual live file before applying.

## Storage isolation switch

`shared/store.js` defines `RELEASE_NAMESPACE='v2:'` in one place. All V2 localStorage keys, including project-scoped `fgt2:` keys, are physically prefixed with `v2:`. The Layout photo database is `v2:fanlayout_photos`. V2 does not read or write live localStorage or the live `fanlayout_photos` database. When replacing the live app after testing, set `RELEASE_NAMESPACE=''` and use the normal live app folder. Make a new full backup first. An existing V2 backup should be saved to Files before changing this switch; that switch does not itself migrate V2 data into live storage.

## Live backup migration

The original live Home backup omits Layout photos. `live-home-backup-patch/index.html` adds the full live photo database to its version 1 backup and stops if referenced photos are missing. Compare its source with the current deployed Home before replacing that one file. On your iPhone, create a new live Home backup, save the JSON in Files, then open the empty V2 test copy and select Settings -> Restore backup -> Import live backup. This reads the selected file only, copies its old drafts into the current project, and writes photos into the isolated V2 photo database. Check Survey, Estimate, Materials, Layout and photos by hand. An old backup made before the live patch cannot contain the missing Layout photos.

## Independent checks

Node.js is used only to run tests, not to build or deploy the app:

```
node verification/layout-engine.test.cjs
node verification/estimate-engine.test.cjs
node verification/materials-engine.test.cjs
node verification/survey-engine.test.cjs
node verification/v2-migration.test.cjs
```

The migration test includes a local IndexedDB test library under `verification/vendor/`; no install command is needed. Source tests run the shipped app code in a simulated browser. Test final behavior on an iPhone before replacing the live app.

## Layout plan imports

Layout now exposes Import PDF / photo floor plan in its menu. It lets you choose a PDF page and rasterizes that page locally using bundled PDF.js, or accepts an image. For accurate calibration, enter a known distance in feet, tap its two endpoints on the drawing, and verify a second dimension before laying out fans. The older full-image-width option remains available. The imported background is saved as compressed JPEG in the job record. For drawings with margins, measure the full imported page width rather than only the building footprint. The background can be locked after calibration to avoid dragging it while placing fans. Building footprints do not supply interior obstructions or mounting heights.

## Survey breaker planning

Circuit Summary shows Planning only - not verified, rounding 125% of the *reference* FLA to the next common ampere size. This is a planning number, not a breaker selection. Verify drive input, protective-device instructions and site conditions for the actual installation.

## Offline updates

Service-worker cache is `fanguys-field-v2-9`. It registers relative to the folder. Settings -> Check for app updates asks the worker to update; close all app tabs and reopen to activate a waiting version. Test an airplane-mode cold open on your iPhone.

## Your work

Each project has separate Survey, Estimate, Materials, Layout plans, VFD captures, and estimate labor-rate snapshots. Layout’s Plans are alternatives inside the active project. Archive keeps records recoverable.

For a low-risk migration, structured records continue to use browser localStorage behind a shared, job-scoped adapter. Layout photos remain in IndexedDB. This avoids converting every mature tool’s persistence engine at once. Storage is on your device, not GitHub. This release does not implement an IndexedDB-only record database.

Settings → Full backup includes every project, retained legacy records, global rates, technical customizations, and all locally available Layout photos. Missing photo references are reported. API keys are excluded. Keep regular backup files outside the app.

Restore validates the version and record structure before writing. Matching records are replaced after confirmation; unrelated records remain. It does not create duplicate import copies. Export your current backup first. There is no cloud synchronization.

## Offline and updates

The service worker installs local pages, scripts, fonts, icons, and React/Babel libraries. GitHub Pages supplies the HTTPS needed for installation. External manuals, maps, videos, catalog pictures and AI require a connection; no offline availability is claimed for them.

After changing files in the future, change CACHE in sw.js to a new version and update its FILES list if you add local assets. Existing tabs retain the current version until closed. Settings includes an update check. No build step is needed.

## Changes

- New responsive field workspace, original interactive six-blade SVG fan, shared project header/navigation, daylight/dark themes, reduced-motion support.
- Correct balanced three-phase voltage-drop factor; explicit copper temperature correction and checked examples.
- Corrected downtube warning and explicit unchecked survey states.
- Estimate overrides survive reload; custom fan overrides use stable IDs.
- Per-model/scope missing-rate protection; incomplete estimates cannot export as completed pricing checks.
- Complete job-scoped storage and deliberate legacy recovery.
- Photo-inclusive backup and validated restore.
- Zoom restrictions removed; custom fan attribute text escaped.
- Workdays, rental days, hotel nights, margin and markup displayed together.

## Scope

The original modules remain. The functional audit also repairs Layout persistence, Undo, layers, tap attachments, routed wire takeoffs and export projection; Survey supply/protection assumptions; and Materials quantity/export behavior. Manufacturer content has not been exhaustively revalidated.

47 source-level regression checks pass, including 23 Layout checks. Browser interaction verified placement, reload, move/Undo, wall drawing, layer visibility and JSON export. Real iOS hardware, HTTPS offline cold-start and native PDF/share delivery remain release gates. Use one editing tab per tool. See TEST-REPORT.md for the evidence and limits. Optional annual-maintenance fan records/QR labels are not included yet.

See TEST-REPORT.md for verification and remaining device checks.
