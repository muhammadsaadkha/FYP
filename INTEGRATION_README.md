# Find My Class — timetable + campus assistant integration

The supplied Find My Class project now includes an internal `/timetable` route and a shared campus assistant. The header's Timetable item opens the internal page in the same app; it no longer opens the public LGU timetable in a new tab.

## Run locally

Start the backend from `backend/` with `npm ci && npm start`. It uses the supplied `backend/.env` for MongoDB/JWT configuration. Start the frontend from `frontend/` with `npm ci && npm run dev`; the Vite proxy sends `/api/*` to `http://localhost:7000`.

## Timetable

`frontend/src/data/lguExactData.json` contains the exact imported LGU snapshot used by `/timetable`, including 211 semester/program/section combinations and 399 teacher records. The page supports Semester, Teacher, and Room views using the existing emerald/light theme and dark-mode variables.

## Assistant

`POST /api/chat` accepts `{ "message": "..." }`. Timetable questions retrieve exact semester, teacher, course, room, day, and time records from `backend/data/lguExactData.json`. Route questions in the form “from [start] to [destination]” retrieve existing campus locations from MongoDB and return a `/map?start=...&dest=...` deep-link. The map page preselects both endpoints using its existing Draw Route workflow.

## Validation

Frontend `npm run build` passes. Backend chat controller/app/route syntax checks pass. The chat API was verified through the Vite proxy with an exact timetable query and an exact campus-location route query. The existing backend test suite has one unrelated pre-existing corridor graph assertion failure (`services/corridorWalkGraph.test.js`, 45 passing and 1 failing).
