# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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