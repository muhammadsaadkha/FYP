# Find My Class integration plan

## Product scope

Integrate the exact LGU timetable snapshot into the supplied Find My Class project. Add a first-party `/timetable` route and replace the existing external Timetable header link with an internal navigation link. Preserve the existing emerald/light theme and reuse its spacing, typography, surfaces, borders, buttons, and dark-mode variables.

Add a grounded university assistant available from the shared layout. Its retrieval layer searches the exact timetable snapshot plus the project's campus datastore. It answers semester/program/section, teacher, subject/course, room, and classroom schedule questions with source-backed records. For route questions it searches existing navigation locations and returns a deep link to the existing `/map` route with start/destination IDs so the established project pathfinding UI can draw the route.

## Implementation approach

- Frontend: `TimetablePage.jsx` owns the three in-page timetable workflows; `ChatbotWidget.jsx` is rendered by `Layout.jsx`; `App.jsx` adds `/timetable`.
- Existing header: `Nav.jsx` changes the external anchor to a `NavLink`/`Link` pointing to `/timetable` in desktop and mobile menus.
- Backend: `routes/chat.js` and `controllers/chatController.js` implement retrieval and grounded response composition. The controller combines exact timetable JSON retrieval with MongoDB classroom/building/navigation-location lookup.
- Navigation integration: chatbot route answers expose `/map?start=<id>&dest=<id>` deep links. `MapPage.jsx` consumes the start/destination query parameters, preselecting the same endpoints used by its existing Draw Route control.
- Data: `frontend/src/data/lguExactData.json` drives the browser timetable UI; `backend/data/lguExactData.json` drives server-side chat retrieval. No runtime dependency on the public timetable portal is required.

## Design

**Design movement:** restrained civic wayfinding — a calm emerald-and-paper interface that makes academic schedules feel like dependable campus infrastructure.

**Core principles:** preserve the existing project's visual language; show source records before prose; keep timetable and route actions in-page; make chat answers concise, inspectable, and actionable.

**Color philosophy:** retain the existing emerald primary and neutral paper/surface palette; timetable uses only existing brand tokens so it belongs to the host website rather than looking like a separate product.

**Layout paradigm:** a compact tabbed workspace for timetable views, with a two-column desktop layout that collapses to a single scrollable flow on mobile; chatbot is a small docked assistant rather than a full-screen replacement.

**Interaction philosophy:** dependent selectors mirror the original LGU workflow; every chatbot answer includes a source type, a direct result card, and an optional action link.

## Project structure

- `frontend/src/pages/TimetablePage.jsx`: exact timetable selectors and schedule result views.
- `frontend/src/components/ChatbotWidget.jsx`: shared grounded assistant UI.
- `frontend/src/services/chatService.js`: frontend API client.
- `backend/controllers/chatController.js`: retrieval, intent routing, schedule matching, and campus-location matching.
- `backend/routes/chat.js`: `/api/chat` endpoint.
- `frontend/src/data/lguExactData.json`, `backend/data/lguExactData.json`: exact imported LGU records.
