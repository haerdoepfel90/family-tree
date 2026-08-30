# Family Tree

**COMING SOON**

## ToDo

### Frontend
- [x] **High** - Split `frontend-vite/src` into `pages/` and `components/`. `pages/` holds one module per routed page, defining that page's overall layout; `components/` holds reusable pieces used across pages, like `Tree`, tables, and drawers.
- [ ] **Low** - Wire up the header search input (`Layout.jsx`), is currently unusable.
- [x] **Low** - Implement the landing page at `/`,  currently a placeholder.
- [x] **Medium** - add content for `/individuals`.
- [ ] **Medium** - add content for  `/families`.
- [ ] **Medium** - `IndividualDetail` doesn't refresh its Fotos/Dokumente tiles after editing a document or its links; requires a manual reload.
- [ ] **Low** - none of the frontend API calls (`updateIndividual`, `uploadPortrait`, `updateDocument`, `linkDocument`, `unlinkDocument`, `uploadDocument`) check `response.ok` — failures fail silently.
- [ ] **Low** - remove unused `useAsyncError` import in `IndividualDetail.jsx`.
- [ ] **Low** - Compute the "Generation" number on `IndividualDetail`/`TreeIndex`, currently hardcoded as `--X--`/`XX Generationen`.
- [ ] **Low** - extract a shared `useIndividualsAndFamilies` data-fetching hook — `Tree.jsx`, `TreeIndex.jsx`, `IndividualDetail.jsx`, `ManagePage.jsx`, `HomePage.jsx`, `IndividualsIndex.jsx`, and `DocumentEditor.jsx` (via `getIndividuals`) each fetch individuals/families independently.
- [ ] **High** - add a Document section button in `IndividualDrawer`


### Styling
- [ ] **Medium** - Unify styling across pages and components

### Backend
- [ ] **Medium** - `GET /api/v1/individuals/{id}` returns `500` instead of `404` for a missing id.
- [ ] **Medium** - Implement Generation Number and number of ancestors

### Features
- [ ] **Low** - Add `Events` storing and description
- [ ] **Low** - Implement "ON THIS DAY" section on homepage.