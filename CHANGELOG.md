# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## [0.2.0] - YYYY-MM-DD

### Backend

**Added**
- Added `/documents` endpoints for document upload and manipulation:
  - `POST /api/v1/documents` — upload a document
  - `GET /api/v1/documents/{id}` — get a document with its links
  - `PATCH /api/v1/documents/{id}` — update metadata
  - `DELETE /api/v1/documents/{id}` — delete a document
  - `POST /api/v1/documents/{id}/links` — link to a subject
  - `DELETE /api/v1/documents/{id}/links` — unlink from a subject

**Changed**
- Moved endpoint groups into router modules in backend/routers
- Consistently renamed endpoints to REST conventions (renamed /create endpoints)
- Changed project structure (moved /data and /shared under backend)


**Fixed**
- Parametrized id values in SQL injection for individual and document get and delete endpoints (were using f-strings before).
- Added missing type hint for document_id in get_document path.


**Removed**
- Removed unused `/tree` api endpoint.
- Removed deprecated `/manage` api endpoint for unused manage page



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