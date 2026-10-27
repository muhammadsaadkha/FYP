Find My Class - frontend map fix

WHAT CHANGED
- Student map uses the saved vector geometry created in the admin map, not the original raster floor-plan image.
- Student view hides raster plan annotations, dimension text, roads, and neighboring houses that are baked into the source images.
- Student canvas uses dark grey (#2b2d30).
- Student map draws the campus boundary and saved building outlines, plus locations for the selected floor.
- Student map selector only offers Basement 2, Basement 1, Ground, First, Second, and Third floors. Admins retain all map options and original raster map editing view.
- Ground floor is the initial map selection.

REPLACE
This archive is the complete frontend source folder (without node_modules). Back up your current frontend folder, then replace its files with the contents of this archive's frontend folder. Do not delete the backend or project root files.

RUN
From the frontend folder:
  npm install
  npm run dev

IMPORTANT
A production build could not be completed in the file-inspection environment because the uploaded node_modules lacked Rollup's Linux optional binary. The modified JSX/JS syntax was checked separately. Test the app with your own installed dependencies and existing backend/database, which provide the admin-saved building outlines and floor locations.
