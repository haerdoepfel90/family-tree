# Family Tree

**COMING SOON**

## ToDo

### Frontend
- [x] **High** - Split `frontend-vite/src` into `pages/` and `components/`. `pages/` holds one module per routed page, defining that page's overall layout; `components/` holds reusable pieces used across pages, like `Tree`, tables, and drawers.
- [ ] **Low** - Wire up the header search input (`Layout.jsx`), is currently unusable.
- [ ] **Low** - Implement the landing page at `/`,  currently a placeholder.
- [ ] **Low** - Compute the "Generation" number on the detail page,  currently hardcoded as `--X--`.
- [ ] **Low** - extract a shared `useIndividualsAndFamilies` data-fetching hook, `Tree.jsx`, `TreeIndex.jsx`, `DetailPage.jsx`, and `ManagePage.jsx` each fetch individuals/families independently.
- [ ] **Medium** - add content for `/individuals` and `/families`.

### Styling
- [ ] **Medium** - Unify styling across pages and components

### Backend
- [ ] **Medium** - `GET /api/v1/individuals/{id}` returns `500` instead of `404` for a missing id.

### Features
- [ ] **Low** - Add `Events` storing and description