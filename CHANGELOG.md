# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## [0.4.0] - 2026-08-28

### Frontend
**Added**
- Added `:root` variables in `index.css` for unified styling across pages and ui-elements.
- Added `/src/components/ui/` to create modules for unified ui-elements. Current list of elements:
  - `LinkTag` -> a tag-like element that shows an existing link to another record, with an optional remove (×) button; renders as an "add link" prompt when nothing is linked yet.
  - `PersonCardPortrait` -> a card like element which renders a image with a label below it.
- Added `Modal` component, usable throughout the app for e.g. `DocumentEditor` or `DocumentUploader`.
- Added Homepage content on `"/"` (ON THIS DAY section still a placeholder).
- Adapted HomePage to show a random subset of 15 people on page load.
- Added Styling to `TreeIndex`.
- Added `IndividualsIndex` under `/individuals`, replacing `/manage`.
- Added `IndividualDetail` under `/individual/detail/:id`, replacing `DetailPage`.
- Added edit person modal, accessible through `IndividualDetail`.
- Added `DocumentEditor` and `DocumentUploader`.

**Changed**
- Migrated `/detail/:id` to `/individual/detail/:id`.
- Moved the "Bearbeiten" button on `IndividualDetail` into the top identity card.
- Header stays fixed at the top while scrolling.

**Fixed**
- `IndividualDetail` crashed when a linked document/photo had no `date` set.

### Backend

**Changed**
- `GET /api/v1/individuals` now orders by `given_name, birth_date` (was `birth_date, given_name`).


## [0.3.0] - 2026-08-26

### Frontend
**Added**
- Added landing page at `/` (placeholder for now).
- Added option `given` to `formatName` which returns a person's given name.
- Added `DELETE /api/v1/families/{id}` endpoint.
- Wired up delete for individuals and families in `ManagePage`: a confirmation prompt, calling the respective `DELETE` endpoint, then closing the drawer and refreshing the tables on success.
- Addded `IndividualsIndex` content on `/individuals`.

**Changed**
- Migrated frontend routing from `react-router-dom` to `react-router` v8.
- Restructured routes to use a shared `Layout` component to have a shared header.
- Moved root-tree index from `/` to `/trees`.
- Split family tree view out of `App.jsx` into dedicated modules.
- Moved `findRootFamilies` from `App.jsx` into `lib/relatives.js`.
- Extracted `TreeIndex` out of `App.jsx` into its own module and replaced `nameOf` with `formatName`.
- Replaced inline computing of relatives arrays in `PersonDetail.jsx` with `getRelatives`.
- Replaced `given_name_full` computation in `getPersonData` with `formatName(person, "given")`.
- Split `FamilyDrawer` and `IndividualDrawer` into dedicated modules out of `ManagePage`.
- Replaced `getIndividualName` in `ManagePage.jsx` with `formatName`.
- Unified the `.drawer`/`.person-detail` sliding side panels into a shared `Drawer` component, with `FormDrawer` wrapping the form-specific chrome used by `IndividualDrawer`/`FamilyDrawer`.
- Split `/src` into `/pages` and `/components`
- Wrapped `loadTables` in `useCallback` in `ManagePage`.

## [0.2.0] - 2026-08-24

### Backend

**Added**
- Added `/documents` endpoints for document upload and manipulation:
  - `POST /api/v1/documents` — upload a document
  - `GET /api/v1/documents/{id}` — get a document with its links
  - `PATCH /api/v1/documents/{id}` — update metadata
  - `DELETE /api/v1/documents/{id}` — delete a document
  - `POST /api/v1/documents/{id}/links` — link to a subject
  - `DELETE /api/v1/documents/{id}/links` — unlink from a subject

- New `/individuals/{id}/documents` endpoint to get all documents linked to a individual

**Changed**
- Moved endpoint groups into router modules in backend/routers
- Consistently renamed endpoints to REST conventions (renamed /create endpoints)
- Changed project structure (moved /data and /shared under backend)


**Fixed**
- Parametrized id values in SQL injection for individual and document get and delete endpoints (were using f-strings before).
- Added missing type hint for document_id in get_document path.


**Removed**
- Removed unused `/tree` api endpoints.
- Removed deprecated `/manage` api endpoint for unused manage page


### Frontend

**Added**
- Individual detail page (`/detail/:id`) showing portrait, life dates, relationships and linked documents.
- Link to the detail page from the tree's person sidebar panel.


**Changed**
- Consolidated frontend helper functions into a single `src/lib` module to deduplicate them:
  - `people.js` —> `getPersonByID`, `formatName`
  - `relatives.js` —> `getRelatives`

## [0.1.0] - 2026-08-22

### Backend
**Added**
- FastAPI backend with SQLite storage for `individuals` and `families`.
- CRUD endpoints for `individuals` and `families`.
- Data model linking individuals to families (parent/child/spouse relationships) via a junction table.

### Frontend
**Added**
- React + Vite application scaffold (development only).
- Interactive family tree built with React Flow.
- Custom node positioning algorithm based on Reingold-Tilford and Buchheim-Walker algorithms.
- Management page (`/manage`) for creating and editing `individuals` and `families`.