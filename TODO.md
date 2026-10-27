# Find My Class integration TODO

- [x] **Internal timetable route and header integration** — The website header shows a Timetable item in both desktop and mobile navigation; it opens the same website at `/timetable` rather than an external tab, and the timetable uses the existing website color/theme system.
- [x] **Exact timetable workflows** — `/timetable` supports the original dependent Semester → Program → Section flow, Teacher department → teacher lookup, and Room Day/Week views; selected results show the exact imported LGU course, room, teacher, day, and time records in-page.
- [x] **Grounded university chatbot** — The shared chatbot is available from the project layout and answers timetable questions for sections, programs, semesters, teachers, subjects/courses, and rooms using retrieved source records rather than invented data.
- [x] **Campus route answers** — Route questions search the project's campus datastore, identify start/destination locations when possible, and provide a working link to the existing map route with matched endpoints preselected.
- [ ] **Backend/frontend validation** — Frontend build and backend syntax/API checks pass; the new API route and `/timetable` preview render without errors. The existing backend suite still has one unrelated corridor graph assertion failure (`services/corridorWalkGraph.test.js`), while 45 tests pass.
